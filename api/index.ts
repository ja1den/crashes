// Import
import path from 'path';

import minimist from 'minimist';
import express from 'express';

import 'colors';

// Lib
import getFiles from './lib/getFiles';

// Main
async function main() {
	// Log
	const time = Date.now();

	// Read Port
	const args = minimist(process.argv.slice(2), { alias: { p: 'port' } });

	const port = typeof args.port === 'number'
		? args.port
		: 3000;

	// Express
	const app = express().use(express.json({ limit: '128mb' }));

	// React
	app.use(express.static(path.resolve(__dirname, 'public')));

	// Load Routes
	const paths = getFiles(path.resolve(__dirname, 'routes'));

	for (const path of paths) {
		// Route Name
		let name = path.match(/routes(?<name>\/.+)\..+/)?.groups?.name!;

		// Index Route
		if (name.endsWith('index')) {
			name = name.match(/(.+)\/index/)?.[1] ?? '';
		}

		// Route Parameters
		const params = name.match(/\[.+?\]/g);

		if (params !== null) {
			for (const param of params) {
				name = name.replace(param, ':' + param.match(/[^\[\]]+/));
			}
		}

		// Import Method
		const { default: method } = await import(path);

		if (typeof method !== 'function') continue;

		// Bind Route
		app.all('/api' + name, method);
	}

	// Listen
	app.listen(port, () => {
		console.log('Server running at', ('http://localhost:' + port).cyan);
		console.log(('\u2728  Up in ' + (Date.now() - time) + 'ms.').green);
	});

	// Handle Exit
	for (const signal of ['SIGINT', 'SIGTERM', 'SIGUSR2'] as NodeJS.Signals[]) {
		process.addListener(signal, () => {
			console.log('');
			process.exit(0);
		});
	}
}
main();
