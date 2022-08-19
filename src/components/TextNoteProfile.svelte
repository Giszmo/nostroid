<script type="ts">
import { liveQuery } from "dexie"
import { profileCache } from '../stores'
import type { IProfile } from '../db'
import { db } from '../db'
export let pubkey: string
let p = $profileCache
$: profile = p.get(pubkey)
$: avatar = profile?.avatar || ''
let id = pubkey
$: {
  const nip05 = profile?.nip05
  id = nip05
  ? `${nip05} (<a href="https://${nip05.split('@').slice(-1)[0]}/.well-known/nostr.json">verify</a>)`
  : pubkey
}
</script>

<div class="profile">
  <img src={avatar} alt="user's avatar">
  <div class="info">
    {profile?.name || 'no name set'}<br>
    {@html id}
  </div>
</div>

<style>
.profile {
  width: 100%;
  height: 3em;
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
}
</style>