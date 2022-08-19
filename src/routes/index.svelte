<script lang="ts">
	import TextNote from '../components/TextNote.svelte'
	import { liveQuery } from "dexie"
	import { db } from "../db"
	import type { IProfile, IEvent } from "../db"
  import { activeProfile } from '../stores'

	$: active = $activeProfile as IProfile
	$: events = liveQuery(async () => {
		const pubkey = active.pubkey
		if (pubkey == undefined) {
			return []
		}
		return await db
			.events
			.orderBy('created_at').reverse()
			.filter((it) =>
				it.pubkey == active.pubkey
				&&
				it.kind === 1
			)
			.limit(20)
			.toArray()
	})
		
</script>

<svelte:head>
 	<title>Feed</title>
	<meta name="description" content="Showing nostr events" />
</svelte:head>

<div class="todos">
	<h1>Feed</h1>
	{#if $events instanceof Array }
	{#each $events as event (event.id)}
		<p>
			<TextNote event={event}/>
		</p>
	{/each}
	{/if}
</div>

<style>
</style>
