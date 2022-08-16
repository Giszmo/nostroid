<script type="ts">
  import type { IProfile } from "../db"
  // import { db } from "../db"
  // import { liveQuery } from "dexie"
  import { activeProfile } from '../stores'

  $: profile = $activeProfile as IProfile
  $: {
    console.log(profile)
  }
</script>

<div class="accountInfo">
  {profile?.name || '???'}
  <p>
    {#if profile?.avatar}
    <img src={profile.avatar} alt="user's avatar">
    {/if}
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
    ({profile?.pubkey?.slice(0,10)})<br>
  </p>
</div>

<style>
.accountInfo {
  width: 10em;
  height: 10em;
  font-weight: bold;
}
</style>
