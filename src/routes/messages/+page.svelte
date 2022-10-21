<script lang="ts">
  import DM from '../../components/DM.svelte'
  import TextNoteProfile from '../../components/TextNoteProfile.svelte'
  import { cProfiles } from '../../stores'
  import { liveQuery } from "dexie"
  import { type IProfile, type IEvent, db } from "../../db"
  import { activeProfile } from '../../stores'
  // import { encrypt } from 'nostr-tools/nip04.js'
  import { encrypt } from '../../lib/nostr-tools/nip04.js'
  import { sendPersistEvent } from '../../nostrHelper'
  import { onDestroy } from 'svelte';

	let searchInput = '';
	let show = 10;
	let other: IProfile | undefined;
	/** conversations by correspondence pubkey **/
	let conversations: Map<string, Array<IEvent>> = new Map();
	let newMessage: string = '';
	let newEvent: IEvent | undefined;

	let showMore = () => {
		show += 10;
	};

	let open = (c: string) => {
		other = $cProfiles.get(c);
		show = 10;
	};

	let back = () => {
		other = undefined;
	};

	const profileSubscription = activeProfile.subscribe(() => {
    other = undefined
    })

	/**
	 * Update the event to be sent
	 **/
	const processNewEvent = async () => {
		let privkey = $activeProfile?.privkey;
		let pubkey = $activeProfile?.pubkey;
		if (privkey && pubkey && other && newMessage.length != 0) {
			newEvent = {
				pubkey: pubkey,
				kind: 4,
				content: encrypt(privkey, other.pubkey, newMessage.trim()),
				created_at: Math.floor(Date.now() / 1000),
				tags: [`p»${other.pubkey}`],
				id: '',
				sig: ''
			};
			if (newMessage.endsWith('\n')) {
				sendPersistEvent(4, newEvent.tags, newEvent.content, privkey);
				newMessage = '';
				newEvent = undefined;
			}
		} else {
			newEvent = undefined;
		}
	};

	const updateConversations = (evs: Array<IEvent>) => {
		conversations = new Map();
		evs.forEach((ev) => {
			let o =
				ev.pubkey === $activeProfile?.pubkey
					? ev.tags.filter((t) => t.startsWith('p»'))?.[0]?.split('»', 3)[1]
					: ev.pubkey;
			if (o) {
				conversations.set(o, [...(conversations.get(o) || []), ev]);
				conversations = conversations;
			}
		});
	};

	$: {
		let evs = $activeProfile ? $events || [] : [];
		updateConversations(evs as Array<IEvent>);
	}

	const getEventsForFromPubkey = async (p: string | undefined) => {
		const t1 = Date.now();
		if (!p) return [];
		let twoEvs = await Promise.all([
			db.events.where('pubkey').equals(p).toArray(),
			db.events.where('tags').startsWith(`p»${p}`).toArray()
		]);
		const retVal = [...new Set(twoEvs.flatMap((it) => it.filter((it) => it.kind === 4)))].sort(
			(a, b) => b.created_at - a.created_at
		);
		const dt = Date.now() - t1;
		console.log(`Loading ${retVal.length} DMs took ${dt}ms.`);
		return retVal;
	};

	$: events = liveQuery(() => getEventsForFromPubkey($activeProfile?.pubkey));

	$: conversation = (
		other ? (conversations.get(other.pubkey) || []).sort((a, b) => a.created_at - b.created_at) : []
	) as Array<IEvent>;

	$: {
		$activeProfile;
		other;
		newMessage;
		processNewEvent();
	}

  onDestroy(()=>{
    profileSubscription.unsubscribe()
  })
</script>

<svelte:head>
	<title>Messages</title>
	<meta name="description" content="Showing direct messages" />
</svelte:head>

<div>
	<h1>Messages</h1>
	{#if other}
		<div class="otherHeader" on:click={() => back()}>
			<TextNoteProfile pubkey={other.pubkey} />
		</div>
		{#if show < conversation.length}
			<button on:click={showMore}>Show Older Messages</button>
		{/if}
		{#each conversation.slice(-show) as event (event.id)}
			<DM {event} />
		{/each}
		{#if $activeProfile?.privkey}
			{#if newEvent}
				<DM event={newEvent} />
			{/if}
			<textarea bind:value={newMessage} />
		{/if}
	{:else}
		<label>Search DMs: <input bind:value={searchInput} /></label>
		{#each [...conversations] as p (p[0])}
			<div class="conversation" on:click={() => open(p[0])}>
				<TextNoteProfile pubkey={p[0]} /> ({p[1].length} messages)
			</div>
		{/each}
	{/if}
</div>

<style>
	textarea {
		width: 100%;
		height: 1em;
	}
	.otherHeader {
		border-radius: 10px 10px 0 0;
		padding: 15px 5px 5px 5px;
		background-color: lightblue;
		text-align: center;
		margin: 5px;
		display: flex;
	}
	.conversation {
		clear: both;
		border-radius: 10px;
		background-color: lightblue;
		margin: 5px;
		padding: 5px;
	}
</style>
