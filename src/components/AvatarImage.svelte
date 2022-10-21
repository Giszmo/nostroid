<script lang='ts'>
  import type { IProfile } from "../db"
  export let profile: IProfile;

  let src = '';
  let robo = '';

  const setSrc = (_: any) => {
    if (!profile) return;
    if (profile.pubkey) robo = `https://robohash.org/${profile.pubkey}.png`
    src = profile.avatar ? profile.avatar : robo;
  }

  $: setSrc(profile)
</script>

<img on:error={() => src = robo} src={src} alt="user's avatar">

<style>
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    float: left;
    background-color: white;
  }
</style>