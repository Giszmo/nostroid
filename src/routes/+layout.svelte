<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Debug from '../components/Debug.svelte'
	import '../app.css';
	import { onMount } from 'svelte'
	import { pwaInfo } from 'virtual:pwa-info'
	import { db } from '../db'

	let err = false;

	let ReloadPrompt
	onMount(async () => {
		// check availability of service worker and indexedDB before registering sw
		db.open()
		.catch ((e) => {
			err = true
		});
		if ('serviceWorker' in navigator) {
			pwaInfo && (ReloadPrompt = (await import('../components/ReloadPrompt.svelte')).default)
		} else {
			err = true
		}
	})

	$: webManifest = pwaInfo && !err ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	{@html webManifest }
</svelte:head>


{#if err}
	<main>
		<h1>Browser not supported</h1>
		<p>This app requires access to service workers and indexedDB to work correctly</p>
		<p>Please make sure that cookies/storage is allowed in your browser settings and that you are not running in incognito mode</p>
		<p>If you require further help please see our <a href="https://github.com/Giszmo/nostroid/issues" target="_blank">issues page on GitHub</a></p>
	</main>
{:else}
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
{/if}

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
