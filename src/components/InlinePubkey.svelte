<script type="ts">
  import { cProfiles } from '../stores'
  import noPic from '$lib/assets/noProfilePic.png'
  import { base } from '$app/paths'
  import { goto } from '$app/navigation'

  export let content: {pubkey: string}
  
  let profile = $cProfiles.get(content.pubkey)
  
  const showProfile = () => {
    goto(`${base}/${content.pubkey}`)
  }
</script>

<span on:click|stopPropagation={showProfile}>
<img src={profile?.avatar || noPic} alt="user's avatar"
>&nbsp;<span class="info">
{profile?.name || content.pubkey}</span>
</span>
<style>
img {
  width: 1em;
  height: 1em;
  object-fit: cover;
  border-radius: 50%;
  vertical-align: sub;
}

.info {
  font-weight: bold
}
</style>