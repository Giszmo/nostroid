import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true
    }),
		NodeModulesPolyfillPlugin()
	],
	ssr: {
    noExternal: [
			'nostr-tools'
		]
  },
	resolve: {
    alias: {
      process: "process/browser",
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
    }
  },
	optimizeDeps: {
		esbuildOptions: {
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true,
				}),
				NodeModulesPolyfillPlugin()
			]
		}
  },
	build: {
		sourcemap: 'inline' // helpful for debugging, maybe remove in production
	},
  global: {}
};

export default config;
