import { db } from "./db"
import type { IProfile } from "./db"
import { liveQuery } from "dexie"

export const activeProfile = liveQuery(async () => {
  return await db.config
    .get('activeProfile')
    .then((c?: IConfig) => c?.value ? c.value : '')
})
