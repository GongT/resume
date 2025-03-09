import { Emitter } from '@idlebox/common';
import tailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { FSWatcher } from 'chokidar';
import { readFile, writeFile } from 'fs/promises';
import { basename, resolve } from 'path';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';
import { htmlLocals } from './compile-html.js';
import { hash } from './esbuild/library.js';
import { sourceRoot } from './library/constants.js';

const builtOnce: Record<string, boolean> = {
	preload: false,
	index: false,
};

function build(file: string) {
	const id = basename(file, '.css');
	return compileFile(file).then(
		(f) => {
			builtOnce[id] = true;
			if (id === 'preload') {
				htmlLocals.__CSS_EARLY__ = f;
			} else if (id === 'index') {
				htmlLocals.__CSS_INDEX__ = f;
			} else {
				throw new Error('???');
			}
			console.log(' == postcss:%s 编译成功', id);
			mayFire();
		},
		(e) => {
			console.error(' == postcss:%s 编译失败:', id, e.message);
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

function mapToDist(file: string, hash: string) {
	return basename(file).replace(/\.css$/, '-' + hash + '.css');
}

async function compileFile(file: string) {
	const css = await readFile(file, 'utf-8');
	const distName = mapToDist(file, hash(css));
	const distRel = `lib/${distName}`;

	const ctx = postcss([autoprefixer, postcssNested, tailwind]);
	const result = await ctx.process(css, { from: file, to: distRel, map: true });
	await writeFile(distRel, result.css);
	if (result.map) {
		await writeFile(distRel + '.map', result.map.toString());
	}
	return distName;
}

export function compilePostcss(watchMode: boolean) {
	const preload = resolve(sourceRoot, 'preload.css');
	const index = resolve(sourceRoot, 'index.css');

	if (watchMode) {
		const watchers = new FSWatcher({ ignoreInitial: true });

		watchers.on('change', (f) => {
			console.log('[postcss] change detect: %s', f);

			build(f);
		});

		watchers.add(preload);
		watchers.add(index);

		setTimeout(() => {
			watchers.emit('change', preload);
			watchers.emit('change', index);
		}, 500);
	} else {
		build(preload);
		build(index);
	}

	return event.register;
}
