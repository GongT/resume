import { resolve } from 'path';
import { sourceRoot } from '../library/constants.js';

export function createEntrypoints() {
	const entries: Record<string, string> = {
		main: resolve(sourceRoot, 'entry.ts'),
		// bootstrap: resolve(sourceRoot, 'bootstrap.ts'),
	};

	return entries;
}
