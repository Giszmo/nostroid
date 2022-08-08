import { relayPool } from 'nostr-tools'
import type { Profile, Event } from '../types'

export class Data {
  private static _instance: Data
  private db
  private indexedDB
  private pool
  public profiles: Profile[] = []
  public events: Event[] = []
  
  private constructor() {
  }
  
  public connectWS(): void {
    if (this.pool) return
    const relay = 'wss://relay.nostr.info'
  	this.pool = relayPool()
  	this.pool.addRelay(relay, {read: true, write: true})
  	function onEvent(event: Event, relay: string) {
      // console.log(event)
  		Data._instance.events = [...(Data._instance.events), event]
  	}
  	this.pool.sub({
  	  cb: onEvent,
  	  filter: {limit: 100, kinds: [1]}
  	})
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
    return this._instance || (this._instance = new this())
  }
}