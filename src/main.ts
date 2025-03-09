/// <reference path="./globals.d.ts" />
import { FSWatcher } from 'chokidar';
import express from 'express';
import { argv } from 'process';
import { APP_ROOT, buildIndex, INPUT_DIR, OUTPUT_FILE } from './build.js';

switch (argv[2]) {
	case 'build':
		await buildIndex();
		console.log('created %s', OUTPUT_FILE);
		break;
	case 'serve':
		console.log('watching %s', INPUT_DIR);
		const watcher = new FSWatcher({ ignoreInitial: true });
		watcher.add(INPUT_DIR);
		watcher.on('all', async (e, file) => {
			console.log('[%s] %s :: rebuilding...', e, file);
			await buildIndex();
		});

		await buildIndex();

		const app = express();
		app.use(express.static(APP_ROOT));
		app.listen(8080, () => {
			console.log('listening on http://127.0.0.1:8080');
		});

		break;
	default:
		console.error('Invalid command, allow: build, serve');
}
