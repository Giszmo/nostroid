import { db } from './db';
import type { IProfile } from './db';
import { liveQuery, type Observable } from 'dexie';
import { derived, writable, type Readable } from 'svelte/store';

export const activeProfile:Observable<IProfile|undefined> = liveQuery(async (): Promise<IProfile | undefined> => {
  const pubkey = (await db.config.get('activePubkey'))?.value
  if (pubkey) {
    return await db.profiles.get(pubkey)
  }
  return undefined
});

/**
 * A Map but whenever a value is missing, an attempt is made to retrieve it.
 **/
export class ProfileCache {
  public backing = new Map<string, IProfile>();

  public get(pubkey: string): IProfile {
    let profile = this.backing.get(pubkey);
    if (profile === undefined) {
      console.log(`pubkey ${pubkey} is missing ... Backing contained ${this.backing.keys.length} entries.`)
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
}

/**
 * cProfiles stands for cached profiles
 * if we have a profile, cProfiles[pubkey] should hold it
 **/
export const cProfiles = writable(new ProfileCache());

const profiles = liveQuery(() => db.profiles.toArray());
profiles.subscribe(p => {
  console.log(`updating profile cache (->${p.length} profiles)`)
  cProfiles.update(old => {
    old.backing = new Map(p.map(x => [x.pubkey, x]))
    return old
  })
})
