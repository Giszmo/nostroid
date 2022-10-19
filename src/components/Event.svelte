<script type="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { IEvent } from '../db';
	import TagList from './TagList.svelte';

	export let event: IEvent;
	export let oddRow = false;

	const select = (id: string) => {
		goto(`${base}/event/${id}`);
	};
</script>

<table class="event {oddRow ? 'oddRow' : ''}" on:click={() => select(event.id)}>
	<colgroup>
		<col class="col-1" />
		<col class="col-2" />
	</colgroup>
	<tr><td><strong>ID: </strong></td><td class="right">{event?.id}</td></tr>
	<tr><td><strong>Pubkey: </strong></td><td class="right">{event?.pubkey}</td></tr>
	<tr><td><strong>Kind: </strong></td><td class="right">{event?.kind}</td></tr>
	<tr><td><strong>Content: </strong></td><td class="right">{event?.content}</td></tr>
	<tr><td><strong>Tags: </strong></td><td class="right"><TagList tags={event?.tags} /></td></tr>
	<tr><td><strong>CreatedAt: </strong></td><td class="right">{event?.created_at}</td></tr>
	<tr><td><strong>Signature: </strong></td><td class="right">{event?.sig}</td></tr>
</table>

<style>
	.event {
		border: 2px lightgray;
		border-radius: 5px;
		width: 100%;
		table-layout: fixed;
	}
	.oddRow {
		background-color: pink;
	}
	.right {
		word-break: break-word;
	}
	.col-1 {
		width: 100px;
	}
	.col-2 {
	}
</style>
