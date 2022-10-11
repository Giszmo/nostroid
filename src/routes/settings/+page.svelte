<script lang="ts">
  import { activeProfile } from '../../stores'
  import { sendPersistEvent } from '../../nostrHelper'
  import type { IProfile } from "../../db"

  let name = ''
  let avatar = ''
  let pk = ''
  let nip05 = ''
  
  let outEvent: {privkey: string, content: string}|undefined
  
  $: { if ($activeProfile && $activeProfile?.pubkey != pk) {
    reset()
  }}

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
  let active = $activeProfile as IProfile
  name = active?.name || ''
  avatar = active?.avatar || ''
  nip05 = active?.nip05 || ''
}

const sendPersist = async () => {
  if (outEvent) {
    sendPersistEvent(0, [], outEvent.content, outEvent.privkey)
  }
  cancelPersist()
}

$: {
  let a = $activeProfile as IProfile
  if (a?.privkey === undefined || (
    name === a.name && avatar === a.avatar && nip05 === a.nip05)) {
    outEvent = undefined
    cancelPersist()
  } else {
    outEvent = {
      privkey: a.privkey,
      content: JSON.stringify(
        {
          name: name,
          picture: avatar,
          nip05: nip05
        }
      )
    }
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
  {#if $activeProfile }
    {#if $activeProfile?.privkey != undefined }
      <label>PK: <input bind:value={pk} disabled></label><br>
      <label>Name: <input bind:value={name}></label><br>
      <label>Avatar: <input bind:value={avatar}></label><br>
      <img class="profile-img" src={avatar} alt='profile'><br>
      <label>nip05: <input bind:value={nip05}></label><br>
      {@html msg}
      <button on:click={cancelPersist}>Cancel</button>
      <button on:click={sendPersist}>Save</button>
      <button on:click={reset}>Reset</button>
    {:else}
      <strong>PK</strong>: <span>{pk}</span><br>
      <strong>Name</strong>: <span>{name}</span><br>
      <strong>Avatar</strong>: <span>{avatar}</span><br>
      <img class="profile-img" src={avatar} alt='profile'><br>
      <strong>nip05</strong>: <span>{nip05}</span><br>
    {/if}
  {:else}
    Select a profile!
  {/if}
</div>

<style>
  span {
    word-break: break-word;
  }
  .profile-img {
    max-width: 12rem;
  }
</style>
