<script lang="ts">
	import { page } from '$app/stores';
	import { db, type IEvent } from '../../../db';
	import { liveQuery } from 'dexie';
	import { activeProfile } from '../../../stores';
	import TextNoteProfile from '../../../components/TextNoteProfile.svelte';
	import DM from '../../../components/DM.svelte';
	import { decrypt as localDecrypt, encrypt } from '../../../lib/nostr-tools/nip04.js';
	import { sendPersistEvent } from '../../../nostrHelper';

	const otherPubkey = $page.params.pubkey;
	let events;
	let show = 10;
	let messages: IEvent[] = [];
	let newMessage = '';
	let newEvent: IEvent | undefined;

	$: {
		$activeProfile;
		events = liveQuery(async () => {
			if (!$activeProfile) return;
			const twoEvs = await Promise.all([
				db.events
					.where('pubkey')
					.equals(otherPubkey)
					.and((e) => e.tags.includes(`p»${$activeProfile.pubkey}`))
					.toArray(),
				db.events
					.where('tags')
					.startsWith(`p»${otherPubkey}`)
					.and((e) => e.pubkey === $activeProfile.pubkey)
					.toArray()
			]);
			return [...new Set(twoEvs.flatMap((it) => it.filter((it) => it.kind === 4)))].sort(
				(a, b) => a.created_at - b.created_at
			);
		});
	}

	const decrypt = async (event: IEvent): Promise<IEvent | undefined> => {
		if (!event?.pubkey || !$activeProfile?.pubkey) return;
		let decrypted;
		let other =
			event.pubkey === $activeProfile.pubkey
				? event.tags.filter((t) => t.startsWith('p»'))[0]?.split('»', 3)[1]
				: event.pubkey;

		if ($activeProfile.privkey) {
			decrypted = localDecrypt($activeProfile.privkey, other, event.content);
		} else if (window.nostr && $activeProfile.pubkey == (await window.nostr.getPublicKey())) {
			decrypted = await window.nostr.nip04.decrypt(other, event.content);
		} else {
			decrypted = 'not meant for us...';
		}

		return {
			...event,
			content: decrypted
		};
	};

	$: decryptAll($events);
	const decryptAll = async (events) => {
		if (!events?.length) return;
		for (const ev of events) {
			if (messages.findIndex((e) => e.id === ev.id) !== -1) continue;

			const decrypted = await decrypt(ev);
			messages.push(decrypted);
		}
		messages = messages;
	};

	const processNewEvent = async () => {
		let privkey = $activeProfile?.privkey;
		let pubkey = $activeProfile?.pubkey;
		if (pubkey && otherPubkey && newMessage.length != 0) {
			let content = '';
			if (window.nostr && (await window.nostr.getPublicKey()) === pubkey) {
				content = await window.nostr.nip04.encrypt(otherPubkey, newMessage.trim());
			} else if (privkey) {
				content = encrypt(privkey, otherPubkey, newMessage.trim());
			}
			newEvent = {
				pubkey: pubkey,
				kind: 4,
				content,
				created_at: Math.floor(Date.now() / 1000),
				tags: [`p»${otherPubkey}`],
				id: '',
				sig: ''
			};

			sendPersistEvent(4, newEvent.tags, newEvent.content);
			newMessage = '';
		}
		newEvent = undefined;
		show += 1;
	};
</script>

<div>
	<div class="otherHeader">
		<TextNoteProfile pubkey={otherPubkey} />
	</div>
	{#if show < messages.length}
		<button on:click={() => (show += 10)}>Show Older Messages</button>
	{/if}
	{#if messages?.length}
		{#each messages.slice(-show) as event (event.id)}
			<DM {event} />
		{/each}
	{/if}
	{#if window.nostr || $activeProfile?.privkey}
		<div class="new-message">
			<input bind:value={newMessage} on:keypress={(e) => e.key == 'Enter' && processNewEvent()} />
			<button on:click={() => processNewEvent()}>Send</button>
		</div>
	{/if}
</div>

<style>
	.otherHeader {
		border-radius: 10px 10px 0 0;
		padding: 15px 5px 5px 5px;
		background-color: lightblue;
		text-align: center;
		margin: 5px;
		display: flex;
	}
	.new-message {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 5px;
	}
	input {
		width: 100%;
		height: 1em;
	}
</style>
