<script lang="ts">
	import { db, type IEvent } from '../db';
	import { cProfiles } from '../stores';
	import TextNoteForm from '../components/TextNoteForm.svelte';
	import TextNote from '../components/TextNote.svelte';
	import { liveQuery, type Observable } from 'dexie';
	import { filterMap } from '../utils/array';

	let posts: Observable<IEvent[]>;
	// just for testing, needs work
	const update = (c) => {
		if (c.backing.size === 0) return;
		posts = liveQuery(async () => {
			const profiles = filterMap(
				[...$cProfiles.backing.values()],
				(p) => p.degree < 3,
				(p) => p.pubkey
			);
			const res = (
				await db.events
					.where('pubkey')
					.anyOf(profiles)
					.and((e) => e.kind === 1)
					.reverse()
					.sortBy('created_at')
			).slice(0, 100);
			return res;
		});
	};
	cProfiles.subscribe((c) => update(c));
</script>

<svelte:head>
	<title>Feed</title>
	<meta name="description" content="To be implemented ..." />
</svelte:head>

<h1>Feed</h1>

<div class="create-note-container">
	<TextNoteForm />
</div>
<div class="posts">
	{#if $posts instanceof Array}
		{#each $posts as post}
			<TextNote event={post} />
		{/each}
	{/if}
</div>

<style>
	.create-note-container {
		max-width: 600px;
		width: 100%;
		align-self: center;
	}
</style>
