<script type="ts">
	import { db } from '../db';
	import { liveQuery } from 'dexie';
	import type { Observable } from 'dexie';

	let c: Observable<string> = liveQuery(async () => {
		let [events, config, profiles, allProfiles] = await Promise.all([
			db.events.count(),
			db.config.count(),
			db.profiles.where('degree').below(100).count(),
			db.profiles.count()
		]);
		return `${events} events, ${config} configs and ${profiles} relevant of ${allProfiles} profiles`;
	});
</script>

{#if $c}
	Your DB contains {$c || 'loading ...'}.
{/if}
