<script lang="ts">
	// import SvelteMarkdown from 'svelte-markdown'
	import { relayPool } from 'nostr-tools'
	import type { Event } from './types'
	import TextNote from './TextNote.svelte'

	export let events: Event[] = []

	const relay = 'wss://relay.nostr.info'
	const pool = relayPool()
	pool.addRelay(relay, {read: true, write: true})
	function onEvent(event: Event, relay) {
	  console.log(event)
		events = [...events, event]
	}
	pool.sub({
	  cb: onEvent,
	  filter: {limit: 10, kinds: [1]}
	})
</script>

<svelte:head>
	<script>
		global = window
 	</script>
 	<title>Events</title>
	<meta name="description" content="Showing nostr events" />
</svelte:head>

<div class="todos">
	<h1>Events</h1>

	{#each events as event}
		<p>
			<TextNote event={event}/>
		</p>
	{/each}
</div>
