<script type="ts">
	import type { IEvent } from '../db';
	import { marked } from 'marked';
	import { decrypt } from '../lib/nostr-tools/nip04.js';
	import { activeProfile } from '../stores';
	import Time from './Time.svelte';
	import { tagLinky } from './TagLinky';

	export let event: IEvent;
	marked.setOptions({ breaks: true });
	let text = '';

	$: decrypter(event, $activeProfile);

	const decrypter = async (..._: any) => {
		if (!event?.pubkey || !$activeProfile?.pubkey) return;
		let decrypted;
		let other =
			event.pubkey === $activeProfile.pubkey
				? event.tags.filter((t) => t.startsWith('p»'))[0]?.split('»', 3)[1]
				: event.pubkey;
		try {
			if ($activeProfile.privkey) {
				decrypted = decrypt($activeProfile.privkey, other, event.content);
			} else if ($activeProfile.pubkey == (await window.nostr.getPublicKey()))
				decrypted = await window.nostr.nip04.decrypt(other, event.content);
			else decrypted = 'not meant for us...';
		} catch (e) {
			console.error(`${e}`);
			decrypted = 'failed to decrypt message...';
		}
		text = marked
			.parseInline(decrypted)
			.replace(/(<br>\s*)+/, '<br>')
			.replace(/(<br>\s*)+$/, '');
	};

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
