import { relayPool } from 'nostr-tools'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"
import { liveQuery } from "dexie"

export class Data {
  private static _instance: Data = new this()
  private pool

  public events: IEvent[] = []
  
  private constructor() {
  }
  
  public loadAndWatchProfile(pubkey: string): void {
    this.connectWS()
    this.events = []
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {authors: [pubkey]}
    }, 'from-us')
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {'#p': [pubkey]}
    }, 'to-us')
  }
  
  private onEvent(event: IEvent, relay: string): void {
    db.events.put(event)
    Data.instance.events = [...(Data.instance.events), event]
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