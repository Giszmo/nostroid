import { relayPool } from 'nostr-tools'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"

export class Data {
  private static _instance: Data = new this()
  public pool
  private lastEventTs = Date.now()

  // event buffer to batch insert
  public events: IEvent[] = []
  
  private constructor() {}
  
  public start() {
    this.storeEventsLoop()
    this.loadAndWatchProfiles()
    db.updateProfileFromMeta()
  }
  
  async private storeEventsLoop() {
    const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))
    while (true) {
      Data.instance.events = [...new Set(Data.instance.events)]
      const e = Data.instance.events.splice(-5000)
      const t = Date.now()
      if (e.length > 0) {
        await db.events.bulkPut(e)
        const dt = Date.now() - t
        console.log(`BulkPut took ${dt}ms for ${e.length} events.`)
        const updatedProfiles = e.filter(it=>it.kind===0).map(it=>it.pubkey)
        await db.updateProfileFromMeta(updatedProfiles)
      }
      Data.instance.downloadMissingEvents()
      Data.instance.broadcastOutbox()
      await snooze(500)
    }
  }
  
  async private downloadMissingEvents() {
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
    const events = (await db.missingEvents.toArray())
      .filter(it=>it.requested == undefined)
    if (events.length > 0) {
      console.log(`fetching ${events.length} missing events.`)
      const t = Date.now() / 1000
      db.missingEvents.bulkPut(events.map(it=>{it.requested=t; return it}))
      const s = Data.instance.pool.sub({
        cb: Data.instance.onEvent,
        filter: {ids: events.map(it=>it.id)}
      })
      setTimeout(() => {
        s.unsub()
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
        const event = JSON.parse(JSON.stringify(e))
        event.tags=event.tags.map(it=>it.split('»'))
        Data.instance.pool.publish(event)
      })
      await db.events.bulkPut(events)
    }
  }
  
  async public loadAndWatchProfiles(): void {
    this.connectWS()
    const profiles = await db.profiles.toArray()
    // "new" profiles are those we never synced ever
    // sync those from the beginning of time
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
    const filters = []
    const kinds = [0,1,3,4,5,7]
    if (newKeys.length > 0)
      filters.push(
        {authors: newKeys, kinds: kinds},
        {'#p': newKeys, kinds: kinds})
    if (oldKeys.length > 0)
      filters.push(
        {authors: oldKeys, since: syncFromTS, kinds: kinds},
        {'#p': oldKeys, since: syncFromTS, kinds: kinds})
    Data.instance.pool.sub({
      cb: Data.instance.onEvent,
      filter: filters
    }, 'fromToAllProfiles')
    // finish sync. mark all profiles as synced with timestamp.
    // timestamp is stored once in config, while profiles that were synced this
    // time are being marked as "synced"
    const syncInterval = setInterval(() => {
      if (Date.now() - Data.instance.lastEventTs > 3000) {
        console.log('Synced all profiles')
        clearInterval(syncInterval)
        db.config.put({
          key: 'priorSyncTS',
          value: (new Date().getTime()) / 1000
        })
        // mark all profiles synced
        db.profiles
          .where('pubkey')
          .anyOf(profiles.map(it=>it.pubkey))
          .modify({synced: true})
        this.getRelevantProfiles()
      }
    }, 200)
  }
  
  async private getRelevantProfiles() {
    // here, an attempt is made to explore the nostr community for relevant
    // profiles. As the cost to create profiles, at least right now is zero,
    // there will be spam and impersonation and one way to protect against that
    // is to not consider what's outside the own social graph. If you follow the
    // bot, you probably want to receive its events. If you follow nobody who
    // follows somebody who follows somebody who follows the bot, it's probably
    // ok to not show its actions.
    // The degree of separation is defined as 0 for own accounts and +1 for each
    // follows-indirection required to get to it.
    // Degree 100 is considered unconnected.
    
    // of all the profiles we know, who is following whom?
    const profileFollows = new Map((await db.events
      .where('kind')
      .equals(3)
      .toArray())
      .map(it => [
        it.pubkey,
        it.tags.filter(it=>it.startsWith('p»')).map(it=>it.split('»',3)[1])
      ]))
    
    const profiles = await db.profiles.toArray()

    // n-th degree follows' pubkeys
    const follows: Array<Set<string>> = []
    // 0-th
    follows[0] = new Set(profiles
      .filter(it=>it.degree == 0)
      .map(it=>it.pubkey))
    
    // n-th
    var all = new Set()
    for(let i = 0; i<10; i++) {
      all = new Set(follows.flatMap(it=>[...it]))
      if (all.size > 10000) {
        console.log(`Exploring ${all.size} follows to the ${i}-th degree ...`)
        break
      }
      // 1st
      let fArray = [...follows[i]]
        .flatMap(it => profileFollows.get(it))
        .filter(it => !(all.has(it)))
      let newSet = new Set([...fArray])
      if (newSet.size == 0) {
        console.log(`Exploring ${all.size} follows to the ${i}-th degree. No more follows found in the ${i+1}-th degree ...`)
        break
      }
      follows[i + 1] = newSet
    }
    
    profiles.forEach(profile=>{
      if (all.has(profile.pubkey)) {
        // we have a degree. Store it!
        profile.degree = follows.findIndex(it=>it.has(profile.pubkey))
        // remove pubkey from `all`, to later store all those profiles as missing
        all.delete(profile.pubkey)
      }
    })
    // for the remaining pubkeys, request profiles
    all.forEach(pubkey=>{
      if (pubkey) {
        profiles.push(<IProfile>{
          pubkey: pubkey,
          missing: true,
          degree: follows.findIndex(it=>it.has(pubkey))
        } as IProfile)
      }
    })
    // TODO: Somehow there are two rogue profiles:
    // {"pubkey":"messages","degree":2,"synced":true}
    // {"missing":true,"degree":2}
    // the former really does exist and I'm not sure what re-creates it.
    // the latter ... I have no idea but it smells like a bigger issue.
    profiles.forEach(it=>{
      // console.log(`putting ${JSON.stringify(it)}`)
      db.profiles.put(it)
    })
    // db.profiles.bulkPut(profiles)
  }
  
  async private onEvent(event: IEvent, relay: string): void {
    event.tags = event.tags.map(it=>it.join('»'))
    Data.instance.events.push(event)
    Data.instance.lastEventTs = Date.now()
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