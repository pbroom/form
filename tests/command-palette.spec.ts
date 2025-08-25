import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
});

test('opens command palette with N and shows Insert Box command', async ({
	page,
}) => {
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await expect(page.getByText('Insert Box')).toBeVisible();
});

test('Insert Box via palette creates and selects new box node', async ({
	page,
}) => {
	// Count existing box nodes first
	const initialBoxes = await page.locator('[data-testid^="node-box-"]').count();

	// Open palette and run Insert Box
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-new-box').click();

	// Expect number of box nodes to increase
	await expect(page.locator('[data-testid^="node-box-"]')).toHaveCount(
		initialBoxes + 1
	);

	// Expect one of the box nodes to be selected
	const selectedBoxes = page.locator(
		'[data-testid^="node-box-"][data-selected="true"]'
	);
	await expect(selectedBoxes).toHaveCount(1);
});
