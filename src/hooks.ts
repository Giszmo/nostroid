import type { Handle } from '@sveltejs/kit';
import * as cookie from 'cookie';

export async function handle({ event, resolve }) {
    return resolve(event, { ssr: false })
}
