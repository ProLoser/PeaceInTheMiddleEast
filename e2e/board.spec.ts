import { test, expect } from '@playwright/test';
import { load, setGame } from './helpers';

test.describe('Board UI', () => {
  test.describe('Structure', () => {
    test.beforeEach(async ({ page }) => await load(page));

    test('has 24 points', async ({ page }) => {
      await expect(page.locator('.point')).toHaveCount(24);
    });

    test('has 2 bar areas', async ({ page }) => {
      await expect(page.locator('.bar')).toHaveCount(2);
    });

    test('has 2 home areas', async ({ page }) => {
      await expect(page.locator('.home')).toHaveCount(2);
    });

    test('shows 30 pieces in starting position', async ({ page }) => {
      await expect(page.locator('.piece:not(.ghost)')).toHaveCount(30);
    });

    test('home areas are empty at the start', async ({ page }) => {
      await expect(page.locator('.home .piece')).toHaveCount(0);
    });
  });

  test.describe('Toolbar', () => {
    test.beforeEach(async ({ page }) => await load(page));

    test('shows Offline Game label when no opponent is loaded', async ({ page }) => {
      await expect(page.locator('#toolbar h2')).toHaveText('Offline Game');
    });

    test('shows account icon when playing locally', async ({ page }) => {
      await expect(page.locator('#toolbar .material-icons-svg')).toBeVisible();
    });
  });

  test.describe('Color state', () => {
    test.beforeEach(async ({ page }) => await load(page));

    test('board has no color class before any moves', async ({ page }) => {
      await expect(page.locator('#board')).not.toHaveClass(/white|black/);
    });

    test('board gains white class when game color is set to white', async ({ page }) => {
      await setGame(page, { color: 'white' });
      await expect(page.locator('#board')).toHaveClass(/white/);
    });

    test('board gains black class when game color is set to black', async ({ page }) => {
      await setGame(page, { color: 'black' });
      await expect(page.locator('#board')).toHaveClass(/black/);
    });
  });

  test.describe('Dice', () => {
    test.beforeEach(async ({ page }) => await load(page));

    test('dice pulsate while waiting for a roll', async ({ page }) => {
      await expect(page.locator('.dice.pulsate')).toBeVisible();
    });

    test('dice stop pulsating after rolling', async ({ page }) => {
      await page.locator('.dice').click();
      await expect(page.locator('.dice')).not.toHaveClass(/pulsate/);
    });

    test('undo button is hidden before any moves are made', async ({ page }) => {
      await page.locator('.dice').click();
      await expect(page.locator('.undo')).not.toBeVisible();
    });
  });

  test.describe('Piece selection', () => {
    test.beforeEach(async ({ page }) => await load(page));

    test('valid source points are highlighted during a move', async ({ page }) => {
      await setGame(page, { color: 'white', status: 'MOVING', dice: [3, 5] });
      await expect(page.locator('.point.valid').first()).toBeVisible();
    });

    test('clicking a point selects it', async ({ page }) => {
      const point = page.locator('.point').nth(18);
      await point.click();
      await expect(point).toHaveClass(/selected/);
    });

    test('clicking a selected point deselects it', async ({ page }) => {
      const point = page.locator('.point').nth(18);
      await point.click();
      await expect(point).toHaveClass(/selected/);
      await point.click();
      await expect(point).not.toHaveClass(/selected/);
    });

    test('selecting a different point moves the selection highlight', async ({ page }) => {
      const first = page.locator('.point').nth(0);
      const second = page.locator('.point').nth(16);
      await first.click();
      await expect(first).toHaveClass(/selected/);
      await second.click();
      await expect(first).not.toHaveClass(/selected/);
      await expect(second).toHaveClass(/selected/);
    });
  });
});
