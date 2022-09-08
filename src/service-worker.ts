// import { relayPool } from 'nostr-tools'
import nostr from 'nostr-tools'
// nostr = undefined
// import { db, type IProfile, type IEvent} from "./db"
// import Dexie from 'dexie'

// const pool = undefined
// 
// // event buffer to batch insert
// const events: IEvent[] = []
// 
// db.updateProfileFromMeta()
// setInterval(() => {
//   const e = [...new Set(events)]
//   events.splice(0)
//   if (e.length > 0) {
//     db.events.bulkPut(e)
//     e.filter(it=>it.kind===0).forEach( m =>
//       db.updateProfileFromMeta(m.pubkey)
//     )
//   }
//   loadMissingEvents()
// }, 1000)
// loadAndWatchProfiles()
// 
// const loadMissingEvents = async () => {
//   connectWS()
//   // profiles
//   const profiles = (await db.profiles.toArray())
//     .filter(it=>it.missing)
//   if (profiles.length > 0) {
//     profiles.forEach(it=>{
//       delete it.missing
//       it.fetching = true
//     })
//     db.profiles.bulkPut(profiles).then(() => {
//       const s = pool.sub({
//         cb: onEvent,
//         filter: {
//           authors: profiles.map(it=>it.pubkey),
//           kinds: [0]
//         }
//       })
//       setTimeout(() => {
//         s.unsub()
//         db.profiles
//           .where("pubkey")
//           .anyOf(profiles.map(it=>it.pubkey))
//           .modify(profile => {
//             delete profile.fetching
//           })
//       }, 10000)
//     })
//   }
//   // events
//   const events = (await db.events.toArray())
//     .filter( it => it.missing)
//   if (events.length > 0) {
//     events.forEach(it=>{
//       delete it.missing
//       it.fetching = true
//     })
//     await db.events.bulkPut(events)
//     const s = pool.sub({
//       cb: Data.instance.onEvent,
//       filter: {ids: events.map(it=>it.id)}
//     })
//     setTimeout(() => {
//       s.unsub()
//       db.events
//         .where("id")
//         .anyOf(events.map(it=>it.id))
//         .modify(event => {
//           delete event.fetching
//         })
//     }, 10000)
//   }
// }
// 
// const loadAndWatchProfiles = async () => {
//   connectWS()
//   const profiles = await db.profiles.toArray()
//   const newProfiles = profiles.filter(p=>!p.synced)
//   const oldProfiles = profiles.filter(p=>p.synced)
//   const newKeys = newProfiles.map(it=>it.pubkey)
//   const oldKeys = oldProfiles.map(it=>it.pubkey)
//   const priorSyncTS = (await db.config.get(`priorSyncTS`))?.value
//   const syncFromTS = priorSyncTS
//     // TODO: scan the last day as the user might not reset the timestamp in a long time
//     ? priorSyncTS - 24 * 60 * 60
//     : 0
//   const sub = (name, filter, keys) => {
//     if (keys.length > 0) {
//       this.pool.sub({
//         cb: onEvent,
//         filter: filter
//       }, name)
//     }
//   }
//   sub('fromNewProfiles', {authors: newKeys}, newKeys)
//   sub('toNewProfiles', {'#p': newKeys}, newKeys)
//   sub('fromnewProfiles', {authors: oldKeys, since: syncFromTS}, oldKeys)
//   sub('tonewProfiles', {'#p': oldKeys, since: syncFromTS}, oldKeys)
//   const syncInterval = setInterval(() => {
//     if (events.length == 0) {
//       console.log('Synced all profiles')
//       clearInterval(syncInterval)
//       db.config.put({
//         key: 'priorSyncTS',
//         value: (new Date().getTime()) / 1000
//       })
//       // mark all profiles synced
//       db.transaction('rw', db.profiles, () => {
//         db.profiles
//           .where('pubkey')
//           .anyOf(profiles.map(it=>it.pubkey))
//           .modify({synced: true})
//       })
//     }
//   }, 5 * 1000)
// }
// 
// const onEvent = (event: IEvent, relay: string) => {
//   events.push(event)
// }
// 
// const connectWS = () => {
//   if (pool) return
//   const relay = 'wss://relay.nostr.info'
//   pool = relayPool()
//   pool.addRelay(relay, {read: true, write: true})
// }

// echo worker
// const $ = (self as SharedWorkerGlobalScope);
// var clients = []
// $.onconnect = (mev: MessageEvent) => {
//     var port = mev.ports[0]
//     clients.push(port)
//     port.addEventListener('message', function(e) {
//       for (var i = 0; i < clients.length; i++) {
//           clients[i].postMessage(5)
//       }
//     })
//     port.start()
// }
