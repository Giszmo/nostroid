// const id = '/chat';
const id = '';
const scope = `${id}/`;
/** @type {import('@vite-pwa/sveltekit').SvelteKitPWAOptions} */
const nostroidPWA = {
	srcDir: 'src',
	mode: 'development',
	filename: 'custom-sw.ts',
	strategies: 'injectManifest',
	registerType: 'prompt',
	manifest: {
		short_name: 'Nostroid',
		name: 'Nostroid',
		start_url: scope,
		scope,
		display: 'standalone',
		theme_color: '#ffffff',
		background_color: '#ffffff',
		icons: [
			{
				src: 'pwa-192x192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: 'pwa-512x512.png',
				sizes: '512x512',
				type: 'image/png'
			},
			{
				src: 'pwa-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any maskable'
			}
		]
	},
	injectManifest: {
		globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
		rollupFormat: 'iife'
	},
	devOptions: {
		enabled: true,
		type: 'module',
		navigateFallback: scope
	},
	kit: {
		// base: id,
		outDir: 'build',
		trailingSlash: 'always'
	}
};

export { nostroidPWA };
