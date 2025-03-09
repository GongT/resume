import { normalizePath } from '@idlebox/node';
import { resolve } from 'path';

export const projectRoot = normalizePath(process.cwd());

export const componentsRoot = normalizePath(resolve(projectRoot, 'components'));
export const tempDir = resolve(projectRoot, 'temp');
export const cacheDir = resolve(tempDir, 'vite-cache');
export const assetsDir = resolve(projectRoot, 'assets');
export const sourceRoot = normalizePath(resolve(projectRoot, 'src'));
export const modulesRoot = normalizePath(resolve(projectRoot, 'node_modules'));
export const outputDir = resolve(projectRoot, 'lib');

export const isProd = process.argv.includes('production');
export const isTTY = process.stderr.isTTY;

export const hash_salt =
	(process.env.HOSTNAME ?? process.env.COMPUTER_NAME ?? 'unknown') +
	(process.env.USER ?? process.env.USERNAME ?? 'unknown') +
	(process.env.ETAG_SALT || '');

export const isVerbose = process.argv.includes('--verbose');
