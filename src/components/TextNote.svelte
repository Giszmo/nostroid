<script type="ts">
	import Time from './Time.svelte';
	import TextNoteProfile from './TextNoteProfile.svelte';
	import { tagLinky } from './TagLinky';

	import type { IEvent } from '../db';
	import { marked } from 'marked';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	export let event: IEvent;

	marked.setOptions({ breaks: true });
	let text: string = marked
		.parseInline(event.content)
		.replace(/(<br>\s*)+/, '<br>')
		.replace(/(<br>\s*)+$/, '');

	const showEvent = () => {
		goto(`${base}/event/${event.id}`);
	};
</script>

<div class="tn" on:click|stopPropagation={showEvent}>
	<TextNoteProfile pubkey={event.pubkey} />
	<div class="note">
		{#each tagLinky(text, event) as comp, i}
			<svelte:component this={comp.component} content={comp.content} />
		{/each}
	</div>
	<Time t={event.created_at} />
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
	}
</style>
