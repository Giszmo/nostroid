import { readFileSync, writeFileSync } from 'node:fs';

/*
once fixed, we can remove this patch:
https://github.com/nodejs/readable-stream/issues/487
*/
const patchReadableStream = () => {
	let content: string = readFileSync('./node_modules/readable-stream/lib/_stream_readable.js', {
		encoding: 'utf-8'
	});
	if (content.includes('global.Uint8Array')) {
		writeFileSync(
			'./node_modules/readable-stream/lib/_stream_readable.js',
			content.replace(
				'var OurUint8Array = global.Uint8Array || function () {};',
				'var OurUint8Array = self.Uint8Array || function () {};'
			),
			{ encoding: 'utf-8' }
		);
	}
	content = readFileSync('./node_modules/readable-stream/lib/_stream_writable.js', {
		encoding: 'utf-8'
	});
	if (content.includes('global.Uint8Array')) {
		writeFileSync(
			'./node_modules/readable-stream/lib/_stream_writable.js',
			content.replace(
				'var OurUint8Array = global.Uint8Array || function () {};',
				'var OurUint8Array = self.Uint8Array || function () {};'
			),
			{ encoding: 'utf-8' }
		);
	}
};

patchReadableStream();
