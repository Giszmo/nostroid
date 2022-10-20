/* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { relayPool } from 'nostr-tools';
// import { validateEvent } from 'nostr-tools';
import { relayPool, type RelayPool } from './lib/nostr-tools';
import { validateEvent } from './lib/nostr-tools';
import { db } from './db';
import type { IProfile, IEvent } from './db';
import { snooze, yieldMicrotask } from './utils/sync';
import { chunks, filterMap, filterTF, forEach } from './utils/array';
import { deepCloneObj } from './utils/clone';

const itemKinds = [0, 1, 3, 4, 5, 7];
export class $Data {
	public pool!: RelayPool;
	private allEventIds!: Set<IEvent['id']>
	// event buffer to batch verify and insert
	public events: (IProfile | IEvent)[] = [];
	constructor() {
		//!Empty
	}

	public async start() {
		this.allEventIds = new Set((await db.events.toArray()).map(it => it.id));
		// Use the `snooze` function to defer intensive code execution since
		// each of these calls happen synchronously
		this.storeEventsLoop()
		await snooze(50)
		this.loadAndWatchProfiles();
		await snooze(50)
		await db.updateProfileFromMeta();
		await snooze(50)
	}

	// check for work constantly
	private async storeEventsLoop(): Promise<never> {
		let delay = 500;
		const promiseQueue: Promise<unknown>[] = [];

		while (true){
			delay = 350;
			this.events = (Data.events as IEvent[]).filter(
				(value, index, self) => index === self.findIndex((t) => t.id === value.id)
			);

			const start = Date.now();
			const e = Data.events.splice(-500);

			if (e.length > 0) {
				// If we have events on the stack, reduce the delay
				delay = 250;

				forEach(e as IEvent[], (event) => {
					event.tags = event.tags?.map((it) => (it as unknown as string[]).join('»')) || [];
				});

				await db.events.bulkPut(e as IEvent[])
				const updatedProfiles = filterMap(e, (it) => (it as IEvent).kind === 0, (it) => it.pubkey);

				promiseQueue.push(db.updateProfileFromMeta(updatedProfiles));
			} else {
				// If there's no events on the stack - fetch for more
				// queueMicrotask helps ensure proper execution order
				queueMicrotask(()=>{
					Data.downloadMissingEvents();
					Data.broadcastOutbox();
				})
				await snooze(delay);
				continue;
			}

			await Promise.allSettled(promiseQueue);
			const dt = Date.now() - start;
			console.log(`It took ${dt}ms to store ${e.length} events.`);
			await yieldMicrotask();

			promiseQueue.length = 0;
			await snooze(delay);
		}
	}

	private async downloadMissingEvents() {
		Data.connectWS();
		// load missing profile meta data
		const profiles = (await db.profiles.toArray()).filter((it) => it.missing);
		if (profiles.length > 0) {
			profiles.forEach((it) => {
				delete it.missing;
				it.fetching = true;
			});
			await db.profiles.bulkPut(profiles);
			const profilesWithKey = profiles.map((it) => it.pubkey)
			const s = this.pool.sub({
				cb: Data.onEvent,
				filter: { authors: profilesWithKey , kinds: [0] }
			//@ts-expect-error The callback is supposed to be there, the type defs are wrong
			}, undefined, () => {
				s.unsub();
				db.profiles
					.where('pubkey')
					.anyOf(profilesWithKey)
					.modify((profile) => {
						delete profile.fetching;
					});
      });
		}
		// load events marked as missing (we only know their IDs)
		const events = (await db.missingEvents.toArray())
			// TODO: Should we try to get them again after a while? When relays change?
			.filter((it) => it.requested === undefined);
		if (events.length > 0) {
			console.log(`fetching ${events.length} missing events.`);
			const t = Date.now() / 1000;
			db.missingEvents.bulkPut(
				events.map((it) => {
					it.requested = t;
					return it;
				})
			);
			const s = Data.pool.sub({
				cb: Data.onEvent,
				filter: { ids: events.map((it) => it.id) }
				//@ts-expect-error The callback is supposed to be there, the type defs are wrong
			}, undefined, () => {
        s.unsub();
      });
		}
		await yieldMicrotask()
	}

	private async broadcastOutbox(): Promise<void> {
		Data.connectWS();
		// events
		const events = (
			await db.events
				.where('created_at')
				.above(Math.floor(Date.now() / 1000 - 60 * 60))
				.toArray()
		).filter((it) => it.outbox);
		if (events.length > 0) {
			console.log(events.length)
			events.forEach((e) => {
				delete e.outbox;
				const event = deepCloneObj(e);
				event.tags = (event.tags.map((it: string) => it.split('»')) as unknown) as string[];

				Data.pool.publish(event);
			});
			await db.events.bulkPut(events);
		}
		await yieldMicrotask()
	}

	public async loadAndWatchProfiles(): Promise<void> {
		this.connectWS();
		const profiles = await db.profiles.toArray();
		// "new" profiles are those we never synced ever
		// sync those from the beginning of time
		const [ newProfiles, oldProfiles ] = filterTF(profiles, (item) => !item.synced);
		const newKeys = newProfiles.map((it) => it.pubkey);
		const oldKeys = oldProfiles.map((it) => it.pubkey);
		const priorSyncTS = (await db.config.get(`priorSyncTS`))?.value;
		const syncFromTS = priorSyncTS || 0;
		const filters = [];
		if (newKeys.length > 0) {
			filters.push({
				authors: newKeys,
				kinds: itemKinds
			}, {
				'#p': newKeys,
				kinds: itemKinds
			});
		}
		if (oldKeys.length > 0) {
			filters.push(
				{
					authors: oldKeys,
					since: syncFromTS,
					kinds: itemKinds
				}, {
					'#p': oldKeys,
					since: syncFromTS,
					kinds: itemKinds
				}
			);
		}
		Data.pool.sub(
			{
				cb: Data.onEvent,
				filter: filters
			},
			'fromToAllProfiles',
			//@ts-expect-error The callback is supposed to be there, the type defs are wrong
			() => {
				// EOSE
				console.log('Synced all profiles');
				db.config.put({
					key: 'priorSyncTS',
					value: Math.floor(new Date().getTime() / 1000).toString()
				});
				// mark all profiles synced
				db.profiles
				.where('pubkey')
				.anyOf(profiles.map((it) => it.pubkey))
				.modify({ synced: true });

				Data.getRelevantProfiles();
			}
		);
	}

	private async getRelevantProfiles() {
		// here, an attempt is made to explore the nostr community for relevant
		// profiles. As the cost to create profiles, at least right now is zero,
		// there will be spam and impersonation and one way to protect against that
		// is to not consider what's outside the own social graph. If you follow the
		// bot, you probably want to receive its events. If you follow nobody who
		// follows somebody who follows somebody who follows the bot, it's probably
		// ok to not show its actions.
		// The degree of separation is defined as 0 for own accounts and +1 for each
		// follows-indirection required to get to it.
		// Degree 100 is considered unconnected.

		// of all the profiles we know, who is following whom?
		// Map<pubkey, List<pubkey>>
		const profileFollows = new Map(
			(await db.events.where('kind').equals(3).toArray()).map((it) => [
				it.pubkey,
				it.tags.filter((it) => it.startsWith('p»')).map((it) => it.split('»', 3)[1])
			])
		);
		const profiles = await db.profiles.toArray();

		// n-th degree follows' pubkeys
		const follows: Array<Set<string>> = [];
		// 0-th
		follows[0] = new Set(filterMap(profiles, (it) => it.degree === 0, (it) => it.pubkey));

		// n-th
		let all = new Set<string>();
		for (let i = 0; i < 10; i++) {
			all = new Set(follows.flatMap((it) => [...it]));
			if (all.size > 10000) {
				console.log(`Exploring ${all.size} follows to the ${i}-th degree ...`);
				break;
			}
			// 1st
			const fArray = Array.from(follows[i])
				.flatMap((it) => profileFollows.get(it)!)
				.filter((it) => !all.has(it));
			const newSet = new Set(fArray);
			if (newSet.size == 0) {
				console.log(
					`Exploring ${all.size} follows to the ${i}-th degree. No more follows found in the ${
						i + 1
					}-th degree ...`
				);
				break;
			}
			follows[i + 1] = newSet;
		}

		profiles.forEach((profile) => {
			if (all.has(profile.pubkey)) {
				// we have a degree. Store it!
				profile.degree = follows.findIndex((it) => it.has(profile.pubkey));
				// remove pubkey from `all`, to later store all those profiles as missing
				all.delete(profile.pubkey);
			}
		});
		// for the remaining pubkeys, request profiles
		all.forEach((pubkey) => {
			if (pubkey) {
				profiles.push((<IProfile>{
					pubkey: pubkey,
					missing: true,
					degree: follows.findIndex((it) => it.has(pubkey))
				}) as IProfile);
			}
		});

		// Chunk the profiles into batches and run `bulkPut` on each chunk
		// `bulkPut` is more efficient than regular `put`
		const batchedProfiles = chunks(profiles, 250);
		for (const chunk of batchedProfiles) {
			db.profiles.bulkPut(chunk);
		}

	}

	private rereceivedCounter = 0
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async onEvent(event: IEvent, relay: string): Promise<void> {

		// Check if there is an event ID, and if we already processed it
		if (event?.id && !Data.allEventIds.has(event.id)) {
			Data.allEventIds.add(event.id);
			Data.events.push(event);
		} else {
			Data.rereceivedCounter++;
		}
	}

	public connectWS(): void {
		if (this.pool) return;
		const relay = 'wss://relay.nostr.info';
		this.pool = relayPool();
		this.pool.addRelay(relay, { read: true, write: true });
	}

}
export const Data = new $Data()
