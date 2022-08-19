<script type="ts">
  import { goto } from '$app/navigation';
  import { db } from "../db"
  import type { IProfile } from "../db"
  import { activeProfile } from '../stores'

  export let profile: IProfile
  
  $: active = $activeProfile as IProfile
  const select = async () => {
    db.config.put({
      key: 'activePubkey',
      value: profile.pubkey
    })
    // goto(`/`)
  }
  const showPubkey = () => {
    goto(`/${profile?.pubkey}`)
  }
    
  const deleteProfile = () => {
    db.profiles.delete(profile.pubkey)
  }
</script>

<div on:mouseenter={select} class="profile { active?.pubkey == profile?.pubkey ? "selectedProfile" : ""}">
<span class="pubkey">{profile?.pubkey?.slice(0,10)}</span>
{#if profile?.avatar}
<img src={profile.avatar} alt="user's avatar">
{/if}
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
