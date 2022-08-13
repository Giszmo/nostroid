<script lang="ts">
	import { page } from '$app/stores'
	import { db } from "../../db"
	import Event from "../../components/Event.svelte"
	import type { IEvent } from "../../db"
  import { liveQuery } from "dexie"
	
	const id = $page.params.id
	let e = liveQuery(() => db.events.get(id))
	$: event = $e as IEvent
</script>

<svelte:head>
  <title>Event</title>
</svelte:head>

<h1>Event {id}</h1>

<Event {event} />
