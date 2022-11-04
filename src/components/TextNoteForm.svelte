<script lang="ts">
	import { activeProfile } from '../stores';
	import { sendPersistEvent } from '../nostrHelper';
	import AvatarImage from './AvatarImage.svelte';
	import type { IProfile } from '../db';
	import { db } from '../db';

	let posting = false;
	let editableEl: HTMLDivElement;
	let formatEl: HTMLDivElement;
	let mentionMatches: IProfile[] = [];
	let showMentionList = false;
	let currentWord = '';
	let wordPosition = 0;
	let mentions: IProfile[] = [];

	const post = async () => {
		if (posting) return;
		posting = true;
		let text = editableEl.innerText;
		let tags = [];

		for (let i = 0; i < mentions.length; i++) {
			const mention = mentions[i];
			const regex = new RegExp(`@${mention.name}`, 'g');
			text = text.replace(regex, `#[${i}]`);
			tags.push(`p»${mention.pubkey}»wss://relay.nostr.info`);
		}
		try {
			await sendPersistEvent(1, tags, text, $activeProfile.privkey);
		} catch (err) {
			console.error(err);
		}
		posting = false;
	};

	const onEdit = () => {
		const formatted = editableEl.innerHTML.replace(
			/(@[a-zA-Z0-9_.]+)/g,
			'<span class="highlight">$1</span>'
		);
		formatEl.innerHTML = formatted;
	};

	const onSelChange = async () => {
		showMentionList = false;
		const selection = window.getSelection();
		const text = selection?.anchorNode?.textContent;
		const offset = selection?.anchorOffset;
		const left = text?.slice(0, offset);
		const right = text?.slice(offset);
		// find out index where the word starts
		wordPosition = left?.lastIndexOf('@') || 0;
		// match left until @
		const match = left?.match(/@([a-zA-Z0-9_.]+)$/)?.[1];
		// match right until space
		const match2 = right?.match(/^([a-zA-Z0-9_.]+)/)?.[0];
		const joined = match && match2 ? match + match2 : match;

		if (!joined) return;
		showMentionList = true;
		currentWord = joined;

		const searches = await Promise.all([
			db.profiles.where('nip05').startsWithIgnoreCase(joined).toArray(),
			db.profiles.where('name').startsWithIgnoreCase(joined).toArray()
		]);
		mentionMatches = [...new Set([...searches[0], ...searches[1]])];
	};

	const replaceMention = (profile: IProfile) => {
		const selection = window.getSelection();
		const text = selection?.anchorNode?.nodeValue;
		if (!text) return;
		const left = text.slice(0, wordPosition);
		const right = text.slice(wordPosition);

		mentions.push(profile);
		selection.anchorNode.nodeValue = left + right.replace(`@${currentWord}`, `@${profile.name}`);

		onEdit();
		showMentionList = false;
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
				on:input={onEdit}
				bind:this={editableEl}
				on:keyup={(e) => onSelChange(e)}
				on:click={(e) => onSelChange(e)}
			/>
			{#if showMentionList}
				<div class="mention-container">
					<ul>
						{#each mentionMatches as profile}
							<li on:click={() => replaceMention(profile)}>
								<strong>{profile.name}</strong>
								{profile.pubkey.slice(0, 8)}...
							</li>
						{/each}
					</ul>
				</div>
			{/if}
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
	.mention-container {
		background-color: white;
		max-height: 115px;
		overflow: scroll;
		border: 1px solid #ccc;
		border-radius: 4px;
		position: absolute;
		width: 100%;
	}
	.mention-container > ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.mention-container > ul > li {
		padding: 5px;
		cursor: pointer;
		user-select: none;
	}
	.mention-container > ul > li:hover {
		background-color: #eee;
	}
</style>
