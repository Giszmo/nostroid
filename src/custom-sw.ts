import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { relayPool } from 'nostr-tools';
import { base } from '$app/paths';

/* eslint-env serviceworker */
declare let self: ServiceWorkerGlobalScope;

console.log('hi');
console.log(typeof relayPool);

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [new RegExp(`${base}/`)];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL(`${base}/`), { allowlist }));
