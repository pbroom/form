import {expect, test} from '@playwright/test';

const within = (value: number, target: number, tol = 12) =>
	Math.abs(value - target) <= tol;

async function getWrapperBox(page) {
	const box = await page
		.locator('[data-testid="minimap-wrapper"]')
		.boundingBox();
	if (!box) throw new Error('minimap wrapper not found');
	return box;
}

async function getFlowBox(page) {
	const box = await page.locator('[data-testid="rf__wrapper"]').boundingBox();
	if (!box) throw new Error('react-flow wrapper not found');
	return box;
}

test.beforeEach(async ({page}) => {
	await page.setViewportSize({width: 1280, height: 900});
	await page.goto('/');
	await page.waitForSelector('[data-testid="minimap-wrapper"]');
});

test('defaults to bottom-right with padding', async ({page}) => {
	const flow = await getFlowBox(page);
	const mini = await getWrapperBox(page);
	expect(within(flow.x + flow.width - mini.width - 12, mini.x)).toBeTruthy();
	expect(within(flow.y + flow.height - mini.height - 12, mini.y)).toBeTruthy();
});

test('can drag and drop anywhere within frame (center)', async ({page}) => {
	const flow = await getFlowBox(page);
	const handle = page.locator('[data-testid="minimap-handle"]');
	await handle.dragTo(page.locator('[data-testid="rf__wrapper"]'), {
		targetPosition: {
			x: Math.round(flow.width / 2),
			y: Math.round(flow.height / 2),
		},
	});
	const mini = await getWrapperBox(page);
	expect(mini.x).toBeGreaterThan(flow.x + 50);
	expect(mini.y).toBeGreaterThan(flow.y + 50);
});

test('anchors to nearest corner when frame resizes', async ({page}) => {
	// place minimap near top-left
	const handle = page.locator('[data-testid="minimap-handle"]');
	await handle.dragTo(page.locator('[data-testid="rf__wrapper"]'), {
		targetPosition: {x: 10, y: 10},
	});
	await page.waitForTimeout(60);
	// resize and re-read flow box
	await page.setViewportSize({width: 1200, height: 800});
	await page.waitForTimeout(120);
	const flow = await getFlowBox(page);
	const mini = await getWrapperBox(page);
	expect(within(mini.x, flow.x + 12, 16)).toBeTruthy();
	expect(within(mini.y, flow.y + 12, 16)).toBeTruthy();
});

test('double-click moves to nearest corner with default padding', async ({
	page,
}) => {
	// Move somewhere near top-right then dblclick
	const handle = page.locator('[data-testid="minimap-handle"]');
	const flow = await getFlowBox(page);
	await handle.dragTo(page.locator('[data-testid="rf__wrapper"]'), {
		targetPosition: {x: flow.width - 40, y: 40},
	});
	await handle.dblclick();
	await page.waitForTimeout(450);
	const mini = await getWrapperBox(page);
	expect(within(mini.y, flow.y + 12, 16)).toBeTruthy();
	expect(
		within(mini.x, flow.x + flow.width - mini.width - 12, 16)
	).toBeTruthy();
});

// Updated: assert wrapper movement by comparing bounding boxes mid-drag
test('while dragging, the minimap wrapper moves with the cursor', async ({
	page,
}) => {
	const handle = page.locator('[data-testid="minimap-handle"]');
	const flow = await getFlowBox(page);
	const before = await getWrapperBox(page);

	await handle.hover();
	await page.mouse.down();
	// Move cursor somewhat diagonally into the canvas
	await page.mouse.move(flow.x + 150, flow.y + 150);
	await page.waitForTimeout(30);
	const mid = await getWrapperBox(page);
	const dx = Math.abs((mid.x ?? 0) - (before.x ?? 0));
	const dy = Math.abs((mid.y ?? 0) - (before.y ?? 0));
	expect(dx + dy).toBeGreaterThan(30);
	await page.mouse.up();
});

test('anchors to right edges when sizing up', async ({page}) => {
	const flow1 = await getFlowBox(page);
	const handle = page.locator('[data-testid="minimap-handle"]');

	// Move to top-right and snap
	await handle.dragTo(page.locator('[data-testid="rf__wrapper"]'), {
		targetPosition: {x: flow1.width - 20, y: 20},
	});
	await handle.dblclick();
	await page.waitForTimeout(250);
	const miniTR = await getWrapperBox(page);
	expect(
		within(miniTR.x, flow1.x + flow1.width - miniTR.width - 12, 16)
	).toBeTruthy();

	// Size up
	await page.setViewportSize({width: 1440, height: 900});
	await page.waitForTimeout(200);
	const flow2 = await getFlowBox(page);
	const miniAfterUpTR = await getWrapperBox(page);
	// Should stay anchored to new right
	expect(
		within(
			miniAfterUpTR.x,
			flow2.x + flow2.width - miniAfterUpTR.width - 12,
			18
		)
	).toBeTruthy();

	// Move to bottom-right and snap
	await handle.dragTo(page.locator('[data-testid="rf__wrapper"]'), {
		targetPosition: {x: flow2.width - 20, y: flow2.height - 20},
	});
	await handle.dblclick();
	await page.waitForTimeout(250);
	const miniBR = await getWrapperBox(page);
	expect(
		within(miniBR.x, flow2.x + flow2.width - miniBR.width - 12, 16)
	).toBeTruthy();

	// Size up again
	await page.setViewportSize({width: 1600, height: 1000});
	await page.waitForTimeout(200);
	const flow3 = await getFlowBox(page);
	const miniAfterUpBR = await getWrapperBox(page);
	expect(
		within(
			miniAfterUpBR.x,
			flow3.x + flow3.width - miniAfterUpBR.width - 12,
			18
		)
	).toBeTruthy();
});
