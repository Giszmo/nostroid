<script type="ts">
  import Time from './Time.svelte'
  import TextNoteProfile from './TextNoteProfile.svelte'
  import InlineEvent from './InlineEvent.svelte'
  import InlineHtml from './InlineHtml.svelte'
  import InlinePubkey from './InlinePubkey.svelte'
  import InlineTagReference from './InlineTagReference.svelte'

  import type { IEvent } from '../db'
  import { marked } from 'marked'
  import { base } from '$app/paths'
  import { goto } from '$app/navigation'
  
  export let event: IEvent
  
  marked.setOptions({breaks: true})
  let text: string = marked
    .parseInline(event.content)
    .replace(/(<br>\s*)+/, "<br>")
    .replace(/(<br>\s*)+$/, "")
  const showEvent = () => {
    goto(`${base}/event/${event.id}`)
  }

  interface IComponentContent {
    component: any
    content: object
  }

  /**
   * Splits a string into components
   * 
   * @param text - the text with links
   * @returns array<IComponent>
   */
  function tagLinky(text: string) {
    const regexp = /#\[(.*?)\]/g
    const parts: IComponentContent[] = []
    let match: RegExpExecArray | null
    let start = 0
    while (match = regexp.exec(text)) {
      const gap = text.slice(start, match.index)
      if (gap.length > 0)
        parts.push({component: InlineHtml, content: {msg: gap}})
      const tagRef = parseInt(match[1])
      const tag = event.tags[tagRef]
      if (tag) {
        switch(tag[0]) {
          case 'e':
            parts.push({component: InlineEvent, content: {eventId: tag[1]}})
            break
          case 'p':
            parts.push({component: InlinePubkey, content: {pubkey: tag[1]}})
            break
          default:
            parts.push({component: InlineTagReference, content: {k: tag[0], v: tag[1]}})
        }
      } else {
        parts.push({component: InlineHtml, content: {msg: match[0]}})
      }
      start = regexp.lastIndex
    }
    parts.push({component: InlineHtml, content: {msg: text.slice(start)}})
    return parts
  }
</script>

<div class="tn" on:click|stopPropagation={showEvent}>
<TextNoteProfile pubkey={event.pubkey} />
<div class="note">
  {#each tagLinky(text) as comp, i}
    <svelte:component this={comp.component} content={comp.content} />
  {/each}
</div>
<Time t={event.created_at} />
</div>

<style>
.note {
  margin-left: 60px;
  overflow-x: auto;
}

.tn {
  border: 2px solid gray;
  border-radius: 15px;
  padding: 15px;
}
</style>