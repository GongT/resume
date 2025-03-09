import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { outputDir, sourceRoot } from './library/constants.js';

interface IHtmlLocals {
	__CSS_INDEX__: string;
	__CSS_EARLY__: string;
	__JS_MAIN__: string;
}

export const htmlLocals: IHtmlLocals = {
	__CSS_INDEX__: 'missing.css',
	__CSS_EARLY__: 'missing.css',
	__JS_MAIN__: 'missing.js',
};

export async function generateIndexHtml() {
	const src = resolve(sourceRoot, 'index.html');
	let content = await readFile(src, 'utf-8');

	for (const [from, to] of Object.entries(htmlLocals)) {
		content = content.replace(from, './' + to);
	}

	const dist = resolve(outputDir, 'index.html');
	await writeFile(dist, content, 'utf-8');
}
