<script type="ts">
  import type { IEvent, IProfile } from '../db'
  import { marked } from 'marked'
  import { decrypt } from 'nostr-tools/nip04.js'
  import { activeProfile } from '../stores'
  import Time from './Time.svelte'

  export let event: IEvent
  marked.setOptions({breaks: true})
  const rexp = /#\[(.*?)\]/g
  const replaceTags = (_: string, $1: number) => {
    const tag = event.tags[$1] || []
    console.log(tag)
    if (tag[0] == 'e') return `<a href="/event/${tag[1]}">Event ${tag[1]}</a>`
    if (tag[0] == 'p') return `<a href="/${tag[1]}">Profile ${tag[1]}</a>`
    return tag[0] + tag[1]
  }
  $: active = $activeProfile as IProfile
  let text = ''
  $: {
    let decrypted
    if (active?.privkey) {
      let other = event.pubkey === active.pubkey
        ? event.tags.filter(t=>t[0]==='p')[0][1]
        : event.pubkey
      try {
        decrypted = decrypt(active.privkey, other, event.content)
      } catch(e) {
        decrypted = 'failed to decrypt message...'
      }
    } else {
      decrypted = 'not ecrypted for us...'
    }
    text = marked
      .parseInline(decrypted)
      .replace(rexp, replaceTags)
      .replace(/(<br>\s*)+/, "<br>")
      .replace(/(<br>\s*)+$/, "")
  }
  $: ourMessage = event.pubkey === active?.pubkey
</script>

<div class="note {ourMessage ? '' : 'them'}">
  <div class="bubble {ourMessage ? '' : 'them'}">
    {@html text}
  </div>
  <Time t={event.created_at} />
</div>

<style>
.note {
  margin: 5px;
}
.bubble {
  overflow-x: auto;
  padding: 5px;
  margin-right: 20%;
  border-radius: 0 10px 10px 0;
  background-color: lightyellow;
}
.them {
  text-align: right;
}
.bubble.them {
  border-radius: 10px 0 0 10px;
  background-color: lightblue;
  margin-right: unset;
  margin-left: 20%;
}
</style>