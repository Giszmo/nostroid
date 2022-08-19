import { mkPool, type RelayPool } from 'teahouse'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"
import { liveQuery } from "dexie"
import { tick } from 'svelte'
// const worker = new Worker(new URL('./worker.js', import.meta.url))

export class Data {
  private static _instance: Data = await Data.build();
  public pool: RelayPool|undefined = undefined

  // event buffer to batch insert
  public events: IEvent[]

  private constructor() {
      this.events = []
  }
  
  static private async build() {
    db.updateProfileFromMeta()
    const inst = new this()

    console.log({ inst })
    await inst.loadAndWatchProfiles()

    setInterval(() => {
      // worker.port.postMessage('test')
      inst.events = [...new Set(inst.events)]
      const e = inst.events.splice(-100)
      db.events.bulkPut(e)
      e.filter(it=>it.kind===0).forEach(m=>db.updateProfileFromMeta(m.pubkey))
    }, 1000)

    return inst;
  }
  
  async public loadAndWatchProfiles(): void {
    await this.connectWS()
    const profiles = await db.profiles.toArray()
    const newProfiles = profiles.filter(p=>!p.synced)
    const oldProfiles = profiles.filter(p=>p.synced)
    const newKeys = newProfiles.map(it=>it.pubkey)
    const oldKeys = oldProfiles.map(it=>it.pubkey)
    const priorSyncTS = (await db.config.get(`priorSyncTS`))?.value
    const syncFromTS = priorSyncTS
      // TODO: scan the last day as the user might not reset the timestamp in a long time
      ? priorSyncTS - 24 * 60 * 60
      : 0
    this.events = []
    const sub = (name, filter, keys) => {
        console.log(`sub`, { name, filter, keys })
      if (keys.length > 0) {
        this.pool.subscribe((e: Event) => {
            Data.instance.onEvent(e)
        }, name, filter);
      }
    }
    sub('fromNewProfiles', {authors: newKeys}, newKeys)
    sub('toNewProfiles', {'#p': newKeys}, newKeys)
    sub('fromnewProfiles', {authors: oldKeys, since: syncFromTS}, oldKeys)
    sub('tonewProfiles', {'#p': oldKeys, since: syncFromTS}, oldKeys)

    const syncInterval = setInterval(() => {
      if (Data.instance.events.length == 0) {
        console.log('Synced all profiles')
        clearInterval(syncInterval)
        db.config.put({
          key: 'priorSyncTS',
          value: (new Date().getTime()) / 1000
        })
        // mark all profiles synced
        db.transaction('rw', db.profiles, () => {
          db.profiles
            .where('pubkey')
            .anyOf(profiles.map(it=>it.pubkey))
            .modify({synced: true})
        })
      }
    }, 5 * 1000)

    console.log(`loadAndWatchProfiles`, { _: this })
  }
  
  async private onEvent(event: IEvent): void {
    await tick()
    Data.instance.events.push(event)
  }

  public async connectWS(): void {
    if (this.pool) return
    
  	const pool = mkPool()

    const relay = 'wss://relay.nostr.info'

    await pool.connect(relay, true);

    this.pool = pool
  }

  public static get instance() {
    return this._instance
  }
}
