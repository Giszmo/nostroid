<script type="ts">
import { cProfiles } from '../stores'
import noPic from '$lib/assets/noProfilePic.png'

export let pubkey: string

$: p = $cProfiles
$: profile = p.get(pubkey)
$: avatar = profile?.avatar
let id = pubkey
$: {
  const nip05 = profile?.nip05
  id = nip05
    ? `${nip05} (<a href="https://${nip05.split('@').slice(-1)[0]}/.well-known/nostr.json">verify</a>)`
    : pubkey
}
</script>

<div class="profile">
  <img src={avatar || noPic} alt="user's avatar">
  <div class="info">
    {profile?.name || 'no name set'}<br>
    {@html id}
  </div>
</div>

<style>
.profile {
  width: 100%;
  min-height: 3em;
}

.info {
  margin-left: 60px;
  font-weight: bold;
}

img {
  width: 3em;
  height: 3em;
  float: left;
  object-fit: cover;
  border-radius: 50%;
}
</style>
