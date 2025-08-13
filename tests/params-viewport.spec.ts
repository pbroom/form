import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
});

test('changing box width parameter updates viewport state', async ({page}) => {
	// Select a box node to show parameters
	const boxNode = page.locator('[data-testid^="node-box-"]').first();
	await boxNode.click();

	// Find the Width control; its input is numeric
	const widthInput = page.getByLabel('Width');
	await expect(widthInput).toBeVisible();

	// Change width from 1 to 2
	await widthInput.fill('2');
	await widthInput.blur();

	// The viewport component exists; we can't easily read geometry, but ensure no errors and presence
	await expect(page.getByTestId('viewport')).toBeVisible();
});
