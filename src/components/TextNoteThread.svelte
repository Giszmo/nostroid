<script lang="ts">
	import type { IEvent } from 'src/db';
	import TextNote from './TextNote.svelte';

	type Reply = {
		event: IEvent;
		children: Reply[];
	};

	export let reply: Reply;
	export let level = 0;
</script>

<TextNote event={reply.event} {level} />
{#each reply.children as child}
	<svelte:self reply={child} level={level + 1} />
{/each}
