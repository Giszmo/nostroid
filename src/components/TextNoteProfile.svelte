<script type="ts">
	import { cProfiles } from '../stores';
	import noPic from '$lib/assets/noProfilePic.png';
	import AvatarImage from './AvatarImage.svelte';

	export let pubkey: string;

	$: p = $cProfiles;
	$: profile = p.get(pubkey);
	$: avatar = profile?.avatar;
	let id = pubkey;
	$: {
		const nip05 = profile?.nip05;
		id = nip05
			? profile?.nip05Valid
				? `${nip05} ✓`
				: `${nip05} <a href="https://${nip05.split('@').slice(-1)[0]}/.well-known/nostr.json">?</a>`
			: pubkey;
	}
</script>

<div class="profile">
	<div class="avatar">
		<AvatarImage profile={profile} />
	</div>
	<div class="info">
		{profile?.name || 'no name set'}<br />
		<div id="id" class="{profile?.nip05 ? 'nip05' : 'pubkey'} {profile?.nip05Valid ? 'valid' : ''}">
			{@html id}
		</div>
	</div>
</div>

<style>
	.profile {
		width: 100%;
		min-height: 3em;
	}

	.info {
		margin-left: 60px;
		font-weight: bold;
	}

	.nip05.valid {
		color: darkgreen;
	}

	.avatar {
		width: 3em;
		height: 3em;
		float: left;
		margin: 10px;
	}
	#id {
		word-break: break-word;
	}
</style>
