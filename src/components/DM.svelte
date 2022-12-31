<script type="ts">
	import type { IEvent } from '../db';
	import { marked } from 'marked';
	import { activeProfile } from '../stores';
	import Time from './Time.svelte';
	import { tagLinky } from './TagLinky';

	export let event: IEvent;
	marked.setOptions({ breaks: true });
	let text = '';

	$: {
		text = marked
			.parseInline(event.content)
			.replace(/(<br>\s*)+/, '<br>')
			.replace(/(<br>\s*)+$/, '');
	}

	$: ourMessage = event.pubkey === $activeProfile?.pubkey;
	const copy = () => {
		navigator.clipboard.writeText(JSON.stringify(event).replace('»', '","'));
	};
</script>

<div class="note {ourMessage ? '' : 'them'}">
	<div class="bubble {ourMessage ? '' : 'them'}">
		{#each tagLinky(text, event) as comp, i}
			<svelte:component this={comp.component} content={comp.content} />
		{/each}
	</div>
	<Time t={event.created_at} />
	<span title="copy raw event" on:click={copy}>copy</span>
</div>

<style>
	.note {
		margin: 5px;
	}
	.bubble {
		overflow-x: auto;
		padding: 5px;
		margin-right: 20%;
		border-radius: 0 10px 10px 0;
		background-color: lightyellow;
	}
	.them {
		text-align: right;
	}
	.bubble.them {
		border-radius: 10px 0 0 10px;
		background-color: lightblue;
		margin-right: unset;
		margin-left: 20%;
	}
</style>
