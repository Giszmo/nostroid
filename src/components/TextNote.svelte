<script type="ts">
	import Time from './Time.svelte';
	import TextNoteProfile from './TextNoteProfile.svelte';
	import { tagLinky } from './TagLinky';

	import type { IEvent } from '../db';
	import { marked } from 'marked';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import TextNoteForm from './TextNoteForm.svelte';
	import TextNoteLoading from './TextNoteLoading.svelte';
	import { cProfiles } from '../stores';

	export let event: IEvent | undefined;
	export let selected = false;
	export let level = 0;
	export let replies: number;
	export let loading = false;
	let showReplyForm = false;
	let ready = false;
	let text: string;

	cProfiles.subscribe((cache) => {
		if (cache.backing.size > 10) {
			ready = true;
		}
	});

	marked.setOptions({ breaks: true });

	$: {
		if (event) {
			text = marked
				.parseInline(event.content)
				.replace(/(<br>\s*)+/, '<br>')
				.replace(/(<br>\s*)+$/, '');
		}
	}

	const showEvent = () => {
		goto(`${base}/event/${event.id}`);
	};
</script>

{#if loading || !ready}
	<TextNoteLoading {level} />
{:else if event}
	<div style={`margin-left: ${level * 2}rem`}>
		<div class="tn" on:click|stopPropagation={showEvent}>
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
		<button class="link-btn" on:click={() => (showReplyForm = !showReplyForm)}>Reply</button>
		{#if showReplyForm}
			<TextNoteForm replyTo={event} on:posted on:posted={() => (showReplyForm = !showReplyForm)} />
		{/if}
	</div>
{/if}

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
