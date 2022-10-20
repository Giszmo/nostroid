<script type="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { db } from '../db';
	import type { IProfile } from '../db';
	import { activeProfile } from '../stores';
	import noPic from '$lib/assets/noProfilePic.png';
	export let profile: IProfile;

	$: active = $activeProfile as IProfile;
	$: avatar = profile.avatar || noPic;
	const select = async () => {
		db.config.put({
			key: 'activePubkey',
			value: profile.pubkey
		});
	};
	const showPubkey = () => {
		goto(`${base}/${profile?.pubkey}`);
	};

	const deleteProfile = async () => {
		await db.profiles.delete(profile.pubkey);
		if (profile.pubkey == active?.pubkey) {
			db.config.delete('activePubkey');
		}
	};
</script>

<div on:click={select} class="profile {active?.pubkey == profile?.pubkey ? 'selectedProfile' : ''}">
	<img src={avatar} alt="user's avatar" /><br />
	<div class="name">
		<div class="keys" class:has-keys={profile?.privkey}>🔑</div>
		{profile?.name || '???'}
	</div>
	<div class="controlls {active?.pubkey == profile?.pubkey ? 'selectedProfile' : ''}">
		<button on:click={showPubkey}>Show</button>
		<button on:click={deleteProfile}>Delete</button>
	</div>
</div>

<style>
	.profile {
		background-color: lightgray;
		border: 2px solid darkgray;
		text-align: left;
		/* display: inline-grid; */
		height: 5em;
		max-width: 20em;
		margin: 0.5em;
		padding: 0.5em;
		border-radius: 15px;
		filter: grayscale(0.7) contrast(1.2);
	}
	.profile:hover {
		filter: none;
	}
	img {
		width: 3.5em;
		height: 3.5em;
		border-radius: 50%;
		object-fit: cover;
		margin: 1em;
		float: left;
	}
	.keys {
		display: none;
		filter: drop-shadow(0 0 3px green);
	}
	.keys.has-keys {
		display: unset;
	}
	.name {
		font-weight: bold;
		font-size: 1.5em;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}
	.selectedProfile {
		background-color: lightgreen;
		filter: none;
	}
	.controlls {
		display: none;
	}
	.controlls.selectedProfile {
		display: block;
	}
</style>
