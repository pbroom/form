import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
});

test('generic input visible until parameters are all connected; parameter handles reveal when connected', async ({
	page,
}) => {
	// Start with two boxes: one exists by default, add another
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-new-box').click();

	const boxes = page.locator('[data-testid^="node-box-"]');
	await expect(boxes).toHaveCount(2);

	const targetBox = boxes.first();
	const sourceBox = boxes.nth(1);

	// Initially the generic handle should be visible on target box
	await expect(targetBox.getByTestId('handle-target-generic')).toBeVisible();

	// Connect one parameter via generic mapping using the dev palette command
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-connect-last-to-first-box').click();

	// After first connection, a parameter handle should be visible
	await expect(
		targetBox.locator('[data-testid^="handle-target-param-"]')
	).toHaveCount(1);

	// Add a third box and connect again to consume another parameter
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-palette').waitFor();
	await page.getByTestId('command-item-new-box').click();
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-item-connect-last-to-first-box').click();

	await expect(
		targetBox.locator('[data-testid^="handle-target-param-"]')
	).toHaveCount(2);

	// Connect third param
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-item-new-box').click();
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-item-connect-last-to-first-box').click();
	await expect(
		targetBox.locator('[data-testid^="handle-target-param-"]')
	).toHaveCount(3);

	// Now that all params are connected (width,height,depth,color), generic should hide
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-item-new-box').click();
	await page.keyboard.press('KeyN');
	await page.getByTestId('command-item-connect-last-to-first-box').click();
	await expect(targetBox.getByTestId('handle-target-generic')).toHaveCount(0);
});
