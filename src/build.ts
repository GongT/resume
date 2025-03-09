import { readFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import markdownit from 'markdown-it';
import mdit_container from 'markdown-it-container';
import { resolve } from 'path';

const __dirname = import.meta.dirname;
export const APP_ROOT = resolve(__dirname, '..');
export const INPUT_DIR = resolve(APP_ROOT, 'src/files');
export const OUTPUT_FILE = resolve(APP_ROOT, 'index.html');
const template_file = resolve(INPUT_DIR, 'template.html');

function createInstance() {
	// full options list (defaults)
	const md = markdownit({
		// Enable HTML tags in source
		html: true,

		// Use '/' to close single tags (<br />).
		// This is only for full CommonMark compatibility.
		xhtmlOut: true,

		// Convert '\n' in paragraphs into <br>
		breaks: false,

		// CSS language prefix for fenced blocks. Can be
		// useful for external highlighters.
		langPrefix: 'language-',

		// Autoconvert URL-like text to links
		linkify: false,

		// Enable some language-neutral replacement + quotes beautification
		// For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
		typographer: true,

		// Double + single quotes replacement pairs, when typographer enabled,
		// and smartquotes on. Could be either a String or an Array.
		//
		// For example, you can use '«»„“' for Russian, '„“‚‘' for German,
		// and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
		quotes: '“”‘’',
	});

	md.renderer.rules.fence = function (tokens, idx, _options, _env, _slf) {
		const token = tokens[idx];
		const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

		if (info) {
			const [langName, kind] = info.trim().split(/\s+/g);
			if (langName === 'css' && kind === 'scope') {
				return `<style type="text/css" data-md="scope">\n@scope{\n${token.content.replace(/^/gm, '\t')}}\n</style>\n`;
			} else if (langName === 'css' && kind === 'inline') {
				return `<style type="text/css" data-md="inline">\n${token.content.replace(/^/gm, '\t')}</style>\n`;
			}
		}

		return md.utils.escapeHtml(token.content) + '\n';
	};

	md.linkify.set({ fuzzyEmail: false });
	md.use(mdit_container, 'div', {
		render: function (tokens: any, idx: number) {
			const token = tokens[idx];
			if (token.nesting === 1) {
				const heading = '' + token.info;
				const attrs = [];
				var m = heading.trim().match(/^div\s+(.*)$/);
				if (!m) return '<div>\n';
				for (const part of m[1].split(/\s+/)) {
					if (part.startsWith('#')) {
						attrs.push(`id="${part.slice(1)}"`);
					} else if (part.startsWith('.')) {
						attrs.push(`class="${part.slice(1).replace('.', ' ')}"`);
					} else {
						throw new Error(`Invalid div attribute: ${part}`);
					}
				}
				// opening tag
				return `<div ${attrs.join(' ')}>\n`;
			} else {
				// closing tag
				return '</div>\n';
			}
		},
	});

	return md;
}

let instance: markdownit;

const slotReg = /<slot\s+name="([^"]+)"\s*\/>/g;

export async function buildIndex() {
	if (!instance) instance = createInstance();

	const template = await readFile(template_file, 'utf-8');
	const output = template.replace(slotReg, (_match, name) => {
		const sFile = resolve(INPUT_DIR, name + '.md');
		try {
			const markdown = readFileSync(sFile, 'utf-8');
			return instance.render(markdown);
		} catch (e: any) {
			return instance.render('```text\n' + e.stack + '\n```');
		}
	});

	await writeFile(OUTPUT_FILE, output);
}
