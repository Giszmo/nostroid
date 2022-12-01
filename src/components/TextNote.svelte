<script type="ts">
	import Time from './Time.svelte';
	import TextNoteProfile from './TextNoteProfile.svelte';
	import { tagLinky } from './TagLinky';

	import type { IEvent } from '../db';
	import { marked } from 'marked';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	export let event: IEvent;
	export let selected = false;
	export let level = 0;
	export let replies: number;

	marked.setOptions({ breaks: true });
	let text: string = marked
		.parseInline(event.content)
		.replace(/(<br>\s*)+/, '<br>')
		.replace(/(<br>\s*)+$/, '');

	const showEvent = () => {
		goto(`${base}/event/${event.id}`);
	};
</script>

<div class="tn" on:click|stopPropagation={showEvent} style={`margin-left: ${level * 2}rem`}>
	<TextNoteProfile pubkey={event.pubkey} />
	<div class="note" class:note-selected={selected}>
		{#each tagLinky(text, event) as comp, i}
			<svelte:component this={comp.component} content={comp.content} />
		{/each}
	</div>
	<Time t={event.created_at} />
	{#if replies || replies === 0}
		<span class="reply-count">- {replies} Repl{replies == 1 ? 'y' : 'ies'}</span>
	{/if}
</div>

<style>
	.note {
		margin-left: 60px;
		overflow-x: auto;
	}
	.tn {
		border: 2px solid gray;
		border-radius: 15px;
		padding: 15px;
		cursor: pointer;
	}
	.note-selected {
		font-size: 1.5rem;
	}
	.reply-count {
		font: 0.8em lightgray bold;
	}
</style>
