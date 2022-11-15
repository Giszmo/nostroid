<script lang="ts">
	import { page } from '$app/stores';
	import { db } from '../../../db';
	import type { IEvent, IMissing } from '../../../db';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import TextNote from '../../../components/TextNote.svelte';

	let id: string | undefined;
	let event;
	let previousEvents: IEvent[] = [];
	let previousEventsLimit = 2;
	let morePreviousExists = false;

	$: {
		event = liveQuery<IEvent | undefined>(async () => {
			const e = await db.events.get(id);
			if (id && id.length === 64 && !e) {
				db.missingEvents.put(<IMissing>{ id: id });
			}
			if (e) {
				getPreviousEvents(e);
			}
			return e;
		});
	}

	const getPreviousEvents = async (event: IEvent) => {
		const index = event.tags.findIndex((it) => it.startsWith('e»') && it.includes('reply'));
		if (index === -1) return (morePreviousExists = false);

		const id = event.tags[index].split('»', 3)[1];
		const e = await db.events.get(id);

		if (!e) return (morePreviousExists = false);

		morePreviousExists = true;

		if (previousEvents.length >= previousEventsLimit) return;

		previousEvents = [e, ...previousEvents];
		getPreviousEvents(e);
	};

	const loadMorePrevious = () => {
		previousEventsLimit += 2;
		getPreviousEvents(previousEvents[0]);
	};

	onMount(async () => {
		id = $page.params.id;
	});
</script>

<svelte:head>
	<title>Event</title>
</svelte:head>
{#await $event}
	Loading ...
{:then event}
	{#if event}
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
{:catch _}
	Event not found.
{/await}

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
