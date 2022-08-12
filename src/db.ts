import Dexie from 'dexie'

export interface IProfile {
  privkey?: string
  pubkey: string
  name: string
  avatar?: string
}

export interface IConfig {
  key: string
  value: string
}

export class NostroidDexie extends Dexie {
  profiles!: Dexie.Table<IProfile>
  config!: Dexie.Table<IConfig>

  constructor() {
    super('data2')
    this.version(2).stores({
      profiles: '++id, pubkey, name',
      config: 'key'
    })
  }
}

export const db = new NostroidDexie()