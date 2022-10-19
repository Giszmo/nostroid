<script lang="ts">
	// import { generatePrivateKey, getPublicKey } from 'nostr-tools'
	import { generatePrivateKey, getPublicKey } from '../../lib/nostr-tools';
	import { bech32, fromWords } from '../../lib/bech32.js';
	import Profile from '../../components/Profile.svelte';
	import { db } from '../../db';
	import type { IProfile } from '../../db';
	import { liveQuery } from 'dexie';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let profiles = liveQuery(async () => {
		return await db.profiles.orderBy('index').toArray();
	});

	let newProfileName = 'nostroid-user';
	let newProfilePrivkey = '';
	let newProfilePubkey = '';
	let error = '';

	function hex(val: number) {
		if (val < 10) return String.fromCharCode(48 + val);
		if (val < 16) return String.fromCharCode(97 + val - 10);
	}

	function hexEncode(buf) {
		var str = '';
		for (let i = 0; i < buf.length; i++) {
			const c = buf[i];
			str += hex(c >> 4);
			str += hex(c & 0xf);
		}
		return str;
	}

	async function addProfile() {
		var profile: IProfile = {
			name: newProfileName,
			privkey: '',
			pubkey: '',
			avatar: '',
			degree: 0,
			index: Math.floor(Date.now() / 1000)
		};
		error = '';
		if (newProfileName.length == 0) {
			error = 'missing profile name';
			return;
		}
		switch (radioWhat) {
			case 'gen':
				profile.privkey = generatePrivateKey();
				profile.pubkey = getPublicKey(profile.privkey);
				break;
			case 'pub':
				profile.imported = true;
				var pubkey = '';
				if (newProfilePubkey.startsWith('npub')) {
					const x = bech32().decode(newProfilePubkey);
					const b = fromWords(x.words);
					pubkey = hexEncode(b);
					if (pubkey.length !== 64) {
						error = `"${newProfilePubkey}" is not a compatible npub key`;
						return;
					}
				} else if (newProfilePubkey.length === 64) {
					pubkey = newProfilePubkey;
				} else {
					error = `"${newProfilePubkey}" doesn't look like a pubkey`;
					return;
				}
				profile.pubkey = pubkey;
				break;
			case 'priv':
				profile.imported = true;
				var privkey = '';
				if (newProfilePrivkey.startsWith('nsec')) {
					const x = bech32().decode(newProfilePrivkey);
					const b = fromWords(x.words);
					privkey = hexEncode(b);
					if (privkey.length !== 64) {
						error = `"${newProfilePrivkey}" is not a compatible nsec key`;
						return;
					}
				} else if (newProfilePrivkey.length === 64) {
					privkey = newProfilePrivkey;
				} else {
					error = `"${newProfilePrivkey}" doesn't look like a privkey`;
					return;
				}
				profile.privkey = privkey;
				profile.pubkey = getPublicKey(privkey);
				break;
			default:
				return;
		}
		try {
			await db.profiles.put(profile);
		} catch (error) {
			error = `Failed to add ${profile}: ${error}`;
		}
		newProfilePrivkey = '';
		newProfilePubkey = '';
		newProfileName = 'nostroid-user';
	}
	let radioWhat = 'gen';

	const flipDurationMs = 200;
	function handleConsider(e: CustomEvent<DndEvent>) {
		items = e.detail.items as { id: string; profile: IProfile }[];
	}
	function handleFinalize(e: CustomEvent<DndEvent>) {
		items = e.detail.items as { id: string; profile: IProfile }[];
		var index = 0;
		const p = items.map((it) => {
			it.profile.index = index++;
			return it.profile;
		});
		db.profiles.bulkPut(p);
	}
	$: items = ($profiles as IProfile[])
		?.filter((it) => it?.degree == 0)
		?.map((it) => {
			return { id: it.pubkey, profile: it };
		});
</script>

<svelte:head>
	<title>Profiles</title>
	<meta name="description" content="To be implemented ..." />
</svelte:head>

<div class="todos">
	<h1>Profiles</h1>
	{#if items instanceof Array}
		<section
			use:dndzone={{ items, flipDurationMs }}
			on:consider={handleConsider}
			on:finalize={handleFinalize}
		>
			{#each items as idProfile (idProfile.id)}
				<div animate:flip={{ duration: flipDurationMs }}>
					<Profile profile={idProfile.profile} />
				</div>
			{/each}
		</section>
	{/if}
	<p>New Profile</p>
	<p>
		Profile Name: <input bind:value={newProfileName} />
	</p>
	<p>
		<label><input type="radio" bind:group={radioWhat} value="gen" />using new private key</label>
		<br />
		<label
			><input type="radio" bind:group={radioWhat} value="priv" />using imported private key</label
		>
		{#if radioWhat == 'priv'}
			<input bind:value={newProfilePrivkey} /> (format: hex or bech32)
		{/if}
		<br />
		<label><input type="radio" bind:group={radioWhat} value="pub" />using imported public key</label
		>
		{#if radioWhat == 'pub'}
			<input bind:value={newProfilePubkey} /> (format: hex or bech32)
		{/if}
	</p>
	{#if error.length > 0}
		<p style="color: red">{error}</p>
	{/if}
	<p>
		<button on:click={addProfile}>Add Account</button>
	</p>
</div>

<style>
</style>
