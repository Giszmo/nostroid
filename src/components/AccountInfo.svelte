<script type="ts">
  import type { IProfile } from "../db"
  import { db } from "../db"
  import { liveQuery } from "dexie"
  import { activePubkey } from '../stores'

  let p
  let profile: IProfile
  $: {
    p = liveQuery(async () => await db.profiles.get($activePubkey))
    profile = $p
      ? $p as IProfile
      : {} as IProfile
  }
</script>

<div class="accountInfo">
  {profile?.name}
  <p>
    {#if profile?.avatar}
    <img src={profile.avatar} alt="user's avatar">
    {/if}
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
    ({profile?.pubkey})<br>
  </p>
</div>

<style>
.accountInfo {
  font-weight: bold;
}
</style>
