import { db } from "./db"
import type { IProfile } from "./db"
import { liveQuery } from "dexie"
import { writable } from 'svelte/store'

export const activeProfile = liveQuery(async () => {
  const pubkey = (await db.config.get('activePubkey'))?.value
  if (pubkey) {
    const profile = await db.profiles.get(pubkey)
    if (profile) {
      return profile
    }
  }
  return {name: '', pubkey: ''}
})

/**
 * if we have a profile, profileCache[pubkey] should hold it
 **/
export const profileCache = writable(new Map<String, IProfile>())
