import { Data } from './data';

const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = async (ev) => {
	switch (ev.data) {
		case 'start':
			await Data.start();
			break;
		default:
	}
};
