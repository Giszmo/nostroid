<script lang="ts">
	import { page } from '$app/stores'
	import { db } from "../../db"
	import type { IProfile } from "../../db"
  import { liveQuery } from "dexie"
	import Event from '../../components/Event.svelte'

	const pubkey = $page.params.pubkey
	let p = liveQuery(() => db.profiles.get(pubkey))
  $: profile = $p as IProfile
  
	let events = liveQuery(() => db.events
		.orderBy('created_at').reverse()
		.filter((it) => it.pubkey == pubkey)
		.toArray())
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<h1>A profile and its stuff ...</h1>

<ul>
<li><strong>Name: </strong>{profile?.name}</li>
<li><strong>Public Key: </strong>{profile?.pubkey}</li>
<li><strong>Private Key: </strong> {#if profile?.privkey}yes{:else}no{/if}</li>
<li><strong>Avatar: </strong>{#if profile?.avatar}<img class="avatar-img" src={profile?.avatar} alt='The Avatar'>{:else}no{/if}</li>
</ul>

{#if $events instanceof Array }
{#each $events as event, i}
  <Event {event} oddRow={i % 2 === 0} />
{/each}
{/if}

<style>
	ul {
		word-wrap: break-word;
	}
	.avatar-img {
		max-width: 12rem
	}
</style>
