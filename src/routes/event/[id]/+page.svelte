<script lang="ts">
	import { page } from '$app/stores';
	import { db } from '../../../db';
	import Event from '../../../components/Event.svelte';
	import type { IEvent, IMissing } from '../../../db';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';

	let id: string | undefined;
	let event;
	$: {
		event = liveQuery<IEvent | undefined>(async () => {
			const e = await db.events.get(id);
			if (id && id.length === 64 && !e) {
				db.missingEvents.put(<IMissing>{ id: id });
			}
			return e;
		});
	}

	onMount(async () => {
		id = $page.params.id;
	});
</script>

<svelte:head>
	<title>Event</title>
</svelte:head>

<h1>Event {id}</h1>

{#await $event}
	Loading ...
{:then event}
	{#if event}
		<Event {event} />
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
</style>
