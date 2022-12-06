import { db, type IProfile } from './db';
import type { IEvent } from './db';
// import { getPublicKey } from 'nostr-tools'
// import {getEventHash, signEvent } from 'nostr-tools/event.js'
import { getPublicKey } from './lib/nostr-tools';
import { getEventHash, signEvent } from './lib/nostr-tools/event.js';
import { chunks, filterMap, filterTF, forEach } from './utils/array';

export const sendPersistEvent = async (kind, tags, content, privkey) => {
	let pubkey = getPublicKey(privkey);
	let e = <IEvent>{
		id: '',
		sig: '',
		pubkey: pubkey,
		created_at: Math.floor(Date.now() / 1000),
		kind: kind,
		tags: tags,
		content: content,
		outbox: true
	};
	let event = JSON.parse(JSON.stringify(e));
	event.tags = event.tags.map((it) => it.split('»'));
	event.id = getEventHash(event);
	e.id = event.id;
	e.sig = await signEvent(event, privkey);
	db.events.add(e);
	return e;
};

export const getDegreesForPubkeys = async (pubkeys: string[], profiles: IProfile[]) => {
	const profileFollows = new Map(
		(await db.events.where('kind').equals(3).toArray()).map((it) => [
			it.pubkey,
			it.tags.filter((it) => it.startsWith('p»')).map((it) => it.split('»', 3)[1])
		])
	);

	// n-th degree follows' pubkeys
	const follows: Array<Set<string>> = [];
	// 0-th
	follows[0] = new Set(pubkeys);

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

	profiles = profiles.map((profile) => {
		const deg = follows.findIndex((it) => it.has(profile.pubkey));
		profile.degree = deg > -1 ? deg : 100;
		return profile;
	});

	return profiles;
};

export const getEventRootId = async (event: IEvent) => {
	const eTags = event.tags.filter((it) => it.startsWith('e»'));
	const rootTag = eTags.find((it) => it.includes('root'));
	const id = rootTag ? rootTag.split('»', 3)[1] : eTags?.[0]?.split('»', 3)[1];
	return id;
};
