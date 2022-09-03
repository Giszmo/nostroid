import { relayPool } from 'nostr-tools'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"
// const worker = new Worker(new URL('./worker.js', import.meta.url))

export class Data {
  private static _instance: Data = new this()
  public pool

  // event buffer to batch insert
  public events: IEvent[] = []
  
  private constructor() {
    db.updateProfileFromMeta()
    let testData = 4
    window.onunhandledrejection = function (event) {
  event.preventDefault();
  let reason = event.reason;
  console.warn('Unhandled promise rejection:', (reason && (reason.stack || reason)));
}
    if (typeof Worker === "undefined") {
        alert('no webworker')
    } else {
        let worker = new SharedWorker('service-worker.ts?type=1')
        worker.port.addEventListener('message', (e) => {
            console.log('worker said：', e.data)
        }, false)
        worker.port.start()
        console.log('worker started')
        window.worker = worker
    }
    setInterval(() => {
      console.log(`sending ${testData} to worker ...`)
      window.worker.port.postMessage(testData++)
      Data.instance.events = [...new Set(Data.instance.events)]
      const e = Data.instance.events.splice(-100)
      if (e.length > 0) {
        db.events.bulkPut(e)
        e.filter(it=>it.kind===0).forEach(m=>db.updateProfileFromMeta(m.pubkey))
      }
      Data.instance.loadMissingEvents()
    }, 1000)
    this.loadAndWatchProfiles()
  }
  
  async private loadMissingEvents(): void {
    this.connectWS()
    // profiles
    const profiles = (await db.profiles.toArray())
      .filter(it=>it.missing)
    if (profiles.length > 0) {
      profiles.forEach(it=>{
        delete it.missing
        it.fetching = true
      })
      db.profiles.bulkPut(profiles)
      .then(() => {
        const s = this.pool.sub({
          cb: Data.instance.onEvent,
          filter: {authors: profiles.map(it=>it.pubkey), kinds: [0]}
        })
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
      const s = this.pool.sub({
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
  
  async public loadAndWatchProfiles(): void {
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
    this.events = []
    const sub = (name, filter, keys) => {
      if (keys.length > 0) {
        this.pool.sub({
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
    if (this.pool) return
    const relay = 'wss://relay.nostr.info'
  	this.pool = relayPool()
  	this.pool.addRelay(relay, {read: true, write: true})
  }

  public static get instance() {
    return this._instance
  }
}