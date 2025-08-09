import {defineConfig} from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
	},
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
	},
});
