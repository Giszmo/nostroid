<script lang="ts">
  import { activeProfile } from '../../stores'
  import { sendPersistEvent } from '../../nostrHelper'
  import { type IProfile, db } from "../../db"

  let name = ''
  let avatar = ''
  let pk = ''
  let nip05 = ''
  let nip05Status: 'checking' | 'valid' | 'invalid' | '' = '';
  
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
  if (!outEvent || !await validate()) return cancelPersist();
  sendPersistEvent(0, [], outEvent.content, outEvent.privkey)
}

const validate = async () => {
  let valid;
  let a = $activeProfile as IProfile;
  nip05Status = 'checking';
  nip05Status = nip05 ? ((await db.nip05Valid(nip05, a.pubkey)) ? 'valid' : 'invalid') : '';
  if (
    a?.privkey === undefined ||
    (nip05Status !== 'valid' && nip05) ||
    (name === a.name && avatar === a.avatar && nip05 === a.nip05)
  ) {
    valid = false
  } else {
    valid = true;
  }
  return valid;
};

// only run validate and autosave after not being edited for 700ms
$: debounce(name, avatar, pk, nip05)

let timer: ReturnType<typeof setTimeout>;
const debounce = (..._: any) => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!await validate()) {
      outEvent = undefined
      cancelPersist()
    } else {
      outEvent = {
        privkey: $activeProfile.privkey,
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
  }, 700)
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
      <label>
        nip05: 
        <input bind:value={nip05}>
        <span>{nip05Status}</span>
      </label>
      <br>
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
