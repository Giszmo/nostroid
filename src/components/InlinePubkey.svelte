<script type="ts">
	import { cProfiles } from '../stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import AvatarImage from './AvatarImage.svelte';

	export let content: { pubkey: string };

	let profile = $cProfiles.get(content.pubkey);

	const showProfile = () => {
		goto(`${base}/${content.pubkey}`);
	};
</script>

<span on:click|stopPropagation={showProfile}>
	<span class="avatar">
		<AvatarImage {profile} />
	</span>
	<span class="info">
		{profile?.name || content.pubkey}
	</span>
</span>

<style>
	.avatar {
		width: 1em;
		height: 1em;
		vertical-align: sub;
		display: inline-block;
	}

	.info {
		font-weight: bold;
	}
</style>
