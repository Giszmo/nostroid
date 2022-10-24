<script lang="ts">
	import { activeProfile } from '../stores';
	import { sendPersistEvent } from '../nostrHelper';
	import AvatarImage from './AvatarImage.svelte';

	let noteText = '';
	let posting = false;

	const post = async () => {
		if (posting) return;
		posting = true;
		try {
			await sendPersistEvent(1, [], noteText, $activeProfile.privkey);
			noteText = '';
		} catch (err) {
			console.error(err);
		}
		posting = false;
	};
</script>

<form on:submit|preventDefault={post}>
	<div class="top">
		<div class="avatar">
			<AvatarImage profile={$activeProfile} />
		</div>
		<input class="post-text" type="text" bind:value={noteText} />
	</div>
	<button class="submit-btn">Post</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
	}
	.avatar {
		width: 3em;
		height: 3em;
		float: left;
		margin: 10px;
	}
	.top {
		display: flex;
		flex-grow: 1;
	}
	.submit-btn {
		align-self: flex-end;
		margin-top: 10px;
	}
	.post-text {
		flex-grow: 1;
	}
</style>
