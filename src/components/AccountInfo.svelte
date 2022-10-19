<script type="ts">
	import { activeProfile } from '../stores';
	import noPic from '$lib/assets/noProfilePic.png';
</script>

<div class="accountInfo">
	<img src={$activeProfile?.avatar || noPic} alt="user's avatar" />
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
	img {
		width: 3em;
		height: 3em;
		object-fit: cover;
		border-radius: 50%;
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
