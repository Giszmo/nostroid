import Dexie from 'dexie'

export interface IProfile {
  pubkey: string
  privkey?: string
  name: string
  avatar?: string
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
  tags: string[][]
  content: string
  sig: string
}

export interface ITag {
  id: number
  event: number
  key: string
  value: string
}

export class NostroidDexie extends Dexie {
  profiles!: Dexie.Table<IProfile>
  config!: Dexie.Table<IConfig>
  events!: Dexie.Table<IEvent>
  tags!: Dexie.Table<ITag>

  constructor() {
    super('data4')
    this.version(1).stores({
      profiles: '&pubkey, name',
      config: '&key',
      events: '&id, pubkey, kind, created_at',
      tags: '++id, event, key, value'
    })
  }
}

export const db = new NostroidDexie()