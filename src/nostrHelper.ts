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
  e.id = getEventHash(e)
  e.sig = await signEvent(e, privkey)
  db.events.add(e)
}
