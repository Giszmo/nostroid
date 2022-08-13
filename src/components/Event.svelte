<script type="ts">
  import { goto } from '$app/navigation';
  import type { IEvent } from "../db"
  import TagList from './TagList.svelte'
  
  export let event: IEvent
  export let showButtons = false
  export let oddRow = false
  
  const select = (id: string) => {
    goto(`/event/${id}`)
  }
</script>

<ul class='event { oddRow ? "oddRow" : ""}'>
  {#if showButtons}
    <li><button on:click={() => select(event.id)}>load</button></li>
  {/if}
  <li><strong>Kind: </strong>{event?.kind}</li>
  <li><strong>Content: </strong>{event?.content}</li>
  <li><strong>Tags: </strong><TagList tags={event?.tags} /></li>
  <li><strong>Created At: </strong>{event?.created_at}</li>
  <li><strong>Pubkey: </strong>{event?.pubkey}</li>
  <li><strong>ID: </strong>{event?.id}</li>
  <li><strong>Signature: </strong>{event?.sig}</li>
</ul>

<style>
  .event {
    border: 2px lightgray;
    border-radius: 5px;
  }
  
  .oddRow {
    background-color: pink;
  }
</style>
