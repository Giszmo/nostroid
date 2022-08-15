import { db } from "./db"
import type { IProfile } from "./db"
import { liveQuery } from "dexie"

export const activePubkey = liveQuery(async () => {
  return await db.config
    .get('activePubkey')
    .then((c?: IConfig) => c?.value ? c.value : '')
})

export const activeProfile = liveQuery(async () => {
  return await db.profiles
    .get($activePubkey)
    .then((c?: IConfig) => c?.value ? c.value : '')
})
