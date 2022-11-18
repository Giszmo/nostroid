<script lang="ts">
	import { page } from '$app/stores';
	import { db } from '../../../db';
	import type { IEvent, IMissing } from '../../../db';
	import TextNote from '../../../components/TextNote.svelte';
	import TextNoteThread from '../../../components/TextNoteThread.svelte';

	type Reply = {
		event: IEvent;
		children: Reply[];
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
			getPreviousEvents(e);
			getRoot(e);
			baseReplyObj = {
				event: e,
				children: []
			};
			getReplies(baseReplyObj);
		}
	};

	const getRoot = async (event: IEvent) => {
		const index = event.tags.findIndex((it) => it.startsWith('e»') && it.includes('root'));
		if (index === -1) return;
		const id = event.tags[index].split('»', 3)[1];
		root = await db.events.get(id);
	};

	const getPreviousEvents = async (event: IEvent) => {
		const match = event.tags
			.slice()
			.reverse()
			.find((it) => it.startsWith('e»') && it.includes('reply'));
		if (!match) return (morePreviousExists = false);

		const id = match.split('»', 3)[1];
		const e = await db.events.get(id);

		if (!e || (root && e.id === root.id)) return (morePreviousExists = false);

		morePreviousExists = true;

		if (previousEvents.length >= previousEventsLimit) return;

		previousEvents = [e, ...previousEvents];
		getPreviousEvents(e);
	};

	const getReplies = async (reply: Reply) => {
		const r = await db.events
			.where('tags')
			.startsWithIgnoreCase(`e»${reply.event.id}»`)
			.distinct()
			.and((it) => it.kind === 1)
			.and((it) => {
				const lastReply = it.tags
					.slice()
					.reverse()
					.find((tag) => tag.match(new RegExp(`e».*».*»reply`, 'g'))?.[0]);
				return Boolean(lastReply?.match(new RegExp(`e»${reply.event.id}».*»reply`, 'g'))?.[0]);
			})
			.toArray();
		if (!r.length) return;

		reply.children = r.map((it) => ({ event: it, children: [] }));
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
		<TextNoteThread {reply} level={1} />
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
