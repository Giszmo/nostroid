import { db } from "./db"
import type { IEvent } from "./db"
import { getPublicKey } from 'nostr-tools'
import {getEventHash, signEvent } from 'nostr-tools/event.js'

export const sendPersistEvent = async (kind, tags, content, privkey) => {
  let pubkey = getPublicKey(privkey)
  let e = <IEvent>{
    id: '',
    sig: '',
    pubkey: pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: kind,
    tags: tags,
    content: content,
    outbox: true
  }
  let event = JSON.parse(JSON.stringify(e))
  event.tags = event.tags.map(it=>it.split('»'))
  event.id = getEventHash(event)
  e.id = event.id
  e.sig = await signEvent(event, privkey)
  db.events.add(e)
}
