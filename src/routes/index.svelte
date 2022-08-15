<script lang="ts">
	// import SvelteMarkdown from 'svelte-markdown'
	import TextNote from '../components/TextNote.svelte'
	import { liveQuery } from "dexie"
	import type { Observable } from "dexie"
	import { db } from "../db"
	import type { IEvent } from "../db"
  import { activePubkey } from '../stores'

	let events: Observable<IEvent[]> = liveQuery(async () => {
		const pubkey = await db.config.get('activePubkey')
			.then(c => c?.value)
		if (pubkey == undefined) {
			return []
		}
		return await db
			.events
			// .orderBy('created_at').reverse()
			.filter((it) =>
				it.pubkey == $activePubkey
				&&
				it.kind === 1
			)
			.limit(20)
			.toArray()
	})

	// let events: Observable<IEvent[]> = liveQuery(async () =>
	// 	await db
	// 		.events
	// 		.orderBy('created_at').reverse()
	// 		.filter((it) =>
	// 			it.pubkey == $activePubkey
	// 			&&
	// 			it.kind === 1
	// 		)
	// 		.limit(20)
	// 		.toArray()
	// )
		
</script>

<svelte:head>
 	<title>Feed</title>
	<meta name="description" content="Showing nostr events" />
</svelte:head>

<div class="todos">
	<h1>Feed</h1>
	<p>{$activePubkey}</p>
	{#if $events instanceof Array }
	{#each $events as event (event.id)}
		<p>
			<TextNote event={event}/>
		</p>
	{/each}
	{/if}
</div>

<style>
	.todos {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}
</style>
