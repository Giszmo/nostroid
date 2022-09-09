<script lang="ts">
	import { page } from '$app/stores'
	import { db } from "../../../db"
	import Event from "../../../components/Event.svelte"
	import type { IEvent } from "../../../db"
  import { onMount } from 'svelte'
	
  let id = ''
  let event:IEvent|undefined
  
  onMount(async () => {
    id = $page.params.id
    event = await db.events.get(id)
  })
</script>

<svelte:head>
  <title>Event</title>
</svelte:head>

<h1>Event {id}</h1>

{#if event}
<Event {event} />
{:else}
Event not found.
{/if}
