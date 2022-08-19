<script type="ts">
  import { db } from "../db"
  import { liveQuery } from "dexie"
  import type { Observable } from "dexie"
  import { Data } from '../data'

  let c: Observable<string> = liveQuery(async () => {
    let [events, config, profiles, tags] = await Promise.all([
       db.events.count(),
       db.config.count(),
       db.profiles.count(),
       db.tags.count()
    ])
    const backlog = Data.instance.events.length
    return `${events} events${ backlog > 0
      ? `, ${backlog} events to parse`
      : ''}, ${config} configs, ${profiles} profiles, ${tags} tags`
  })
</script>

{#if $c}
Your DB contains {$c || 'loading ...'}.
{/if}