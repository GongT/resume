import { DeferredPromise, EventRegister } from '@idlebox/common';
import { emptyDir } from '@idlebox/node';
import { runESBuild } from './compile-esbuild.js';
import { generateIndexHtml } from './compile-html.js';
import { compilePostcss } from './compile-postcss.js';
import { isProd, outputDir, projectRoot } from './library/constants.js';

let timer: NodeJS.Timeout | undefined;
let firstBuild = new DeferredPromise<void>();
let waiting = true;
function scheduleGenerateIndex() {
	if (timer || waiting) return;
	timer = setTimeout(() => {
		timer = undefined;

		generateIndexHtml().then(
			() => {
				console.log(' == index.html 创建');
				firstBuild.complete();
			},
			(e) => {
				console.log(' == index.html 出错');
				firstBuild.error(e);
			},
		);
	}, 500);
}

export async function execute(watch = false) {
	console.log(
		'mode: %s, version: %s | %s',
		watch ? 'watch' : 'build',
		isProd ? 'production' : 'development',
		projectRoot,
	);

	console.log(' == prepare temp output dir');
	await emptyDir(outputDir);

	// console.log(' == generate loader');
	// await generateLoader();

	const onPostcssCompiled = compilePostcss(watch);
	onPostcssCompiled((e) => {
		if (e instanceof Error) {
		} else {
			scheduleGenerateIndex();
		}
	});

	const onProjectCompiled = await runESBuild(watch);
	onProjectCompiled((e) => {
		if (e instanceof Error) {
		} else {
			scheduleGenerateIndex();
		}
	});

	// const onLoaderCompiled = transpileBootstrap(watch);
	// onLoaderCompiled((e) => {
	// 	if (e instanceof Error) {
	// 		console.error(' == 编译loader失败:', e.message);
	// 	} else {
	// 		console.log(' == 加载器编译成功');
	// 		params.__JS_BOOTSTRAP__ = e;
	// 		scheduleGenerateIndex();
	// 	}
	// });

	if (watch) {
		console.log(' == 首次生成...');

		await firstWait({
			onScssCompiled: onPostcssCompiled,
			onProjectCompiled,
			// onLoaderCompiled,
		});

		console.log(' == 首次生成结束');
	}

	waiting = false;

	scheduleGenerateIndex();

	await firstBuild.p;
}

function firstWait(events: Record<string, EventRegister<any>>) {
	return new Promise<void>((resolve) => {
		const incomplete = new Set<string>();
		for (const name of Object.keys(events)) {
			incomplete.add(name);
		}

		for (const [name, event] of Object.entries(events)) {
			const un = event((e) => {
				if (e instanceof Error) return;

				incomplete.delete(name);
				un.dispose();

				// console.log('wait job complete', incomplete);

				if (incomplete.size > 0) return;
				// console.log('complete!!');

				resolve();
			});
		}
	});
}
