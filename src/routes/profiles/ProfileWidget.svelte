<script type="ts">
  // import { goto } from '$app/navigation';
  import { db } from "../../db"
  import type { IConfig, IProfile } from "../../db"
  import { liveQuery } from "dexie"

  export let profile: IProfile
  
  const select = () => {
    db.config.put({
      key: 'activeProfile',
      value: profile.pubkey
    })
    // goto(`/`)
  }
    
  const deleteProfile = () => {
    db.profiles.delete(profile.pubkey)
    // goto(`/`)
  }
  
  let activeProfile = liveQuery(async () => {
    return await db.config
      .get('activeProfile')
      .then((c?: IConfig) => c?.value ? c.value : '')
  })
</script>

<nobr class="profile { $activeProfile == profile.pubkey ? "selectedProfile" : ""}">
  <button on:click={select}>load</button>
  <button on:click={deleteProfile}>delete</button>
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
