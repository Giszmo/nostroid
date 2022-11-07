<script lang="ts">
	import TextNoteForm from '../components/TextNoteForm.svelte';
</script>

<svelte:head>
	<title>Feed</title>
	<meta name="description" content="To be implemented ..." />
</svelte:head>

<h1>Feed</h1>

<div class="create-note-container">
	<TextNoteForm />
</div>

<style>
	.create-note-container {
		max-width: 600px;
		width: 100%;
		align-self: center;
	}
</style>
