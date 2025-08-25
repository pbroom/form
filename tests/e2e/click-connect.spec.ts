import {expect, test} from '@playwright/test';

// Helpers
async function clickAtCenter(page: any, locator: any) {
	const box = await locator.boundingBox();
	if (!box) throw new Error('Element has no bounding box');
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function pressAtCenter(page: any, locator: any) {
	const box = await locator.boundingBox();
	if (!box) throw new Error('Element has no bounding box');
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

async function moveFromCenter(page: any, locator: any, dx: number, dy: number) {
	const box = await locator.boundingBox();
	if (!box) throw new Error('Element has no bounding box');
	await page.mouse.move(
		box.x + box.width / 2 + dx,
		box.y + box.height / 2 + dy
	);
}

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
});

test.describe('Connections – previews and click→click', () => {
	test('shows drag preview between mousedown and mouseup', async ({page}) => {
		const sourceHandle = page.locator('[data-testid="handle-source"]').first();
		await pressAtCenter(page, sourceHandle);
		// Drag a bit relative to the handle
		await moveFromCenter(page, sourceHandle, 80, 0);
		// Expect React Flow connection line to be visible
		const connectionPreview = page.locator('.react-flow__connection-path');
		await expect(connectionPreview).toBeVisible();
		await page.mouse.up();
	});

	test('shows ghost preview after click and hides on Escape', async ({
		page,
	}) => {
		const sourceHandle = page.locator('[data-testid="handle-source"]').first();
		await clickAtCenter(page, sourceHandle);
		// Move cursor a bit from the source to trigger ghost wire render inside editor
		await moveFromCenter(page, sourceHandle, 100, 0);
		const ghostOverlay = page.locator('[data-testid="ghost-wire-overlay"]');
		const ghostPath = page.locator('[data-testid="ghost-wire-path"]');
		await expect(ghostOverlay).toBeVisible();
		await expect(ghostPath).toBeVisible();
		// Esc clears pending selection and removes ghost
		await page.keyboard.press('Escape');
		await expect(ghostOverlay).toHaveCount(0);
	});

	test('Esc cancels and next click does not connect', async ({page}) => {
		// Count existing edges
		const edgeItems = page.locator('.react-flow__edge');
		const initialCount = await edgeItems.count();
		// Start pending from a source, then press Esc
		const sourceHandle = page.locator('[data-testid="handle-source"]').first();
		await clickAtCenter(page, sourceHandle);
		await page.keyboard.press('Escape');
		// Click a generic input handle (should not create new edge)
		const genericTarget = page
			.locator('[data-testid="handle-target-generic"]')
			.first();
		await clickAtCenter(page, genericTarget);
		// Ghost should not be visible and edge count unchanged
		await expect(
			page.locator('[data-testid="ghost-wire-overlay"]')
		).toHaveCount(0);
		await expect(edgeItems).toHaveCount(initialCount);
	});
});
