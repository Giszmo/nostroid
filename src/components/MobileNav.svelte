<script>
	import { base } from '$app/paths';
	import { page, navigating } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import AccountInfo from './AccountInfo.svelte';

	export let showMobileNav = false;

	$: if ($navigating) showMobileNav = false;

	onMount(() => document.body.classList.add('noscroll'));
	onDestroy(() => document.body.classList.remove('noscroll'));
</script>

<nav class="mobile-nav">
	<button class="icon-btn close-icon" aria-label="Close" on:click={() => (showMobileNav = false)} />
	<div class="account-info">
		<AccountInfo />
	</div>
	<ul>
		<li class:active={$page.url.pathname === `${base}/profiles/`}>
			<a data-sveltekit-prefetch href="{base}/profiles">Profiles</a>
		</li>
		<li class:active={$page.url.pathname === `${base}/notifications/`}>
			<a data-sveltekit-prefetch href="{base}/notifications">Notifications</a>
		</li>
		<li class:active={$page.url.pathname === `${base}/`}>
			<a data-sveltekit-prefetch href="{base}/">Feed</a>
		</li>
		<li class:active={$page.url.pathname === `${base}/messages/`}>
			<a data-sveltekit-prefetch href="{base}/messages">Messages</a>
		</li>
		<li class:active={$page.url.pathname === `${base}/settings/`}>
			<a data-sveltekit-prefetch href="{base}/settings">Settings</a>
		</li>
	</ul>
</nav>

<style>
	.mobile-nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #fff;
		z-index: 100;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 30px;
		text-align: center;
	}
	li {
		padding: 1rem;
	}
	.active {
		text-decoration: underline;
	}
	.close-icon {
		position: absolute;
		top: 0.3rem;
		right: 0.3rem;
		background-image: url('/icons/close.svg');
		width: 40px;
		height: 40px;
	}
	.account-info {
		margin-bottom: 2rem;
	}

	@media (min-width: 780px) {
		.mobile-nav {
			display: none;
		}
	}
</style>
