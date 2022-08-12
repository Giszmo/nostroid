<script type="ts">
  import type { Profile } from '../../types'
  // import { goto } from '$app/navigation';
  import { db } from "../../db"
  import type { IConfig } from "../../db"
  import { liveQuery } from "dexie"

  export let profile: Profile

  const select = () => {
    db.config
      .put({
        key: 'activeProfile',
        value: profile.pubkey
      })
    // goto(`/`)
  }
  
  let activeProfile = liveQuery(async () => {
    return await db.config
      .where('key')
      .equals('activeProfile')
      .last()
      .then((c?: IConfig) => c?.value ? c.value : '')
  })
</script>

<nobr class="profile { $activeProfile == profile.pubkey ? "selectedProfile" : ""}">
  <button on:click={select}>load</button>
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
