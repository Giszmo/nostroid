<script lang="ts">
  import {getEventHash, signEvent } from 'nostr-tools/event.js'
  import { activeProfile } from '../../stores'
  import { db } from "../../db"
  import type { IEvent, IProfile } from "../../db"
  // import { Data } from '../../data'

  let name = ''
  let avatar = ''
  let pk = ''
  let nip05 = ''
  
  $: {(async () => {
    let active = (await $activeProfile) as IProfile
    if (active && active?.pubkey && active?.pubkey != pk) {
      pk = active.pubkey
      name = active.name || ''
      avatar = active.avatar || ''
      nip05 = active.nip05 || ''
    }
  })()
}

var interval: any // NodeJs.Timer? number?
let delayS = 10
let msg = ''

const persistLater = () => {
  cancelPersist()
  interval = setInterval(() => {
    if (delayS > 0) {
      msg = `<progress value="${10 - delayS}" max="10"></progress>Saving in ${Math.floor(delayS)}s`
      delayS-=0.1
    } else {
      sendPersist()
    }
  }, 100)
}

const cancelPersist = () => {
  clearInterval(interval)
  delayS = 10
  msg = ''
}

const reset = async () => {
  cancelPersist()
  let active = (await $activeProfile) as IProfile
  name = active.name || ''
  avatar = active.avatar || ''
  nip05 = active.nip05 || ''
}

const sendPersist = async () => {
  const p = $activeProfile as IProfile
  let e = <IEvent>{
    id: '',
    sig: '',
    pubkey: p.pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: 0,
    tags: [],
    content: JSON.stringify(
      {
        name: name,
        picture: avatar,
        nip05: nip05
      }
    ),
    outbox: true
  }
  cancelPersist()
  e.id = getEventHash(e)
  e.sig = await signEvent(e, p.privkey)
  db.events.put(e)
  // Data.instance.pool.publish(e)
}

$: {
  name
  avatar
  nip05
  let a = ($activeProfile || {pubkey:''}) as IProfile
  if (name === a.name && avatar === a.avatar && nip05 === a.nip05) {
    cancelPersist()
  } else {
    persistLater()
  }
}

</script>

<svelte:head>
  <title>Settings</title>
  <meta name="description" content="Account Settings" />
</svelte:head>

<div>
  <h1>Settings</h1>
  {#if $activeProfile?.privkey != undefined }
    <label>PK: <input bind:value={pk} disabled></label><br>
    <label>Name: <input bind:value={name}></label><br>
    <label>Avatar: <input bind:value={avatar}></label><br>
    <label>nip05: <input bind:value={nip05}></label><br>
    {@html msg}
    <button on:click={cancelPersist}>Cancel</button>
    <button on:click={sendPersist}>Save</button>
    <button on:click={reset}>Reset</button>
  {:else}
    <strong>PK</strong>: <span>{pk}</span><br>
    <strong>Name</strong>: <span>{name}</span><br>
    <strong>Avatar</strong>: <span>{avatar}</span><br>
    <strong>nip05</strong>: <span>{nip05}</span><br>
  {/if}
</div>

<style>
</style>
