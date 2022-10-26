<script type="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { db } from '../db';
	import type { IProfile } from '../db';
	import { activeProfile } from '../stores';
	import AvatarImage from './AvatarImage.svelte';
	import { createEventDispatcher } from 'svelte';

	export let profile: IProfile;
	export let dragDisabled: boolean;

	const dispatch = createEventDispatcher();

	$: active = $activeProfile as IProfile;
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
	<div class="avatar">
		<AvatarImage {profile} />
	</div>
	<div class="middle">
		<div class="name">
			<div class="keys" class:has-keys={profile?.privkey}>🔑</div>
			{profile?.name || '???'}
		</div>
		<div class="controlls {active?.pubkey == profile?.pubkey ? 'selectedProfile' : ''}">
			<button on:click={showPubkey}>Show</button>
			<button on:click={deleteProfile}>Delete</button>
		</div>
	</div>
	<div
		tabindex={dragDisabled ? 0 : -1}
		aria-label="drag-handle"
		class="handle"
		style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
		on:mousedown={(e) => dispatch('dragstart', e)}
		on:touchstart={(e) => dispatch('dragstart', e)}
		on:keydown={(e) => dispatch('keydown', e)}
	/>
</div>

<style>
	.profile {
		background-color: lightgray;
		border: 2px solid darkgray;
		text-align: left;
		display: flex;
		align-items: center;
		height: 5em;
		max-width: 21em;
		margin: 0.5em;
		padding: 0.5em;
		border-radius: 15px;
		filter: grayscale(0.7) contrast(1.2);
	}
	.profile:hover {
		filter: none;
	}
	.avatar {
		float: left;
		width: 3.5em;
		height: 3.5em;
		margin: 1em;
		flex-shrink: 0;
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
		white-space: nowrap;
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
	.handle {
		margin-left: auto;
		background-image: url('/icons/drag-handle.svg');
		width: 30px;
		height: 37px;
		background-size: cover;
		background-position: center;
		flex-shrink: 0;
		touch-action: none;
	}
	.middle {
		min-width: 0;
	}
	@media (max-width: 550px) {
		.avatar {
			width: 3.3em;
			height: 3.3em;
		}
		.name {
			font-size: 1.3em;
		}
	}
</style>
