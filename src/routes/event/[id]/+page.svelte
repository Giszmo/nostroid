<script lang="ts">
	import { page } from '$app/stores';
	import { db } from '../../../db';
	import type { IEvent, IMissing } from '../../../db';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import TextNote from '../../../components/TextNote.svelte';

	let id: string | undefined;
	let event: IEvent | undefined;
	let previousEvents: IEvent[] = [];
	let previousEventsLimit = 2;
	let morePreviousExists = false;
	let root: IEvent | undefined;

	// reload on route change
	$: load($page.params.id);
	const load = async (..._: any) => {
		event = undefined;
		id = $page.params.id;
		previousEvents = [];
		previousEventsLimit = 2;
		morePreviousExists = false;
		root = undefined;

		const e = await db.events.get(id);
		if (id && id.length === 64 && !e) {
			db.missingEvents.put(<IMissing>{ id: id });
		}
		if (e) {
			getPreviousEvents(e);
			getRoot(e);
			event = e;
		}
	};

	const getRoot = async (event: IEvent) => {
		const index = event.tags.findIndex((it) => it.startsWith('e»') && it.includes('root'));
		if (index === -1) return;
		const id = event.tags[index].split('»', 3)[1];
		root = await db.events.get(id);
	};

	const getPreviousEvents = async (event: IEvent) => {
		const index = event.tags.findIndex((it) => it.startsWith('e»') && it.includes('reply'));
		if (index === -1) return (morePreviousExists = false);

		const id = event.tags[index].split('»', 3)[1];
		const e = await db.events.get(id);

		if (!e || (root && e.id === root.id)) return (morePreviousExists = false);

		morePreviousExists = true;

		if (previousEvents.length >= previousEventsLimit) return;

		previousEvents = [e, ...previousEvents];
		getPreviousEvents(e);
	};

	const loadMorePrevious = () => {
		previousEventsLimit += 2;
		getPreviousEvents(previousEvents[0]);
	};
</script>

<svelte:head>
	<title>Event</title>
</svelte:head>

{#if event}
	{#if root}
		<TextNote event={root} />
	{/if}
	{#if morePreviousExists}
		<button on:click={loadMorePrevious}>Load more</button>
	{/if}
	{#each previousEvents as ev (ev.id)}
		<TextNote event={ev} />
	{/each}
	<TextNote {event} selected={true} />
{:else}
	Event not found.
{/if}

<style>
	h1 {
		overflow-x: clip;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	button {
		margin: 10px;
		width: 100px;
	}
</style>
