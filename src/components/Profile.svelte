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

<div on:mouseenter={select} class="profile { active?.pubkey == profile?.pubkey ? "selectedProfile" : ""}">
<span class="pubkey">{profile?.pubkey?.slice(0,10)}</span>
<img src={avatar} alt="user's avatar">
{profile?.name || '???'}
{@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
{#if active?.pubkey == profile.pubkey }
    <button on:click={showPubkey}>Show Profile</button>
    <button on:click={deleteProfile}>Delete</button>
{/if}
</div>

<style>
img {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  object-fit: cover;
}
.profile {
  height: 1.7em;
  margin: .2em;
  padding: .1em;
}
.selectedProfile {
  background-color: lightgreen;
}
.pubkey {
  font-family: monospace
}
</style>
