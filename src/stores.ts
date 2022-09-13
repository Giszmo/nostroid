import { db } from './db';
import type { IProfile } from './db';
import { liveQuery } from 'dexie';
import { writable } from 'svelte/store';

export const activeProfile = liveQuery(async (): Promise<IProfile | undefined> => {
  const pubkey = (await db.config.get('activePubkey'))?.value;
  if (pubkey) {
    const profile = await db.profiles.get(pubkey);
    if (profile) {
      return profile;
    }
  }
  return { name: '', pubkey: '', isAccount: false };
});

/**
 * A Map but whenever a value is missing, an attempt is made to retrieve it.
 **/
export class ProfileCache {
  // public constructor() {
  //   console.log('ProfileCache constructor()')
  // }

  public backing = new Map<string, IProfile>();

  public get(pubkey: string): IProfile {
    let profile = this.backing.get(pubkey);
    if (profile == undefined) {
      console.log(`pubkey ${pubkey} is missing ... Backing contained ${this.backing.keys.length} entries.`)
      profile = {
        pubkey: pubkey,
        missing: true,
        isAccount: false
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

let profiles = liveQuery(() => db.profiles.toArray());
profiles.subscribe(p => {
    cProfiles.update(old => {
      let newCache = new ProfileCache()
      newCache.backing = new Map(p.map(x => [x.pubkey, x]))
      return newCache
    })
})
// const onProfilesChanged = () => {
//   console.log(profiles);
//   console.log('here')
//   console.log(`new list of profiles is ${$profiles?.length} long.`)
//   // cProfiles.update(old => {
//   //   let newCache = new ProfileCache()
//   //   newCache.backing = new Map(...(p.map(x => [x.pubkey, x])))
//   //   return newCache
//   // })
// }
// $: {
//   profiles;
//   onProfilesChanged();
// }
