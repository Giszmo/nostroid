import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { nostroidPWA } from './nostroid-config.js';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA(nostroidPWA),
		NodeGlobalsPolyfillPlugin({
			process: true,
			buffer: true
		}),
		NodeModulesPolyfillPlugin()
	],
	ssr: {
		noExternal: ['nostr-tools']
	},
	resolve: {
		alias: {
			process: 'process/browser',
			stream: 'rollup-plugin-node-polyfills/polyfills/stream',
			util: 'rollup-plugin-node-polyfills/polyfills/util'
		}
	},
	optimizeDeps: {
		include: ['nostr-tools > create-hash', 'nostr-tools > create-hmac'],
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	},
	build: {
		sourcemap: 'inline', // helpful for debugging, maybe remove in production
		rollupOptions: {
			plugins: [rollupNodePolyFill()]
		}
	},
	define: {}
});
