import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { nostroidPWA } from './nostrid-config.js';

const { trailingSlash, adapterFallback: fallback } = nostroidPWA.kit;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	// compilerOptions: { customElement: true },

	kit: {
		adapter: adapter({ fallback }),
		trailingSlash: trailingSlash
	}
};

export default config;
