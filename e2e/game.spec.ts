import { test, expect } from '@playwright/test';
import { load } from './helpers';

test.describe('Game board', () => {
  test.beforeEach(async ({ page }) => await load(page));

  test('renders the board with toolbar and dice', async ({ page }) => {
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#toolbar')).toBeVisible();
    await expect(page.locator('.dice')).toBeVisible();
  });

  test('displays 24 points, 2 bar areas, and 2 home areas', async ({ page }) => {
    await expect(page.locator('.point')).toHaveCount(24);
    await expect(page.locator('.bar')).toHaveCount(2);
    await expect(page.locator('.home')).toHaveCount(2);
  });

  test('toolbar shows offline game label when no opponent is loaded', async ({ page }) => {
    await expect(page.locator('#toolbar h2')).toHaveText('Offline Game');
  });

  test('pieces are present on the starting board', async ({ page }) => {
    const pieces = page.locator('.piece:not(.ghost)');
    await expect(pieces).toHaveCount(30);
  });
});

test.describe('Dice', () => {
  test.beforeEach(async ({ page }) => await load(page));

  test('dice start in pulsating rolling state', async ({ page }) => {
    await expect(page.locator('.dice.pulsate')).toBeVisible();
  });

  test('rolling dice transitions from rolling to moving state', async ({ page }) => {
    await expect(page.locator('.dice.pulsate')).toBeVisible();
    await page.locator('.dice').click();
    await expect(page.locator('.dice')).not.toHaveClass(/pulsate/);
  });

  test('rolling dice shows two die images', async ({ page }) => {
    await page.locator('.dice').click();
    await expect(page.locator('.dice img')).toHaveCount(2);
  });
});

test.describe('Piece selection', () => {
  test.beforeEach(async ({ page }) => await load(page));

  test('clicking a point selects it in local mode', async ({ page }) => {
    const point = page.locator('.point').first();
    await point.click();
    await expect(point).toHaveClass(/selected/);
  });

  test('clicking a selected point deselects it', async ({ page }) => {
    const point = page.locator('.point').first();
    await point.click();
    await expect(point).toHaveClass(/selected/);
    await point.click();
    await expect(point).not.toHaveClass(/selected/);
  });

  test('selecting a different point moves the selection', async ({ page }) => {
    const firstPoint = page.locator('.point').nth(0);
    const secondPoint = page.locator('.point').nth(11);
    await firstPoint.click();
    await expect(firstPoint).toHaveClass(/selected/);
    await secondPoint.click();
    await expect(firstPoint).not.toHaveClass(/selected/);
    await expect(secondPoint).toHaveClass(/selected/);
  });
});

test.describe('Login dialog', () => {
  test.beforeEach(async ({ page }) => await load(page));

  test('dialog is initially closed', async ({ page }) => {
    await expect(page.locator('dialog')).not.toBeVisible();
  });

  test('toolbar click opens the login dialog', async ({ page }) => {
    await page.locator('#toolbar').click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await expect(page.locator('#login')).toBeVisible();
  });

  test('login dialog contains a menu button and title', async ({ page }) => {
    await page.locator('#toolbar').click();
    await expect(page.locator('#login button[aria-haspopup="menu"]')).toBeVisible();
    await expect(page.locator('#login h1')).toBeVisible();
  });

  test('clicking outside the dialog closes it', async ({ page }) => {
    await page.locator('#toolbar').click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.locator('#board').click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.locator('dialog')).not.toBeVisible();
  });
});
