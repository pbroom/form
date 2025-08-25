import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
});

test('export code shows fenced regions and component', async ({page}) => {
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-export-code').click();
	const ta = page.getByTestId('code-export');
	await expect(ta).toBeVisible();
	await expect(ta).toContainText('BEGIN GENERATED: imports');
	await expect(ta).toContainText('export function MainScene()');
});
