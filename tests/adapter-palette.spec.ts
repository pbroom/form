import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
	// Wait for editor to mount so key listener is attached
	await page.waitForSelector('[data-testid="rf__wrapper"]');
});

test('palette shows adapter nodes and can insert Mesh', async ({page}) => {
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-new-mesh').click();
	await expect(page.locator('[data-testid^="node-mesh-"]')).toHaveCount(1);
});
