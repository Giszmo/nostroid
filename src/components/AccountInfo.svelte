<script type="ts">
  import type { IProfile } from "../db"
  // import { db } from "../db"
  // import { liveQuery } from "dexie"
  import { activeProfile } from '../stores'

  $: profile = $activeProfile as IProfile
</script>

<div class="accountInfo">
  <div class='name'>{profile?.name || '???'}<br></div>
  <div class='pubkey'>{profile?.pubkey}</div>
  <p>
    {#if profile?.avatar}
    <img src={profile.avatar} alt="user's avatar">
    {/if}
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
  </p>
</div>

<style>
img {
  width: 3em;
  height: 3em;
  object-fit: cover;
}
.accountInfo {
  width: 10em;
  height: 10em;
  font-weight: bold;
}
.pubkey {
  width: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.name {
  width: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
