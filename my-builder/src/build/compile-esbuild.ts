import { Emitter } from '@idlebox/common';
import { relativePath, writeFileIfChange } from '@idlebox/node';
import { watch as chokidar } from 'chokidar';
import { BuildContext, BuildOptions, BuildResult, context } from 'esbuild';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import type { RawSourceMap } from 'source-map-js';
import { htmlLocals } from './compile-html.js';
import { createEntrypoints } from './esbuild/chunker.js';
import { resolveStylesPlugin } from './esbuild/css-resolver.js';
import { isProd, isVerbose, outputDir, projectRoot, sourceRoot } from './library/constants.js';

const events = new Emitter<null | Error>();

const config: BuildOptions = {
	bundle: true,
	define: {
		'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
		isDebug: isProd ? 'false' : 'true',
	},
	platform: 'browser',
	absWorkingDir: projectRoot,
	outdir: outputDir,
	splitting: true,
	sourcemap: 'linked',
	sourceRoot: '/gh-pages/@src/',
	chunkNames: 'chunks/[name]-[hash]',
	entryNames: '[name]-[hash]',
	assetNames: '[name]-[hash]',
	// publicPath: '/gh-pages',
	sourcesContent: false,
	tsconfig: resolve(sourceRoot, 'tsconfig.json'),
	keepNames: true,
	format: 'esm',
	charset: 'utf8',
	write: false,
	metafile: true,
	plugins: [resolveStylesPlugin()],
};

function removeRelativeToDist(src: string) {
	// if (!src.startsWith('support/entry/lib/')) {
	// 	throw new Error('构建内部错误: 路径应该以support/entry/lib/开头: ' + src);
	// }
	// return src.substring('support/entry/lib/'.length);
	// return relativePath();
	return src.replace(/^lib\//, '');
}

async function build(ctx: BuildContext) {
	try {
		const result = await ctx.rebuild();
		writeOut(result);
		console.error(' == 项目代码构建成功');

		return Object.keys(result.metafile!.inputs);
	} catch (e: any) {
		events.fireNoError(e);
		console.log(' == 项目编译失败', e);
		return [];
	}
}

export async function runESBuild(watch: boolean) {
	const entry = createEntrypoints();
	// console.error(entry);

	// const pass1 = await build({ ...config,   entryPoints: entry });
	// for (const [fileRel, info] of Object.entries(pass1.metafile!.inputs)) {
	// 	if (fileRel.includes('/.pnpm/')) {
	// 	}
	// }
	// console.log(pass1);
	const ctx = await context({
		...config,
		logLevel: isVerbose ? 'verbose' : watch ? 'warning' : 'info',
		entryPoints: entry,
		write: false,
		metafile: true,
	});

	if (watch) {
		const result = await build(ctx);

		const inputs = Object.keys(result);

		const watcher = chokidar(inputs, { ignoreInitial: true, atomic: true });
		watcher.on('all', async () => {
			watcher.add(await build(ctx));
		});
	} else {
		build(ctx);
	}

	return events.register;
}

async function writeOut(dist: BuildResult) {
	for (const i of dist.outputFiles!) {
		await mkdir(dirname(i.path), { recursive: true });
		if (i.path.endsWith('.map')) {
			const sourcemap: RawSourceMap = JSON.parse(i.text);
			sourcemap.sources = sourcemap.sources.map((f) => relativePath(projectRoot, resolve(i.path, '..', f)));
			await writeFileIfChange(i.path, JSON.stringify(sourcemap));
		} else {
			await writeFileIfChange(i.path, Buffer.from(i.contents));
		}
	}

	for (const [distPath, info] of Object.entries(dist.metafile!.outputs)) {
		if (info.entryPoint === 'src/entry.ts') {
			// todo: dynamic
			const result = removeRelativeToDist(distPath);
			htmlLocals.__JS_MAIN__ = result;
			events.fire(null);
			return;
		}
	}

	throw new Error('无法找到入口文件');
}
