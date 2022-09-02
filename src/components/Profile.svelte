<script type="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { db } from "../db"
  import type { IProfile } from "../db"
  import { activeProfile } from '../stores'
  import noPic from '$lib/assets/noProfilePic.png'
  export let profile: IProfile
  
  $: active = $activeProfile as IProfile
  $: avatar = profile.avatar || noPic
  const select = async () => {
    db.config.put({
      key: 'activePubkey',
      value: profile.pubkey
    })
    // goto(`/`)
  }
  const showPubkey = () => {
    goto(`${base}/${profile?.pubkey}`)
  }
    
  const deleteProfile = () => {
    db.profiles.delete(profile.pubkey)
  }
</script>

<div on:click={select} class="profile { active?.pubkey == profile?.pubkey ? "selectedProfile" : ""}">
<img src={avatar} alt="user's avatar"><br>
<div class="name">
  {profile?.name || '???'}
  {profile?.privkey ? '🔑' : ''}
</div>
<div class="controlls { active?.pubkey == profile?.pubkey ? "selectedProfile" : ""}">
    <button on:click={showPubkey}>Show</button>
    <button on:click={deleteProfile}>Delete</button>
</div>
</div>

<style>
.profile {
  background-color: lightgray;
  border: 2px solid darkgray;
  text-align: center;
  display: inline-grid;
  min-height: 15em;
  margin: .5em;
  padding: .5em;
  border-radius: 15px;
}
img {
  width: 8em;
  height: 8em;
  border-radius: 50%;
  object-fit: cover;
  margin: 1em;
}
.name {
  font-weight: bold;
  font-size: 1.5em;
}
.selectedProfile {
  background-color: lightgreen;
}
.pubkey {
  font-family: monospace
}
.controlls {
  display: none;
}
.controlls.selectedProfile {
  display: block;
}
</style>
