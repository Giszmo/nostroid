import { relayPool } from 'nostr-tools'
import type { Profile, Event } from '../types'

export class Data {
  private static _instance: Data = new this()
  private db
  private indexedDB
  private pool

  public profiles: Profile[] = []
  public selectedProfile: Profile
  public events: Event[] = []
  
  private constructor() {
  }
  
  public selectProfile(profile: Profile): void {
    this.selectedProfile = profile
    this.loadProfileFromDB(profile)
    this.loadAndWatchProfile(profile)
  }
  
  private loadProfileFromDB(profile: Profile): void {
    
  }
  
  private loadAndWatchProfile(profile: Profile): void {
    this.connectWS()
    this.events = []
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {limit: 100, kinds: [1], authors: [profile.pubkey]}
    }, 'from-us')
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {limit: 100, '#p': [profile.pubkey]}
    }, 'to-us')
  }
  
  private onEvent(event: Event, relay: string): void {
    Data.instance.events = [...(Data.instance.events), event]
  }

  public connectWS(): void {
    if (this.pool) return
    const relay = 'wss://relay.nostr.info'
  	this.pool = relayPool()
  	this.pool.addRelay(relay, {read: true, write: true})
  }
  
  public connectDB(indexedDB): void {
    if (this.indexedDB) return
    if (!indexedDB) return
    this.indexedDB = indexedDB
    let db
    const request = indexedDB.open("data")
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!")
    }
    request.onsuccess = (event) => {
      console.log("DB connected ...")
      db = event.target.result
      db.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`)
      }
    }
  }
  
  public static get instance() {
    return this._instance
  }
}