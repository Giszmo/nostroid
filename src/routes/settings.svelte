<script lang="ts">
	import { activeProfile } from '../stores'
	import { db } from "../db"
	import type { IProfile } from "../db"
  import { liveQuery } from "dexie"
	// import type { Observable } from "dexie"

	$: active = $activeProfile as IProfile
	liveQuery(async () => {
		if (active) {
			console.log(active)
			name = active.name
			avatar = active.avatar || ''
			pk = active.pubkey
		}
	})
	
	let name = ''
	let avatar = ''
	let pk = ''
	
	$: {
		name
		if (pk) {
			db.profiles.put({
				name: name,
				pubkey: pk,
				avatar: avatar
			})
		}
	}

</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Account Settings" />
</svelte:head>

<div class="todos">
	<h1>Settings</h1>
	<input bind:value={name} >
	
</div>

<style>
</style>
