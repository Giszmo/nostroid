<script type="ts">
  // import { goto } from '$app/navigation';
  import { db } from "../db"
  import type { IProfile } from "../db"
  import { activeProfile } from '../stores'
	import { Data } from '../data'

  export let profile: IProfile
  
  const select = () => {
    db.config.put({
      key: 'activeProfile',
      value: profile.pubkey
    })
    Data.instance.loadAndWatchProfile(profile.pubkey)
    // goto(`/`)
  }
    
  const deleteProfile = () => {
    db.profiles.delete(profile.pubkey)
  }
</script>

<nobr class="profile { $activeProfile == profile?.pubkey ? "selectedProfile" : ""}">
  <button on:click={select}>load</button>
  <button on:click={deleteProfile}>delete</button>
  {#if profile?.avatar}
    <img src={profile.avatar} alt="user's avatar">
  {/if}
  {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
  {profile?.name}
  ({profile?.pubkey})
</nobr>

<style>
  .selectedProfile {
    background-color: lightgreen;
  }
</style>
