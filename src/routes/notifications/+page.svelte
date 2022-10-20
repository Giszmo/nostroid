<script lang="ts">
	import TextNote from '../../components/TextNote.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '../../db';
	import type { IEvent, IProfile } from '../../db';
	import { activeProfile } from '../../stores';
	import { crossfade } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';

	let show = 10;
	$: events = liveQuery(async () => {
		const pubkey = $activeProfile?.pubkey;
		if (pubkey == undefined) {
			console.log('returning []');
			return [];
		}
		return (
			await db.events
				.where('tags')
				.startsWith(`p»${pubkey}`)
				.filter((it) => it.kind === 1)
				.sortBy('created_at')
		)
			.reverse()
			.filter((value, index, self) => index === self.findIndex((t) => t.id === value.id));
	});

	$: {
		(async () => {
			// load secondary events
			let evs = $events as Array<IEvent>;
			if (evs == undefined) {
				return;
			}
			const secondaryEvents: Map<string, IEvent> = new Map();
			// get referenced events
			let evIds: Array<string> = [
				...new Set(
					evs.flatMap((e) =>
						e.tags.filter((it) => it.startsWith('e»')).map((it) => it.split('»', 3)[1])
					)
				)
			];
			let missingEvents: Array<string> = [];
			let referencedEvents = await db.events.bulkGet(evIds);
			evIds.forEach((key, index) => {
				let val = referencedEvents[index];
				if (val) {
					secondaryEvents.set(key, val);
				} else {
					missingEvents.push(key);
				}
			});
			let mes = missingEvents.map((it) => {
				return { id: it };
			});
			db.missingEvents.bulkPut(
				missingEvents.map((it) => {
					return { id: it };
				})
			);
			// TODO: do something with secondaryEvents!
		})();
	}

	activeProfile.subscribe(() => {
		show = 10;
	});

	let showMore = () => {
		show += 10;
	};

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 2000),

		fallback(node, _) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 200,
				easing: quintInOut,
				css: (t) => `
        transform: ${transform} scale(${t});
        opacity: ${t}
        `
			};
		}
	});
</script>

<svelte:head>
	<title>Notifications</title>
	<meta name="description" content="Showing nostr events" />
</svelte:head>

<div class="todos">
	<h1>Notifications</h1>
	{#if $events instanceof Array}
		{#each $events.slice(0, show) as event (event.id)}
			<p
				in:receive={{ key: event.id }}
				out:send={{ key: event.id }}
				animate:flip={{ duration: 800 }}
			>
				<TextNote {event} />
			</p>
		{/each}
		{#if show < $events.length}
			<button on:click={showMore}>Show Older Events</button>
		{/if}
	{/if}
</div>

<style>
</style>
