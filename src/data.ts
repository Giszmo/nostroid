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
    if (this.indexedDB || !indexedDB) return
    this.indexedDB = indexedDB
    const request = indexedDB.open("data", 3)
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!")
    }
    request.onsuccess = (event) => {
      console.log("DB connected ...")
      Data.instance.db = event.target.result
      Data.instance.db.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`)
      }
      Data.instance.loadProfiles()
    }
    request.onupgradeneeded = (event) => {
      const from = event.oldVersion
      const db = event.target.result
      const tx = event.target.transaction
      if (from < 2) {
        const eventStore = db.createObjectStore("events", { autoIncrement : true })
        eventStore.createIndex("hash", "hash", { unique: true })
        eventStore.createIndex("kind", "kind", { unique: false })
        const profileStore = db.createObjectStore("profiles", { autoIncrement : true })
      }
      if (from < 4) {
        tx.objectStore("events").deleteIndex("pubkey")
        tx.objectStore("profiles").createIndex("pubkey", "pubkey", { unique: true })
      }
    }
  }
  
  public addProfile(profile: Profile): void {
    Data.instance.profiles.push(profile)
    Data.instance.db.transaction(['profiles'], 'readwrite').objectStore('profiles').add(profile)
  }

  public static get instance() {
    return this._instance
  }
  
  private loadProfiles(): void {
    Data.instance.profiles = []
    const db = Data.instance.db
    const tx = db.transaction("profiles")
    const os = tx.objectStore("profiles")
    const oc = os.openCursor()
    oc.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        Data.instance.profiles.push(cursor.value)
        cursor.continue()
      }
      else {
        console.log("No more entries!")
      }
    }
  }
}