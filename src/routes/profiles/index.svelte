<script lang="ts">
	import type { Profile } from '../../types'
	import { Data } from '../../data'
	import { generatePrivateKey, getPublicKey } from 'nostr-tools'
	
  const data = Data.instance
	data.connectDB(indexedDB)

	let profiles: Profile[] = []
	$: newProfileName = "nostroid-user"
	$: newProfilePrivkey = ""
	$: newProfilePubkey = ""
	let error = ""
	setInterval(() => {profiles = Data.instance.profiles}, 500)
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
				Data.instance.profiles.push({
					name: newProfileName,
					privkey: privkey,
					pubkey: pubkey
				})
				break
			case "pub":
				if (newProfilePubkey.length != 64) {
					error = `"${newProfilePubkey}" doesn't look like a pubkey`
					return
				}
				Data.instance.profiles.push({
					name: newProfileName,
					privkey: undefined,
					pubkey: newProfilePubkey
				})
				break
			case "priv":
				if (newProfilePrivkey.length != 64) {
					error = `"${newProfilePrivkey}" doesn't look like a privkey`
					return
				}
				Data.instance.profiles.push({
					name: newProfileName,
					privkey: newProfilePrivkey,
					pubkey: getPublicKey(newProfilePrivkey)
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
			{profile.privkey ? '🔑' : ' '}{profile.name} ({profile.pubkey})
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
			<input bind:value={newProfilePrivkey} >
		{/if}
		<br>
		<label><input
			type="radio"
			bind:group={radioWhat}
			value="pub" />using imported public key</label>
		{#if radioWhat == "pub"}
			<input bind:value={newProfilePubkey} >
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
