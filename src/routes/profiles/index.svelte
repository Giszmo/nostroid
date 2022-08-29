<script lang="ts">
	import { randomKeypair } from 'teahouse'
	import { bech32, fromWords } from '../../lib/bech32.js'
	import { getPublicKey, utils } from '@noble/secp256k1';
	import Profile from '../../components/Profile.svelte'
	import { db } from "../../db"
	import type { IProfile } from "../../db"
  import { liveQuery } from "dexie"
	import { Data } from '../../data'

	let profiles = liveQuery(() => db.profiles.toArray())
	
	// let profiles: Profile[] = []
	$: newProfileName = "nostroid-user"
	$: newProfilePrivkey = ""
	$: newProfilePubkey = ""
	let error = ""
	
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

	async function addProfile() {
		var profile: IProfile
		error = ""
		if (newProfileName.length == 0) {
			error = "missing profile name"
			return
		}
		switch (radioWhat) {
			case "gen":
			    const keys = randomKeypair()
				profile = {
					name: newProfileName,
					privkey: keys.sk,
					pubkey: keys.pk,
					avatar: ''
				}
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
				profile = {
					name: newProfileName,
					privkey: '',
					pubkey: k,
					avatar: ''
				}
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
					k = newProfilePrivkey
				} else {
					error = `"${newProfilePrivkey}" doesn't look like a privkey`
					return
				}
				profile = {
					name: newProfileName,
					privkey: k,
					pubkey: utils.bytesToHex(getPublicKey(k)),
					avatar: ''
				}
				break
			default: return
		}
		try {
      await db.profiles.put(profile)
			Data.instance.loadAndWatchProfiles()
    } catch (error) {
      error = `Failed to add ${profile}: ${error}`
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
	{#if $profiles instanceof Array }
	{#each $profiles as profile (profile.pubkey)}
		<Profile {profile} />
	{/each}
	{/if}
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
		<button on:click={addProfile}>Add Account</button>
	</p>
</div>

<style>
</style>
