<script lang="ts">
	import TextNoteProfileLoading from './TextNoteProfileLoading.svelte';

	export let level = 0;
	export let selected = false;
</script>

<div style={`margin-left: ${level * 2}rem`}>
	<div class="tn">
		<TextNoteProfileLoading />
		<div class="note" class:note-selected={selected}>Loading...</div>
		<span class="time">&nbsp;</span>
	</div>
</div>

<style>
	.note {
		margin-left: 60px;
		overflow-x: auto;
	}
	.tn {
		border: 2px solid gray;
		border-radius: 15px;
		padding: 15px;
	}
	.note-selected {
		font-size: 1.5rem;
	}
</style>
