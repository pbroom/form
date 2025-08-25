import {describe, expect, it} from 'vitest';
import {emitReactModule} from '@/lib/codegen/react/index';
import {writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {execSync} from 'node:child_process';

describe('Codegen typecheck (tsc --noEmit)', () => {
	it('emitted TSX typechecks', () => {
		const tsx = emitReactModule({
			meta: {schemaVersion: '1', createdAt: 'x', updatedAt: 'x'},
			graph: {nodes: [], edges: []},
			tree: {moduleName: 'MainScene', rootType: 'r3f'},
		} as any);
		const tmp = join(process.cwd(), `.tmp-cg-${Date.now()}`);
		mkdirSync(tmp, {recursive: true});
		const file = join(tmp, 'MainScene.tsx');
		writeFileSync(file, tsx, 'utf8');
		const tsconfig = {
			compilerOptions: {
				lib: ['DOM', 'ES2020'],
				jsx: 'react-jsx',
				module: 'ESNext',
				target: 'ES2020',
				moduleResolution: 'bundler',
				strict: true,
				skipLibCheck: true,
				baseUrl: '.',
				paths: {
					'@/*': ['../src/*'],
				},
			},
			include: ['MainScene.tsx'],
		} as any;
		writeFileSync(
			join(tmp, 'tsconfig.json'),
			JSON.stringify(tsconfig, null, 2),
			'utf8'
		);
		try {
			execSync(`npx --yes tsc -p ${tmp} --noEmit`, {stdio: 'pipe'});
			// if no error, typecheck passed
			expect(true).toBe(true);
		} finally {
			rmSync(tmp, {recursive: true, force: true});
		}
	});
});
