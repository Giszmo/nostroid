<script type="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import type { IEvent } from "../db"
  import TagList from './TagList.svelte'
  
  export let event: IEvent
  export let oddRow = false
  
  const select = (id: string) => {
    goto(`${base}/event/${id}`)
  }
</script>

<table class='event { oddRow ? "oddRow" : ""}' on:click={() => select(event.id)}>
  <tr><td><strong>Kind: </strong></td><td>{event?.kind}</td></tr>
  <tr><td><strong>Content: </strong></td><td>{event?.content}</td></tr>
  <tr><td><strong>Tags: </strong></td><td><TagList tags={event?.tags} /></td></tr>
  <tr><td><strong>Created At: </strong></td><td>{event?.created_at}</td></tr>
  <tr><td><strong>Pubkey: </strong></td><td>{event?.pubkey}</td></tr>
  <tr><td><strong>ID: </strong></td><td>{event?.id}</td></tr>
  <tr><td><strong>Signature: </strong></td><td>{event?.sig}</td></tr>
</table>

<style>
  .event {
    border: 2px lightgray;
    border-radius: 5px;
  }
  
  .oddRow {
    background-color: pink;
  }
</style>
