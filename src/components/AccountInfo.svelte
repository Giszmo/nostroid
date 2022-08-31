<script type="ts">
  import type { IProfile } from "../db"
  import { activeProfile } from '../stores'
  import noPic from '$lib/assets/noProfilePic.png'

  $: profile = $activeProfile as IProfile
  $: avatar = profile?.avatar || noPic
</script>

<div class="accountInfo">
  <div class='name'>{profile?.name || '???'}<br></div>
  <div class='pubkey'>{profile?.pubkey}</div>
  <p>
    <img src={avatar} alt="user's avatar">
    {@html profile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
  </p>
</div>

<style>
.accountInfo {
  width: 10em;
  height: 3em;
  overflow-y: visible;
  font-weight: bold;
}
img {
  width: 3em;
  height: 3em;
  object-fit: cover;
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
