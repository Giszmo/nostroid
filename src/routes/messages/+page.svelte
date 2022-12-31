<script lang="ts">
	import TextNoteProfile from '../../components/TextNoteProfile.svelte';
	import { liveQuery } from 'dexie';
	import { type IProfile, type IEvent, db } from '../../db';
	import { activeProfile } from '../../stores';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let searchInput = '';
	let show = 10;
	let other: IProfile | undefined;
	/** conversations by correspondence pubkey **/
	let conversations: Map<string, Array<IEvent>> = new Map();

	const profileSubscription = activeProfile.subscribe(() => {
		other = undefined;
	});

	const updateConversations = (evs: Array<IEvent>) => {
		conversations = new Map();
		evs.forEach((ev) => {
			let o =
				ev.pubkey === $activeProfile?.pubkey
					? ev.tags.filter((t) => t.startsWith('p»'))?.[0]?.split('»', 3)[1]
					: ev.pubkey;
			if (o) {
				conversations.set(o, [...(conversations.get(o) || []), ev]);
				conversations = conversations;
			}
		});
	};

	$: {
		let evs = $activeProfile ? $events || [] : [];
		updateConversations(evs as Array<IEvent>);
	}

	const getEventsForFromPubkey = async (p: string | undefined) => {
		const t1 = Date.now();
		if (!p) return [];
		let twoEvs = await Promise.all([
			db.events.where('pubkey').equals(p).toArray(),
			db.events.where('tags').startsWith(`p»${p}`).toArray()
		]);
		const retVal = [...new Set(twoEvs.flatMap((it) => it.filter((it) => it.kind === 4)))].sort(
			(a, b) => b.created_at - a.created_at
		);
		const dt = Date.now() - t1;
		console.log(`Loading ${retVal.length} DMs took ${dt}ms.`);
		return retVal;
	};

	$: events = liveQuery(() => getEventsForFromPubkey($activeProfile?.pubkey));

	onDestroy(() => {
		profileSubscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Messages</title>
	<meta name="description" content="Showing direct messages" />
</svelte:head>

<div>
	<h1>Messages</h1>

	<label>Search DMs: <input bind:value={searchInput} /></label>
	{#each [...conversations] as p (p[0])}
		<div class="conversation" on:click={() => goto(`/messages/${p[0]}`)}>
			<TextNoteProfile pubkey={p[0]} /> ({p[1].length} messages)
		</div>
	{/each}
</div>

<style>
	.conversation {
		clear: both;
		border-radius: 10px;
		background-color: lightblue;
		margin: 5px;
		padding: 5px;
	}
</style>
