<script lang="ts">
	import TextNote from '../../components/TextNote.svelte'
	import { liveQuery } from "dexie"
	import { type IProfile, type IEvent, db } from "../../db"
  import { activeProfile } from '../../stores'

	$: active = $activeProfile as IProfile
	$: events = liveQuery(async () => {
		const pubkey = active.pubkey
		if (pubkey == undefined) {
			return []
		}
		return await db
			.events
			.orderBy('created_at').reverse()
			.filter((it) =>
				(it.pubkey == active.pubkey
					||
					it.tags.find(t=>t[0]==='p' && t[1]===active.pubkey) != undefined
				)
				&&
				it.kind === 4
			)
			.toArray()
	})
</script>

<svelte:head>
	<title>Messages</title>
	<meta name="description" content="Showing direct messages" />
</svelte:head>

<div class="todos">
	<h1>Messages</h1>
	{#if $events instanceof Array }
	{#each $events as event (event.id)}
		<p>
			<TextNote event={event}/>
		</p>
	{/each}
	{/if}
</div>

<style>
</style>
