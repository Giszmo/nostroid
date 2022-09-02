<script type="ts">
  import { base } from '$app/paths'
  import { goto } from '$app/navigation'
  import TextNote from './TextNote.svelte'
  import { liveQuery, type Observable } from "dexie"
  import { db, type IEvent } from "../db"

  export let content: {eventId: string}
  
  let event: Observable<IEvent|undefined> = liveQuery(async () => {
    let x = await db.events.get(content.eventId)
    if (!x) {
      db.events.add(<IEvent>{
        id: content.eventId,
        pubkey: '',
        created_at: 0,
        kind: -1,
        tags: [],
        content: '',
        sig: '',
        missing: true
      })
    }
    return x
   })
  let e: IEvent
  
  $: e = $event as IEvent

  const showEvent = () => {
    goto(`${base}/event/${content.eventId}`)
  }
</script>

{#if e && e.kind == 1}
  <TextNote event={e} />
{:else}
  <span class="event" on:click|stopPropagation={showEvent}>{e?.kind ? `Kind ${e.kind} ` : ''}Event/{content.eventId}</span>
{/if}

<style>
.event {
  font-weight: bold;
  background-color: lightblue;
}
</style>