import { browser } from '$app/environment';
import Worker from './data.worker?worker';

export const DataWorker = browser ? new Worker() : null

