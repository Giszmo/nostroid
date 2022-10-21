<script lang='ts'>
  import type { IProfile } from "../db"
  export let profile: IProfile;

  const robo = `https://robohash.org/${profile?.pubkey}.png`

  $: avatar = profile?.avatar || robo
</script>

<img on:error={() => avatar = robo} src={avatar} alt="user's avatar">

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