<script type="ts">
  import { goto } from '$app/navigation';
  import { db } from "../db"
  import type { IProfile } from "../db"
  import { activePubkey } from '../stores'
	import { Data } from '../data'

  export let profile: IProfile
  
  const select = () => {
    db.config.put({
      key: 'activePubkey',
      value: profile.pubkey
    })
    Data.instance.loadAndWatchProfile(profile.pubkey)
    // goto(`/`)
  }
  const showPubkey = () => {
    goto(`/${profile?.pubkey}`)
  }
    
  const deleteProfile = () => {
    db.profiles.delete(profile.pubkey)
  }
</script>

<div on:mouseenter={select} class="profile { $activePubkey == profile?.pubkey ? "selectedProfile" : ""}">
{profile?.name}
{#if $activePubkey == profile?.pubkey }
  <p>
    {#if profile?.avatar}
    <img src={profile.avatar} alt="user's avatar">
    {/if}
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
    ({profile?.pubkey})<br>
    <button on:click={showPubkey}>Show Profile</button>
    <button on:click={deleteProfile}>Delete</button>
  </p>
{/if}
</div>

<style>
  .selectedProfile {
    background-color: lightgreen;
    padding-top: .5em;
    padding-bottom: .5em;
  }
</style>
