import { relayPool } from 'nostr-tools'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"

export class Data {
  private static _instance: Data = new this()
  public pool

  // event buffer to batch insert
  public events: IEvent[] = []
  
  private constructor() {}
  
  public start() {
    db.updateProfileFromMeta()
    setInterval(() => {
      // worker.port.postMessage('test')
      Data.instance.events = [...new Set(Data.instance.events)]
      const e = Data.instance.events.splice(-5000)
      if (e.length > 0) {
        db.events.bulkPut(e)
        const updatedProfiles = e.filter(it=>it.kind===0).map(it=>it.pubkey)
        db.updateProfileFromMeta(updatedProfiles)
      }
      Data.instance.downloadMissingEvents()
      Data.instance.broadcastOutbox()
    }, 1000)
    this.loadAndWatchProfiles()
  }
  
  async private downloadMissingEvents(): void {
    this.connectWS()
    // profiles
    const profiles = (await db.profiles.toArray())
      .filter(it=>it.missing)
    if (profiles.length > 0) {
      profiles.forEach(it=>{
        delete it.missing
        it.fetching = true
      })
      await db.profiles.bulkPut(profiles)
      const s = Data.instance.pool.sub({
        cb: Data.instance.onEvent,
        filter: {authors: profiles.map(it=>it.pubkey), kinds: [0]}
      })
      setTimeout(() => {
        s.unsub()
        db.profiles
          .where("pubkey")
          .anyOf(profiles.map(it=>it.pubkey))
          .modify(profile => {
            delete profile.fetching
          })
      }, 10000)
    }
    // events
    const events = (await db.events.toArray())
      .filter(it=>it.missing)
    if (events.length > 0) {
      events.forEach(it=>{
        delete it.missing
        it.fetching = true
      })
      await db.events.bulkPut(events)
      const s = Data.instance.pool.sub({
        cb: Data.instance.onEvent,
        filter: {ids: events.map(it=>it.id)}
      })
      setTimeout(() => {
        s.unsub()
        db.events
          .where("id")
          .anyOf(events.map(it=>it.id))
          .modify(event => {
            delete event.fetching
          })
      }, 10000)
    }
  }
  
  async private broadcastOutbox(): void {
    this.connectWS()
    // events
    const events = (await db.events.where('created_at').above(Math.floor(Date.now() / 1000 - 60 * 60)).toArray())
      .filter(it=>it.outbox)
    if (events.length > 0) {
      events.forEach(e => {
        delete e.outbox
        Data.instance.pool.publish(e)
      })
      await db.events.bulkPut(events)
    }
  }
  
  async public loadAndWatchProfiles(): void {
    console.log('loadAndWatchProfiles()')
    this.connectWS()
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
    Data.instance.events = []
    const sub = (name, filter, keys) => {
      if (keys.length > 0) {
        Data.instance.pool.sub({
          cb: Data.instance.onEvent,
          filter: filter
        }, name)
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
  }
  
  async private onEvent(event: IEvent, relay: string): void {
    Data.instance.events.push(event)
  }

  public connectWS(): void {
    if (Data.instance?.pool) return
    const relay = 'wss://relay.nostr.info'
  	Data.instance.pool = relayPool()
  	Data.instance.pool.addRelay(relay, {read: true, write: true})
  }

  public static get instance() {
    return this._instance
  }
}