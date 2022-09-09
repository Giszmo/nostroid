import type { Handle } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event, {
		/*ssr: false*/
	});
};
