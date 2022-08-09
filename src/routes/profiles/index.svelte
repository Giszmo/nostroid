<script lang="ts">
	import type { Profile } from '../../types'
	import { Data } from '../../data'
	import { generatePrivateKey, getPublicKey } from 'nostr-tools'
	import { bech32, fromWords } from '../../lib/bech32.js'
	import ProfileWidget from './ProfileWidget.svelte'

  const data = Data.instance
	data.connectDB(indexedDB)

	let profiles: Profile[] = []
	$: newProfileName = "nostroid-user"
	$: newProfilePrivkey = ""
	$: newProfilePubkey = ""
	let error = ""
	
	// HACK: this surely should work differently in Svelte:
	setInterval(() => {profiles = data.profiles}, 1000)
	
	function hex(val: number) {
		if (val < 10)
			return String.fromCharCode(48 + val)
		if (val < 16)
			return String.fromCharCode(97 + val - 10)
	}

	function hexEncode(buf)	{
		var str = ""
		for (let i = 0; i < buf.length; i++) {
			const c = buf[i]
			str += hex(c >> 4)
			str += hex(c & 0xF)
		}
		return str
	}

	
	let addAccount = () => {
		error = ""
		if (newProfileName.length == 0) {
			error = "missing profile name"
			return
		}
		switch (radioWhat) {
			case "gen":
				const privkey = generatePrivateKey()
				const pubkey = getPublicKey(privkey)
				data.profiles.push({
					name: newProfileName,
					privkey: privkey,
					pubkey: pubkey
				})
				break
			case "pub":
				var k = ''
				if (newProfilePubkey.startsWith('npub')) {
					const x = bech32().decode(newProfilePubkey)
					const b = fromWords(x.words)
					k = hexEncode(b)
					if (k.length !== 64) {
						error = `"${newProfilePubkey}" is not a compatible npub key`
						return
					}
				} else if (newProfilePubkey.length === 64) {
					k = newProfilePubkey
				} else {
					error = `"${newProfilePubkey}" doesn't look like a pubkey`
					return
				}
				data.profiles.push({
					name: newProfileName,
					privkey: undefined,
					pubkey: k
				})
				break
			case "priv":
				var k = ''
				if (newProfilePrivkey.startsWith('nsec')) {
					const x = bech32().decode(newProfilePrivkey)
					const b = fromWords(x.words)
					k = hexEncode(b)
					if (k.length !== 64) {
						error = `"${newProfilePrivkey}" is not a compatible nsec key`
						return
					}
				} else if (newProfilePrivkey.length === 64) {
					k = newProfilePubkey
				} else {
					error = `"${newProfilePrivkey}" doesn't look like a privkey`
					return
				}
				data.profiles.push({
					name: newProfileName,
					privkey: k,
					pubkey: getPublicKey(k)
				})
				break
		}
		newProfilePrivkey = ""
		newProfilePubkey = ""
		newProfileName = "nostroid-user"
	}
	let radioWhat = "gen"
</script>

<svelte:head>
	<title>Profiles</title>
	<meta name="description" content="To be implemented ..." />
</svelte:head>

<div class="todos">
	<h1>Profiles</h1>
	{#each profiles as profile}
		<p>
			<ProfileWidget {profile} />
		</p>
	{/each}
	<p>New Profile</p>
	<p>
		Profile Name: <input bind:value={newProfileName}>
	</p>
	<p>
		<label><input
			type="radio"
			bind:group={radioWhat}
			value="gen" />using new private key</label>
		<br>
		<label><input
			type="radio"
			bind:group={radioWhat}
			value="priv" />using imported private key</label>
		{#if radioWhat == "priv"}
			<input bind:value={newProfilePrivkey} > (format: hex or bech32)
		{/if}
		<br>
		<label><input
			type="radio"
			bind:group={radioWhat}
			value="pub" />using imported public key</label>
		{#if radioWhat == "pub"}
			<input bind:value={newProfilePubkey} > (format: hex or bech32)
		{/if}
	</p>
	{#if error.length > 0}
		<p style="color: red">{error}</p>
	{/if}
	<p>
		<button on:click={addAccount}>Add Account</button>
	</p>
</div>

<style>
	.todos {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}
</style>
