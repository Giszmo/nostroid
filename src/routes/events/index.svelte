<script lang="ts">
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { relayPool } from 'nostr-tools';

	type Event = {
		id: string;
		created_at: Date;
		text: string;
	};

	export let events: Event[] = [];

	const relay = 'wss://relay.nostr.info';
	const pool = relayPool()
	pool.addRelay(relay, {read: true, write: true})
	function onEvent(event, relay) {
		const e = {
			id: event.id,
			created_at: event.created_at,
			text: event.content
		}
		events.push(e)
	  console.log(e)
		events = events
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

	{#each events as event (event.id)}
		<p>{event.text}</p>
	{/each}
</div>
