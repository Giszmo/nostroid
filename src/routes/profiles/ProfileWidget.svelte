<script type="ts">
  import type { Profile } from '../../types'
  // import { goto } from '$app/navigation';
	import { Data } from '../../data'

  export let profile: Profile
  const data = Data.instance

  const load = () => {
    data.selectProfile(profile)
    // goto(`/`)
  }
</script>

<nobr class="profile {data.selectedProfile == profile ? "selectedProfile" : ""}">
  <button on:click={load}>load</button>
  {#if profile.avatar}
    <img src={profile.avatar} alt="user's avatar">
  {/if}
  {@html profile.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
  {profile.name}
  ({profile.pubkey})
</nobr>

<style>
  .selectedProfile {
    background-color: lightgreen;
  }
</style>
