import { relayPool } from 'nostr-tools'
import { db } from "./db"
import type { IProfile, IEvent } from "./db"
import { liveQuery } from "dexie"
import { tick } from 'svelte'

export class Data {
  private static _instance: Data = new this()
  private pool

  // event buffer to batch insert
  public events: IEvent[] = []
  
  private constructor() {
    setInterval(() => {
      Data.instance.events = [...new Set(Data.instance.events)]
      const e = Data.instance.events.splice(-100)
      console.log(`About to insert ${e.length} events`)
      db.events.bulkPut(e)
    }, 1000)
  }
  
  async public loadAndWatchProfile(pubkey: string): void {
    this.connectWS()
    const lastSync = (await db.config.get(`syncedDate-${pubkey}`))?.value || 0
    this.events = []
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {authors: [pubkey], since: lastSync}
    }, 'from-us')
    this.pool.sub({
      cb: Data.instance.onEvent,
      filter: {'#p': [pubkey], since: lastSync}
    }, 'to-us')
    setTimeout(() => {
      db.config.put({
        key: `syncedDate-${pubkey}`,
        value: (new Date().getTime())
      })
    }, 5000);
  }
  
  async private onEvent(event: IEvent, relay: string): void {
    await tick()
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