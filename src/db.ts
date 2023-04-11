import Dexie, { liveQuery } from 'dexie';
import { getPublicKey } from './lib/nostr-tools';
import { queryName } from './lib/nostr-tools/nip05';
import { filterMap } from './utils/array';
import { yieldMicrotask } from './utils/sync';
export interface IProfile {
	pubkey: string;
	privkey?: string;
	name?: string;
	avatar?: string;
	nip05?: string;
	nip05Valid: boolean | null;
	/**
	 * "degree of separation"
	 *
	 *     0: our account
	 *     1: direct follow of one of our accounts
	 *     2: follow of a follow
	 *     ...
	 **/
	degree: number;
	index: number;
	fetching?: boolean;
	missing?: boolean;
	synced?: boolean;
}

export interface IConfig {
	key: string;
	value: string;
}

export interface IEvent {
	outbox?: true;
	id: string;
	pubkey: string;
	created_at: number;
	kind: number;
	tags: string[]; // the nostr tag elements get joined with '»' for searchability
	content: string;
	sig: string;
}

export interface INotification {
	pubkey: string;
	created_at: number;
	type: string;
	event: string;
}

export interface ITag {
	id: number;
	event: string;
	key: string;
	value: string;
}

export interface IMissing {
	requested: number;
	id: string;
}

export class NostroidDexie extends Dexie {
	profiles!: Dexie.Table<IProfile>;
	config!: Dexie.Table<IConfig>;
	events!: Dexie.Table<IEvent> & {
		getWithFallback: (id: string) => PromiseExtended<IEvent | undefined>;
	};
	tags!: Dexie.Table<ITag>;
	missingEvents!: Dexie.Table<IMissing>;

	constructor() {
		super('data4');
		this.version(22)
			.stores({
				profiles: '&pubkey, degree, index',
				config: '&key',
				events: '&id, pubkey, kind, created_at, [pubkey+kind], *tags',
				missingEvents: '&id',
				tags: '++id, event, key, value',
				notifications: '++id, pubkey'
			})
			.upgrade((tx) => {
				return tx
					.table('events')
					.toCollection()
					.modify((event) => {
						event.tags = event.tags.map((it) => it.split(',').join('»'));
					});
			});
		this.version(23).stores({
			profiles: '&pubkey, degree, index, name, nip05'
		});

		this.events.getWithFallback = (id) =>
			new Promise((resolve) => {
				this.events.get(id).then(async (event) => {
					if (event) resolve(event);
					await db.missingEvents.put(<IMissing>{ id: id });
					liveQuery(() => this.events.get(id)).subscribe((ev) => {
						if (ev) resolve(ev);
					});
					setTimeout(() => resolve(undefined), 10000);
				});
			});
	}

	public async nip05Valid(name: string, pubkey: string) {
		if (typeof name !== 'string' || name.length < 3) {
			return false;
		}
		let n = name;
		switch (name.indexOf('@')) {
			case -1:
				n = `_@${name}`;
				break;
			case 0:
				n = `_${name}`;
				break;
			default:
				n = name;
		}
		const qName = await queryName(n);
		console.log(`${name}->${n}->${qName}`);
		return qName === pubkey;
	}

	public async updateProfileFromMeta(pubkeys: string[]) {
		console.log(`updateProfileFromMeta(${pubkeys?.length})`);
		if (Array.isArray(pubkeys) && pubkeys.length === 0) {
			return;
		}

		const profiles = await db.transaction('rw', db.profiles, db.events, async () => {
			let profiles: Array<IProfile> = [];

			if (pubkeys) {
				// Avoids using IDBCursor. Recommended by Dexie's creator
				// source: https://github.com/dexie/Dexie.js/issues/1388#issuecomment-917367428
				profiles = (
					await Promise.all(pubkeys.map((key) => db.profiles.where('pubkey').equals(key).toArray()))
				).flat();
			} else {
				profiles = await db.profiles.toArray();
			}

			let metaDataEvents = new Map<string, IEvent>();
			(await db.events.where({ kind: 0 }).toArray())
				.sort((a, b) => b.created_at - a.created_at)
				.forEach((e) => {
					if (metaDataEvents.get(e.pubkey)) {
						// delete older metadata events if we already found one sorting
						// newest to oldest.
						db.events.delete(e.id);
					} else {
						metaDataEvents.set(e.pubkey, e);
					}
				});

			for (const p of profiles) {
				let metadataEvent = metaDataEvents.get(p.pubkey);
				let metadata = metadataEvent ? JSON.parse(metadataEvent.content) : undefined;
				if (metadata) {
					p.name = metadata.name || '';
					p.avatar = metadata.picture || '';
					p.nip05 = metadata.nip05;
					p.nip05Valid = null;
				}
			}

			db.profiles.bulkPut(profiles);

			return profiles;
		});

		this.validateNip05ProfilesNip05(profiles ?? []);
	}

	private async validateNip05ProfilesNip05(profiles: Array<IProfile>) {
		const profilesValidated = await Promise.all(
			filterMap(
				profiles,
				(item) => item.nip05 && item.nip05Valid === null,
				async (p) => {
					if (p.nip05) {
						p.nip05Valid = await this.nip05Valid(p.nip05, p.pubkey);
					}
					return p;
				}
			)
		);

		db.profiles.bulkPut(profilesValidated);
	}
}

export const db = new NostroidDexie();
db.on('populate', () => {
	const index = Math.floor(Date.now() / 1000);
	const debugProfiles = [];
	[
		'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Alice
		'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // Bob
	].forEach((it, id) => {
		debugProfiles.push({
			pubkey: getPublicKey(it),
			privkey: it,
			missing: true,
			degree: 0,
			index: index + id
		});
	});
	['46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184b16bd8ce4d'].forEach((it, id) => {
		debugProfiles.push({
			pubkey: it,
			missing: true,
			degree: 0,
			index: index + id + 2
		});
	});
	db.profiles.bulkAdd(debugProfiles);
});
