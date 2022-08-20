<script type="ts">
  import TextNoteProfile from './TextNoteProfile.svelte'
  import type { IEvent } from '../db'
  import { marked } from 'marked'
  
  export let event: IEvent
  marked.setOptions({breaks: true})
  const rexp = /#\[(.*?)\]/g
  const replaceTags = (_: string, $1: number) => {
    const tag = event.tags[$1] || []
    if (tag[0] == 'e') return `<a href="/event/${tag[1]}">Event ${tag[1]}</a>`
    if (tag[0] == 'p') return `<a href="/${tag[1]}">Profile ${tag[1]}</a>`
    return tag[0] + tag[1]
  }
  let text: string = marked
    .parseInline(event.content)
    .replace(rexp, replaceTags)
    .replace(/(<br>\s*)+/, "<br>")
    .replace(/(<br>\s*)+$/, "")
</script>

<div class="tn">
<TextNoteProfile pubkey={event.pubkey} />
<div class="note">{@html text}</div>
</div>

<style>
.note {
  margin-left: 60px;
}

.tn {
  border: 2px solid gray;
  border-radius: 5px;
  padding: 15px;
}
</style>