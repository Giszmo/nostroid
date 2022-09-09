import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
  // compilerOptions: { customElement: true },

	kit: {
		adapter: adapter({ out: 'build' }),

    paths: { base: '/chat'},
    trailingSlash: 'always'
	}
};

export default config;
