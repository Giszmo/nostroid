<script type="ts">
  import type { IEvent } from '../db'
  import { marked } from 'marked'
  export let event: IEvent
  
  let text: string = event.content
  let name: string = event.pubkey.slice(0, 12)
</script>

<p><strong>{name}:</strong> {@html marked.parseInline(text)}</p>