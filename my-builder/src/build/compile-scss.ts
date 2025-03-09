import { Emitter } from '@idlebox/common';
import { FSWatcher } from 'chokidar';
import { writeFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { compileAsync } from 'sass';
import { htmlLocals } from './compile-html.js';
import { hash } from './esbuild/library.js';
import { isTTY, modulesRoot, outputDir, sourceRoot } from './library/constants.js';

async function compile(f: string) {
	try {
		const res = await compileAsync(f, {
			alertColor: isTTY,
			charset: false,
			loadPaths: [modulesRoot], // TODO: use importer and add watcher
			sourceMap: true,
			style: 'expanded',
			sourceMapIncludeSources: true,
		});

		const name = basename(f).replace(/\.scss$/, '-' + hash(res.css) + '.css');
		const file = resolve(outputDir, name);
		await writeFile(file, res.css, 'utf-8');
		await writeFile(file + '.map', JSON.stringify(res.sourceMap), 'utf-8');

		return name;
	} catch (e: any) {
		throw new Error(`${e.message}\n  file: ${f}`);
	}
}

const builtOnce: Record<string, boolean> = {
	preload: false,
	index: false,
};

function build(file: string) {
	const id = basename(file, '.scss');
	return compile(file).then(
		(f) => {
			builtOnce[id] = true;
			if (id === 'preload') {
				htmlLocals.__CSS_EARLY__ = f;
			} else if (id === 'index') {
				htmlLocals.__CSS_INDEX__ = f;
			} else {
				throw new Error('???');
			}
			console.log(' == Scss:%s 编译成功', id);
			mayFire();
		},
		(e) => {
			console.error(' == Scss:%s 编译失败:', id, e.message);
			event.fireNoError(e);
		},
	);
}

const event = new Emitter<null | Error>();

function mayFire() {
	if (builtOnce.preload && builtOnce.index) {
		event.fire(null);
	}
}

export function compileScss(watchMode: boolean) {
	const preloadScss = resolve(sourceRoot, 'preload.scss');
	const indexScss = resolve(sourceRoot, 'index.scss');

	if (watchMode) {
		const watchers = new FSWatcher({ ignoreInitial: true });

		watchers.on('change', (f) => {
			console.log('[scss] change detect: %s', f);

			build(f);
		});

		watchers.add(preloadScss);
		watchers.add(indexScss);

		setTimeout(() => {
			watchers.emit('change', preloadScss);
			watchers.emit('change', indexScss);
		}, 500);
	} else {
		build(preloadScss);
		build(indexScss);
	}

	return event.register;
}
