/** @type {import('@vite-pwa/sveltekit').SvelteKitPWAOptions} */
const nostroidPWA = {
	base: '/',
	scope: '/',
	srcDir: 'src',
	mode: 'development',
	filename: 'custom-sw.ts',
	strategies: 'injectManifest',
	registerType: 'prompt',
	manifest: {
		id: '/',
		short_name: 'Nostroid',
		name: 'Nostroid',
		start_url: '/',
		display: 'standalone',
		theme_color: '#ffffff',
		background_color: '#ffffff',
		icons: [
			{
				src: 'nostroid-192x192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: 'nostroid-512x512.png',
				sizes: '512x512',
				type: 'image/png'
			},
			{
				src: 'nostroid-512x512.png',
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
		navigateFallback: '/'
	},
	kit: {
		trailingSlash: 'always',
		adapterFallback: 'index.html'
	}
};

export { nostroidPWA };
