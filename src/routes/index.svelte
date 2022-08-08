<script lang="ts">
	// import SvelteMarkdown from 'svelte-markdown'
	import { Data } from '../data'
	import type { Event } from '../types'
	import TextNote from './TextNote.svelte'

  const data = Data.instance
	data.connectDB(indexedDB)
  data.connectWS()

	let events = Data.instance.events
	setInterval(() => {events = Data.instance.events}, 500)
</script>

<svelte:head>
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

<style>
	.todos {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}
</style>
