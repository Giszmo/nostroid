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

	const replyPosted = ({ detail }: CustomEvent<IEvent>) => {
		const newReply = {
			event: detail,
			children: [],
			level: reply.level + 1,
			showAmount: reply.level === 1 ? 1 : 0
		};
		reply.children = [newReply, ...reply.children];
		reply.showAmount += 1;
	};
</script>

<TextNote
	event={reply.event}
	level={reply.level}
	replies={reply.children.length}
	on:posted={replyPosted}
/>
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
