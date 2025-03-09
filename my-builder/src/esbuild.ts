import { setErrorLogRoot } from '@idlebox/common';
import { runMain } from '@idlebox/node';
import { fileURLToPath } from 'url';
import { startServe } from './actions/serve.js';
import { execute } from './build/index.js';
import { emitComplete } from './library/wait.js';

const argv = process.argv.slice(2);

setErrorLogRoot(import.meta.filename || fileURLToPath(import.meta.url));
switch (argv[0]) {
	case 'build':
		runMain(() => execute(false));
		break;
	case 'watch':
		execute(true);
		break;
	case 'serve':
		(async () => {
			await execute(false);
			await startServe();
		})().catch((e) => {
			console.error('Failed to start server:', e);
		});
		break;
	case 'notify':
		emitComplete();
		break;
	default:
		console.error('Unknown command:', argv[0]);
		process.exit(1);
}
