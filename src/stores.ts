import { db } from "./db"
import type { IProfile } from "./db"
import { liveQuery } from "dexie"

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
