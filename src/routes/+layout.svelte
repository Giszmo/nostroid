<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Debug from '../components/Debug.svelte'
	import '../app.css';
	import { onMount } from 'svelte'
	import { pwaInfo } from 'virtual:pwa-info'

	let ReloadPrompt
	let worker: Worker;
	onMount(async () => {
		pwaInfo && (ReloadPrompt = (await import('../components/ReloadPrompt.svelte')).default);
		worker = (await import('../data.service')).DataWorker!;

		worker.postMessage('start');

	})

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''

</script>

<svelte:head>
	{@html webManifest }
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
