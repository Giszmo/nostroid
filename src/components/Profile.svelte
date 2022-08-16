<script type="ts">
  import { goto } from '$app/navigation';
  import { db } from "../db"
  import type { IProfile } from "../db"
  import { activeProfile } from '../stores'
	import { Data } from '../data'

  export let profile: IProfile
  
  $: active = $activeProfile as IProfile
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

<div on:mouseenter={select} class="profile { active?.pubkey == profile?.pubkey ? "selectedProfile" : ""}">
{profile?.name || '???'}
{#if profile?.avatar}
<img src={profile.avatar} alt="user's avatar">
{/if}
{#if active?.pubkey == profile.pubkey }
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
    ({profile?.pubkey?.slice(0,10)})
    <button on:click={showPubkey}>Show Profile</button>
    <button on:click={deleteProfile}>Delete</button>
{/if}
</div>

<style>
.profile {
  height: 1.5em;
}
  .selectedProfile {
    background-color: lightgreen;
    padding-top: .5em;
    padding-bottom: .5em;
  }
</style>
