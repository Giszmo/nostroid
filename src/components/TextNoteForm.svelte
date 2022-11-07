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
	let showSuccess = false;

	const post = async () => {
		if (posting) return;
		posting = true;
		showSuccess = false;
		let text = editableEl.innerText;
		let tags: string[] = [];

		if (!text) return (posting = false);

		mentions.forEach((mention, i) => {
			text = text.replace(`@${mention.name}`, `#[${i}]`);
			tags.push(`p»${mention.pubkey}»wss://relay.nostr.info`);
		});
		try {
			await sendPersistEvent(1, tags, text, $activeProfile.privkey);
			editableEl.innerHTML = '';
			formatEl.innerHTML = '';
			showSuccess = true;
			setTimeout(() => (showSuccess = false), 5000);
		} catch (err) {
			console.error(err);
		}
		posting = false;
	};

	const onEdit = () => {
		let text = editableEl.innerHTML;
		mentions.forEach((profile) => {
			const name = `@${profile.name}`;
			if (!text.includes(name)) {
				mentions = mentions.filter((p) => p.pubkey !== profile.pubkey);
				return;
			}
			text = text.replace(new RegExp(name, 'g'), `<span class="highlight">${name}</span>`);
		});
		formatEl.innerHTML = text;
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
		const match = left?.match(/@([a-zA-Z0-9_.]*)$/)?.[1];
		// match right until space
		const match2 = right?.match(/^([a-zA-Z0-9_.]+)/)?.[0];
		const joined = match && match2 ? match + match2 : match;
		if (left?.match(/(@\S*)$/g)) showMentionList = true;
		if (joined) {
			currentWord = joined;
			const searches = await Promise.all([
				db.profiles.where('nip05').startsWithIgnoreCase(joined).toArray(),
				db.profiles.where('name').startsWithIgnoreCase(joined).toArray()
			]);
			mentionMatches = searches.flat().filter((profile, i, arr) => {
				return arr.findIndex((p) => p.pubkey === profile.pubkey) === i;
			});
		} else {
			currentWord = '';
			mentionMatches = await db.profiles.where('degree').equals(1).limit(20).toArray();
		}
	};

	const replaceMention = (profile: IProfile) => {
		const selection = window.getSelection();
		const node = selection?.anchorNode;
		const text = node?.nodeValue;
		if (!text) return;
		const left = text.slice(0, wordPosition);
		const right = text.slice(wordPosition);

		mentions.push(profile);
		const newWord = `@${profile.name} `;
		node.nodeValue = left + right.replace(`@${currentWord}`, newWord);

		onEdit();
		showMentionList = false;

		const range = document.createRange();
		range.setStart(node, wordPosition + newWord.length);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
	};
	const handleWindowClick = (e: MouseEvent) => {
		if (e.target !== editableEl) showMentionList = false;
	};
</script>

<svelte:window on:click={handleWindowClick} />

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
						{#if mentionMatches.length}
							{#each mentionMatches as profile}
								<li
									on:click={() => replaceMention(profile)}
									on:mousedown|preventDefault={(e) => e.stopImmediatePropagation()}
								>
									<strong>{profile.name}</strong>
									{profile.pubkey.slice(0, 8)}...
								</li>
							{/each}
						{:else}
							<li>No matches</li>
						{/if}
					</ul>
				</div>
			{/if}
		</div>
	</div>
	{#if showSuccess}
		<span class="success"> posted! </span>
	{/if}
	<button
		class="submit-btn"
		disabled={!$activeProfile?.privkey || posting}
		title={!$activeProfile?.privkey ? 'no privkey on this profile' : ''}>Post</button
	>
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
		white-space: pre-wrap;
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
		-webkit-user-select: none;
	}
	.mention-container > ul > li:hover {
		background-color: #eee;
	}
	.success {
		align-self: flex-end;
		color: green;
	}
</style>
