import Dexie from 'dexie'
import { getPublicKey } from './lib/nostr-tools'
import { queryName } from './lib/nostr-tools/nip05'

export interface IProfile {
  pubkey: string
  privkey?: string
  name?: string
  avatar?: string
  nip05?: string
  nip05Valid: boolean
  /**
   * "degree of separation"
   * 
   *     0: our account
   *     1: direct follow of one of our accounts
   *     2: follow of a follow
   *     ...
   **/
  degree: number
  index: number
}

export interface IConfig {
  key: string
  value: string
}

export interface IEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[] // the nostr tag elements get joined with '»' for searchability
  content: string
  sig: string
}

export interface INotification {
  pubkey: string
  created_at: number
  type: string
  event: string
}

export interface ITag {
  id: number
  event: string
  key: string
  value: string
}

export interface IMissing {
  id: string
}

export class NostroidDexie extends Dexie {
  profiles!: Dexie.Table<IProfile>
  config!: Dexie.Table<IConfig>
  events!: Dexie.Table<IEvent>
  tags!: Dexie.Table<ITag>
  missingEvents!: Dexie.Table<IMissing>

  constructor() {
    super('data4')
    this.version(22).stores({
      profiles: '&pubkey, degree, index',
      config: '&key',
      events: '&id, pubkey, kind, created_at, [pubkey+kind], *tags',
      missingEvents: '&id',
      tags: '++id, event, key, value',
      notifications: '++id, pubkey'
    })
    .upgrade(tx => {
      return tx.table("events").toCollection().modify(event => {
        event.tags = event.tags.map(it=>it.split(',').join('»'))
      })
    })
  }
  
  public async nip05Valid(name, pubkey) {
    if (name == undefined || name.length < 3) {
      return false
    }
    var n = name
    switch (name.indexOf('@')) {
      case -1: n = `_@${name}`; break
      case 0: n = `_${name}`; break
      default: n = name
    }
    const qName = await queryName(n)
    console.log(`${name}->${n}->${qName}`)
    return qName == pubkey
  }
  
  public async updateProfileFromMeta(pubkeys) {
    console.log(`updateProfileFromMeta(${pubkeys?.length})`)
    if (pubkeys && pubkeys.length === 0) {
      return
    }
    let profiles: Array<IProfile>
    await db.transaction('rw', db.profiles, db.events, async () => {
      if (pubkeys) {
        profiles = await db.profiles.where('pubkey').anyOf(pubkeys).toArray()
      } else {
        profiles = await db.profiles.toArray()
      }
      let metaDataEvents = new Map<string, IEvent>()
      ;(await db.events
        .where({kind: 0})
        .toArray())
        .sort((a,b) => b.created_at - a.created_at)
        .forEach(e => {
          if (metaDataEvents.get(e.pubkey)) {
            // delete older metadata events if we already found one sorting
            // newest to oldest.
            db.events.delete(e.id)
          } else {
            metaDataEvents.set(e.pubkey, e)
          }
        })
      for (const p of profiles) {
        let metadataEvent = metaDataEvents.get(p.pubkey)
        let metadata = metadataEvent ? JSON.parse(metadataEvent.content) : undefined
        if (metadata) {
          p.name = metadata.name || ''
          p.avatar = metadata.picture || ''
          p.nip05 = metadata.nip05
          p.nip05Valid = null
        }
      }
      db.profiles.bulkPut(profiles)
    })
    this.validateNip05ProfilesNip05(profiles || [])
  }
  
  private async validateNip05ProfilesNip05(profiles: Array<IProfile>) {
    let profilesWithNip05 = profiles.filter(p => p.nip05)
    const profilesValidated = await Promise.all(profilesWithNip05.map(async (p) => {
      p.nip05Valid = await this.nip05Valid(p.nip05, p.pubkey)
      return p
    }))
    db.profiles.bulkPut(profilesValidated)
  }
}

export const db = new NostroidDexie()
db.on('populate', () => {
  const index = Math.floor(Date.now() / 1000)
  const debugProfiles = []
  ;[
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Alice
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' // Bob
  ].forEach((it, id)=>{
    debugProfiles.push({
      pubkey: getPublicKey(it),
      privkey: it,
      missing: true,
      degree: 0,
      index: index+id
    })
  })
  ;[
    '46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184b16bd8ce4d',
    '8c0da4862130283ff9e67d889df264177a508974e2feb96de139804ea66d6168',
    'b2d670de53b27691c0c3400225b65c35a26d06093bcc41f48ffc71e0907f9d4a',
    '22e804d26ed16b68db5259e78449e96dab5d464c8f470bda3eb1a70467f2c793',
    'e9e4276490374a0daf7759fd5f475deff6ffb9b0fc5fa98c902b5f4b2fe3bba2',
    '2ef93f01cd2493e04235a6b87b10d3c4a74e2a7eb7c3caf168268f6af73314b5',
    '9ec7a778167afb1d30c4833de9322da0c08ba71a69e1911d5578d3144bb56437',
    '52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd',
    'e4c47aedea8ea54255f5ba07a77053b24553e9b975435e56da343da19aec7881',
    'ed1d0e1f743a7d19aa2dfb0162df73bacdbc699f67cc55bb91a98c35f7deac69',
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
    '47bae3a008414e24b4d91c8c170f7fce777dedc6780a462d010761dca6482327',
    'f43c1f9bff677b8f27b602725ea0ad51af221344f69a6b352a74991a4479bac3'
  ].forEach((it, id)=>{
    debugProfiles.push({
      pubkey: it,
      missing: true,
      degree: 0,
      index: index + id + 2
    })
  })
  db.profiles.bulkAdd(debugProfiles)
})
