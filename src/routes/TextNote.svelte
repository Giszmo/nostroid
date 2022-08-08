<script type="ts">
  import type { Event } from '../../types'
  import { marked } from 'marked'
  export let event: Event
  
  let text: string = event.content
  let name: string = event.pubkey.slice(0, 12)
</script>

<p><strong>{name}:</strong> {@html marked.parseInline(text)}</p>