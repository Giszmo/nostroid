<script type="ts">
  import { activeProfile } from '../stores'
  import noPic from '$lib/assets/noProfilePic.png'

</script>

<div class="accountInfo">
  <div class='name'>{$activeProfile?.name || '???'}<br></div>
  <div class='pubkey'>{$activeProfile?.pubkey}</div>
  <p>
    <img src={$activeProfile?.avatar || noPic} alt="user's avatar">
    {@html $activeProfile?.privkey ? '🔑' : '&nbsp;&nbsp;&nbsp;'}
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
  border-radius: 50%;
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
