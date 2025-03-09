import { Plugin } from 'esbuild';
import { dirname, resolve } from 'path';
import { isVerbose } from '../library/constants.js';

const mapper: [string, string][] = [];

export function resolveStyle(importer: string, path: string): string | undefined {
	if (isVerbose) console.log('try resolve: %s\n    from: %s', path, importer);
	for (const [lib, src] of mapper) {
		if (importer.startsWith(lib)) {
			const dir = dirname(importer.replace(lib, src));
			path = resolve(dir, path);
			if (isVerbose) console.log('    result: %s', path);
			return path;
		}
	}
	if (isVerbose) console.log('    not found');
	return undefined;
}

export function resolveStylesPlugin(): Plugin {
	const NAME = 'ts-src-resolver';
	return {
		name: NAME,
		setup(build) {
			build.onResolve({ filter: /\.(sc|sa|c)ss/, namespace: 'file' }, (args) => {
				const path = resolveStyle(args.importer, args.path);
				if (path) {
					return { namespace: 'file', pluginName: NAME, path: path };
				}
				return undefined;
			});
		},
	};
}

export function cssPluginMapper(path: string) {
	console.log('scss loader: ', arguments);
	return path;
}
