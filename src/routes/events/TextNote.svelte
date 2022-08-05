<script type="ts">
  import type { Event } from './types'
  import { marked } from 'marked'
  export let event: Event
</script>

<p><strong>{event.pubkey.slice(0, 8)}:</strong> {@html marked.parseInline(event.content)}</p>