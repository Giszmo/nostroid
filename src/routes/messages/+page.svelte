<script lang="ts">
  import DM from '../../components/DM.svelte'
  import TextNoteProfile from '../../components/TextNoteProfile.svelte'
  import { cProfiles } from '../../stores'
  import { liveQuery, type Observable } from "dexie"
  import { type IProfile, type IEvent, db } from "../../db"
  import { activeProfile } from '../../stores'
  import { encrypt } from 'nostr-tools/nip04.js'
  import { getEventHash, signEvent } from 'nostr-tools/event.js'
	// import { Data } from '../../data'

  let searchInput = ''
  let show = 10
  let active: IProfile|undefined
  let other: IProfile|undefined
  /** conversations by correspondence pubkey **/
  let conversations: Map<string, Array<IEvent>> = new Map()
  let newMessage: string = ''
  let newEvent: IEvent|undefined
  
  let showMore = () => {
    show += 10
  }
  
  let open = (c: string) => {
    other = $cProfiles.get(c)
    show = 10
  }
  
  let back = () => {
    other = undefined
  }
  
  /**
   * Update the event to be sent
   **/
  const processNewEvent = async () => {
    let privkey = active?.privkey
    let pubkey = active?.pubkey
    if (privkey && pubkey && other && newMessage.length != 0) {
      newEvent = {
        pubkey: pubkey,
        kind: 4,
        content: encrypt(privkey, other.pubkey, newMessage),
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p',other.pubkey]],
        id: '',
        sig: ''
      }
      newEvent.id = getEventHash(newEvent)
      newEvent.sig = await signEvent(newEvent, privkey)
      if (newMessage.endsWith('\n')) {
        // Data.instance.pool.setPrivateKey(privkey)
        // Data.instance.pool.publish(newEvent)
        newMessage = ''
        newEvent = undefined
      }
    } else {
      newEvent = undefined
    }
  }
  
  $: {
    active = $activeProfile as IProfile
    let evs = $events
    if (evs && active) {
      conversations.clear()
      ;(evs as Array<IEvent>).forEach(ev => {
        let o = ev.pubkey === active?.pubkey
          ? ev.tags.filter(t=>t[0]==='p')?.[0]?.[1]
          : ev.pubkey
        if (o) {
          conversations.set(o, [...(conversations.get(o) || []), ev])
        }
      })
      conversations = conversations
    }
  }

  $: events = liveQuery(async () => {
    const pubkey = active?.pubkey
    if (pubkey == undefined) {
      return []
    }
    return await db
      .events
      .orderBy('created_at').reverse()
      .filter((it) =>
        (it.pubkey == pubkey
          ||
          it.tags.find(t=>t[0]==='p' && t[1]===pubkey) != undefined
        )
        &&
        it.kind === 4
      )
      .toArray()
    })
  
  $: conversation = (other
    ? (conversations.get(other.pubkey) || []).sort((a,b)=>a.created_at-b.created_at)
    : []) as Array<IEvent>
  
  $: {
    active
    other
    newMessage
    processNewEvent()
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
    {#if active?.privkey }
      {#if newEvent}
        <DM event={newEvent}/>
      {/if}
      <textarea bind:value={newMessage}></textarea>
    {/if}
  {:else}
    <label>Search DMs: <input bind:value={searchInput}></label>
    {#each [...conversations] as p (p[0]) }
      <div on:click={() => open(p[0])}><TextNoteProfile pubkey={p[0]} /> ({p[1].length} messages)</div>
    {/each}
  {/if}
</div>

<style>
textarea {
  width: 100%;
  height: 1em;
}
.otherHeader {
  border-radius: 10px 10px 0 0;
  padding: 15px 5px 5px 5px;
  background-color: lightblue;
  text-align: center;
  margin: 5px;
}
</style>
