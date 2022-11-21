import { db } from './db';
import type { IProfile } from './db';
import { liveQuery, type Observable } from 'dexie';
import { get, writable } from 'svelte/store';
import { getDegreesForPubkeys } from './nostrHelper';

export const activeProfile: Observable<IProfile | undefined> = liveQuery(
	async (): Promise<IProfile | undefined> => {
		const pubkey = (await db.config.get('activePubkey'))?.value;
		if (pubkey) {
			return await db.profiles.get(pubkey);
		}
		return undefined;
	}
);

/**
 * A Map but whenever a value is missing, an attempt is made to retrieve it.
 **/
export class ProfileCache {
	public backing = new Map<string, IProfile>();

	public get(pubkey: string): IProfile {
		let profile = this.backing.get(pubkey);
		if (profile === undefined) {
			console.log(
				`pubkey ${pubkey} is missing ... Backing contained ${this.backing.keys.length} entries.`
			);
			profile = {
				pubkey: pubkey,
				missing: true,
				degree: 100
			} as IProfile;
			db.profiles.add(profile);
			this.backing.set(pubkey, profile);
		}
		return profile;
	}

	public set(s: string, p: IProfile) {
		return this.backing.set(s, p);
	}

	public async updateDegrees(profiles?: IProfile[]) {
		if (profiles === undefined) profiles = await db.profiles.toArray();
		const pubkey = (await db.config.get('activePubkey'))?.value;
		const profilesWithDegrees = await getDegreesForPubkeys([pubkey], profiles);
		this.backing = new Map(profilesWithDegrees.map((x) => [x.pubkey, x]));
		cProfiles.set(this);
	}
}

/**
 * cProfiles stands for cached profiles
 * if we have a profile, cProfiles[pubkey] should hold it
 **/
export const cProfiles = writable(new ProfileCache());

const profiles = liveQuery(() => db.profiles.toArray());
profiles.subscribe((p) => {
	console.log(`updating profile cache (->${p.length} profiles)`);
	get(cProfiles).updateDegrees(p);
});
