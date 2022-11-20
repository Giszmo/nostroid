<script lang="ts">
	import type { IEvent } from 'src/db';
	import TextNote from './TextNote.svelte';

	type Reply = {
		event: IEvent;
		children: Reply[];
		showAmount: number;
		level: number;
	};

	export let reply: Reply;
</script>

<TextNote event={reply.event} level={reply.level} />
{#each reply.children as child, i}
	{#if i < reply.showAmount}
		<svelte:self reply={child} />
	{/if}
{/each}

{#if reply.children.length > reply.showAmount}
	<button on:click={() => (reply.showAmount += 1)} style={`margin-left: ${reply.level * 2}rem`}
		>Show more</button
	>
{/if}

<style>
	button {
		margin: 10px;
		width: 100px;
		float: right;
	}
</style>
