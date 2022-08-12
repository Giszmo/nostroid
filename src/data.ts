import { relayPool } from 'nostr-tools'
import type { Event } from '../types'

export class Data {
  private static _instance: Data = new this()
  private pool

  public events: Event[] = []
  
  private constructor() {
  }
  
  public selectProfile(profile: Profile): void {
    this.selectedProfile = profile
    this.loadAndWatchProfile(profile)
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

  public static get instance() {
    return this._instance
  }
}