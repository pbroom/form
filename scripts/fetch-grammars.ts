#!/usr/bin/env tsx
import {mkdir, writeFile, cp, stat} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const root = process.cwd();
const outDir = join(root, 'public', 'grammars');
const bundleDir = join(root, 'src', 'grammars');
const vendorDir = join(root, 'src', 'vendor');
const onigIndex = require.resolve('onigasm');
const wasmSrcNode = join(dirname(onigIndex), 'onigasm.wasm');
const wasmOut = join(root, 'public', 'onigasm.wasm');
const wasmVendorOut = join(vendorDir, 'onigasm.wasm');

// Prefer local curated grammars from @shikijs/tm-grammars
let shikiBase = '';
try {
	const shikiPkg = require.resolve('@shikijs/tm-grammars/package.json');
	shikiBase = join(dirname(shikiPkg), 'grammars');
} catch {
	shikiBase = '';
}

const pkgMap: Record<string, string> = {
	'JavaScript.tmLanguage.json': 'javascript.tmLanguage.json',
	'JavaScriptReact.tmLanguage.json': 'javascriptreact.tmLanguage.json',
	'TypeScript.tmLanguage.json': 'typescript.tmLanguage.json',
	'TypeScriptReact.tmLanguage.json': 'typescriptreact.tmLanguage.json',
	'GLSL.tmLanguage.json': 'glsl.tmLanguage.json',
	'C.tmLanguage.json': 'c.tmLanguage.json',
};

// Remote fallbacks (only used if package files are missing)
const sources: Record<string, string> = {
	'JavaScript.tmLanguage.json':
		'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/javascript/syntaxes/JavaScript.tmLanguage.json',
	'JavaScriptReact.tmLanguage.json':
		'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/javascript/syntaxes/JavaScriptReact.tmLanguage.json',
	'TypeScript.tmLanguage.json':
		'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/typescript-basics/syntaxes/TypeScript.tmLanguage.json',
	'TypeScriptReact.tmLanguage.json':
		'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/typescript-basics/syntaxes/TypeScriptReact.tmLanguage.json',
	'GLSL.tmLanguage.json':
		'https://raw.githubusercontent.com/shikijs/textmate-grammars-themes/main/packages/tm-grammars/grammars/glsl.tmLanguage.json',
	'C.tmLanguage.json':
		'https://raw.githubusercontent.com/shikijs/textmate-grammars-themes/main/packages/tm-grammars/grammars/c.tmLanguage.json',
};

async function ensureDir(path: string) {
	await mkdir(path, {recursive: true});
}

async function fileExists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function fetchText(url: string) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return await res.text();
}

async function copyFromPackage(name: string): Promise<boolean> {
	if (!shikiBase) return false;
	const src = join(shikiBase, pkgMap[name] || '');
	if (!(await fileExists(src))) return false;
	const destPublic = join(outDir, name);
	const destSrc = join(bundleDir, name);
	await ensureDir(dirname(destPublic));
	await ensureDir(dirname(destSrc));
	await cp(src, destPublic);
	await cp(src, destSrc);
	return true;
}

async function writeFromRemote(name: string, url: string): Promise<boolean> {
	try {
		const text = await fetchText(url);
		await writeFile(join(outDir, name), text, 'utf8');
		await writeFile(join(bundleDir, name), 'utf8');
		return true;
	} catch {
		return false;
	}
}

async function main() {
	console.log('➜ Setting up TextMate grammars…');
	await ensureDir(outDir);
	await ensureDir(bundleDir);
	await ensureDir(vendorDir);
	for (const [name, url] of Object.entries(sources)) {
		process.stdout.write(`  • ${name} `);
		let ok = await copyFromPackage(name);
		if (!ok) ok = await writeFromRemote(name, url);
		console.log(ok ? '' : '(skipped)');
	}
	await ensureDir(dirname(wasmOut));
	if (await fileExists(wasmSrcNode)) {
		console.log('  • onigasm.wasm');
		await cp(wasmSrcNode, wasmOut).catch(() => {});
		await cp(wasmSrcNode, wasmVendorOut).catch(() => {});
	} else {
		console.warn('  ! onigasm.wasm not found; ensure onigasm is installed');
	}
	console.log('✓ TextMate setup complete');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
