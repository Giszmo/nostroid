<script lang="ts">
	import { activeProfile } from '../stores';
	import { sendPersistEvent } from '../nostrHelper';
	import AvatarImage from './AvatarImage.svelte';

	let noteText = '';
	let posting = false;
	let editableEl: HTMLDivElement;
	let formatEl: HTMLDivElement;

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

	const onEdit = (
		e: Event & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) => {
		const formatted = e.currentTarget.innerHTML.replace(
			/(@[a-zA-Z0-9_]+)/g,
			'<span class="highlight">$1</span>'
		);
		console.log(formatted);
		formatEl.innerHTML = formatted;
	};
</script>

<form on:submit|preventDefault={post}>
	<div class="top">
		<div class="avatar">
			<AvatarImage profile={$activeProfile} />
		</div>
		<div class="input-container">
			<div class="input format-input" contenteditable="true" bind:this={formatEl} />
			<div
				class="input editable-input"
				contenteditable="true"
				on:input={(e) => onEdit(e)}
				bind:this={editableEl}
				bind:textContent={noteText}
			/>
		</div>
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
		flex-shrink: 0;
	}
	.top {
		display: flex;
		flex-grow: 1;
	}
	.submit-btn {
		align-self: flex-end;
		margin-top: 10px;
	}
	.input-container {
		flex-grow: 1;
		position: relative;
	}
	.input {
		font-size: 17px;
		min-height: 70px;
		word-break: break-word;
	}
	.format-input {
		position: absolute;
		border: 1px solid rgba(251, 251, 251, 0);
		border-radius: 4px;
		padding: 6px 12px;
		pointer-events: none;
		color: #fff0;
	}
	.editable-input {
		border: 1px solid #ccc;
		background-color: white;
		border-radius: 4px;
		padding: 6px 12px;
	}
	:global(.highlight) {
		color: blue;
	}
</style>
