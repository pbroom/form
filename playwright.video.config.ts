import {defineConfig} from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testIgnore: ['**/unit/**'],
	retries: 0,
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'retain-on-failure',
		video: 'on',
	},
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
	},
	outputDir: 'test-results/demo',
});
