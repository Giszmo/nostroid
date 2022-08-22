<script lang="ts">
  import DM from '../../components/DM.svelte'
  import TextNoteProfile from '../../components/TextNoteProfile.svelte'
  import { profileCache } from '../../stores'
  import { liveQuery } from "dexie"
  import { type IProfile, type IEvent, db } from "../../db"
  import { activeProfile } from '../../stores'

  let searchInput = ''
  let show = 10
  let showMore = () => {
    show += 10
  }
  $: active = $activeProfile as IProfile
  let other: IProfile|undefined
  let open = (c: string) => {
    other = $profileCache.get(c)
    show = 10
  }
  let back = () => {
    other = undefined
  }
  /** conversations by correspondence pubkey **/
  let conversations: Map<string, Array<IEvent>> = new Map()
  $: {
    if ($events && active) {
      conversations.clear()
      ;($events as Array<IEvent>).forEach(ev => {
        let o = ev.pubkey === active.pubkey
          ? ev.tags.filter(t=>t[0]==='p')[0][1]
          : ev.pubkey
        // let c = conversations.get(o) || []
        // c.push(ev)
        conversations.set(o, [...(conversations.get(o) || []), ev])
      })
      conversations = conversations
    }
  }
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
  $: conversation = (other
    ? (conversations.get(other.pubkey) || []).sort((a,b)=>a.created_at-b.created_at)
    : []) as Array<IEvent>
  let newMessage = ''
  $: {
    if (newMessage.endsWith('a')) {
      newMessage = ''
    }
  }
</script>

<svelte:head>
  <title>Messages</title>
  <meta name="description" content="Showing direct messages" />
</svelte:head>

<div>
  <h1>Messages</h1>
  {#if other }
    <div class="otherHeader" on:click={() => back()}>
      <TextNoteProfile pubkey={other.pubkey} />
    </div>
    {#if show < conversation.length }
      <button on:click={showMore}>Show Older Messages</button>
    {/if}
    {#each conversation.slice(-show) as event (event.id)}
      <DM event={event}/>
    {/each}
    {#if show < conversation.length }
      <input bind:value={newMessage}>
    {/if}
  {:else}
    <label>Search DMs: <input bind:value={searchInput}></label>
    {#each [...conversations] as p (p) }
      <div on:click={() => open(p[0])}><TextNoteProfile pubkey={p[0]} /> ({p[1].length} messages)</div>
    {/each}
  {/if}
</div>

<style>
.otherHeader {
  border-radius: 10px 10px 0 0;
  padding: 15px 5px 5px 5px;
  background-color: lightblue;
  text-align: center;
  margin: 5px;
}
</style>
