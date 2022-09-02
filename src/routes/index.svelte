<script lang="ts">
  import TextNote from '../components/TextNote.svelte'
  import { liveQuery } from "dexie"
  import { db } from "../db"
  import type { IProfile, IEvent } from "../db"
  import { activeProfile } from '../stores'
  import { crossfade } from 'svelte/transition'
  import { quintInOut } from 'svelte/easing'
  import { flip } from 'svelte/animate'

  let show = 10
  let since = Date.now() / 1000 - 30 * 24 * 60 * 60 // initially load one month
  $: active = $activeProfile as IProfile
  $: events = liveQuery(async () => {
    const pubkey = active.pubkey
    if (pubkey == undefined) {
      return []
    }
    return (await db
      .events
      .where('created_at')
      .above(since)
      .filter((it) =>
        it.kind === 1
        &&
        (it.pubkey == active.pubkey
          ||
        it.tags.findIndex(tag => tag[0] == 'p' && tag[1] == active.pubkey) >= 0)
      )
      .sortBy('created_at'))
      .reverse() 
  })

  activeProfile.subscribe(() => {
    show = 10
  })

  let showMore = () => {
    show += 10
    if ($events instanceof Array && show + 10 > $events.length) {
      since -= 30 * 24 * 60 * 60
    }
  }
  
  const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 2000),

		fallback(node, params) {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none'
        ? ''
        : style.transform

			return {
				duration: 200,
				easing: quintInOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			}
		}
	})
</script>

<svelte:head>
   <title>Feed</title>
  <meta name="description" content="Showing nostr events" />
</svelte:head>

<div class="todos">
  <h1>Feed</h1>
  {#if $events instanceof Array }
  {#if show < $events.length }
    <button on:click={showMore}>Show Older Messages</button>
  {/if}
  {#each $events.slice(0, show).reverse() as event (event.id)}
    <p in:receive="{{key: event.id}}"
				out:send="{{key: event.id}}"
        animate:flip="{{duration: 800}}">
      <TextNote event={event}/>
    </p>
  {/each}
  {/if}
</div>

<style>
</style>
