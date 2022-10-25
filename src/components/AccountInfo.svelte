<script type="ts">
	import { activeProfile } from '../stores';
	import noPic from '$lib/assets/noProfilePic.png';
	import AvatarImage from './AvatarImage.svelte';
</script>

<div class="accountInfo">
	<div class="avatar">
		<AvatarImage profile={$activeProfile} />
	</div>
	<div class="right-container">
		<div class="name">{$activeProfile?.name || '???'}<br /></div>
		<div class="pubkey">{$activeProfile?.pubkey}</div>
		{@html $activeProfile?.privkey ? '🔑' : ''}
	</div>
</div>

<style>
	.accountInfo {
		display: flex;
		font-weight: bold;
	}
	.avatar {
		width: 3em;
		height: 3em;
		margin-right: 0.5em;
	}
	.pubkey {
		width: 8em;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.name {
		width: 8em;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.right-container > * {
		vertical-align: middle;
	}
</style>
