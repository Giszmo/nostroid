<script lang="ts">
	import { page } from '$app/stores';
	import { db } from '../../../db';
	import type { IEvent, IMissing } from '../../../db';
	import TextNote from '../../../components/TextNote.svelte';
	import TextNoteThread from '../../../components/TextNoteThread.svelte';
	import { getEventParent, getEventReplies, getEventRoot } from '../../../dbHelper';

	type Reply = {
		event: IEvent;
		children: Reply[];
		showAmount: number;
		level: number;
	};

	let id: string | undefined;
	let event: IEvent | undefined;
	let previousEvents: IEvent[] = [];
	let previousEventsLimit = 2;
	let morePreviousExists = false;
	let root: IEvent | undefined;
	let baseReplyObj: Reply;

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
			event = e;
			baseReplyObj = {
				event: e,
				children: [],
				showAmount: 5,
				level: 0
			};
			root = await getEventRoot({ event });
			getPreviousEvents(e);
			getReplies(baseReplyObj);
		}
	};

	const getPreviousEvents = async (event: IEvent) => {
		const e = await getEventParent({ event });

		if (!e || (root && e.id === root.id)) return (morePreviousExists = false);

		morePreviousExists = true;

		if (previousEvents.length >= previousEventsLimit) return;

		previousEvents = [e, ...previousEvents];
		getPreviousEvents(e);
	};

	const getReplies = async (reply: Reply) => {
		const r = await getEventReplies(reply.event.id);
		if (!r.length) return;

		reply.children = r.map((it) => ({
			event: it,
			children: [],
			level: reply.level + 1,
			showAmount: reply.level === 1 ? 1 : 0
		}));
		for (const child of reply.children) {
			await getReplies(child);
		}
		baseReplyObj.children = baseReplyObj.children;
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
	{#each baseReplyObj.children as reply (reply.event.id)}
		<TextNoteThread bind:reply />
	{/each}
{:else}
	Event not found.
{/if}

<style>
	button {
		margin: 10px;
		width: 100px;
	}
</style>
