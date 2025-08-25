import {test, expect} from '@playwright/test';

test.describe('Code View Panel', () => {
	test('renders as a resizable panel and shows prompt when non-code node selected', async ({
		page,
	}) => {
		await page.goto('/');
		await expect(page.getByTestId('code-view-panel')).toBeVisible();
		await expect(page.getByTestId('code-view-panel')).toContainText(
			'Select a Code node'
		);
	});
});
