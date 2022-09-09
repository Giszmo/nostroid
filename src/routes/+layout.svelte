<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Debug from '../components/Debug.svelte'
	import '../app.css';
	import { onMount } from 'svelte'
	import { browser, dev } from '$app/environment'
	import { base } from '$app/paths'

	const loadRPC = browser
	// const loadRPC = !dev && browser

	let ReloadPrompt
	onMount(async () => {
		loadRPC && (ReloadPrompt = (await import('../components/ReloadPrompt.svelte')).default)
	})

</script>

<svelte:head>
    {#if browser}
	<!--{#if !dev}-->
		<link rel="manifest" href="/manifest.webmanifest">
	{/if}
</svelte:head>

<Header />

<main>
	<slot />
	{#if ReloadPrompt}
		<svelte:component this={ReloadPrompt} />
	{/if}
</main>

<footer>
	<p><Debug /> GitHub: <a href="https://github.com/Giszmo/nostroid">nostroid</a></p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
