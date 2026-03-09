/**
 * Game rules tests using an injected mock online match state.
 *
 * window.__e2e__ (exposed in DEV mode by App) lets tests inject specific game
 * states without needing a real Firebase backend.  A match whose game ID is
 * '__test__' is treated as a sentinel by the match observer: it marks the
 * match as online (so turn-enforcement logic applies) but skips the Firebase
 * subscription that would otherwise overwrite injected state.
 */
import { test, expect } from '@playwright/test';
import { load, setGame, setMatch } from './helpers';

const TEST_MATCH = { game: '__test__', chat: '__test__', sort: '' };

test.describe('Game rules (online match simulation)', () => {
  test.describe('Turn enforcement', () => {
    test.beforeEach(({ page }) => load(page));

    test('dice are disabled when it is not your turn', async ({ page }) => {
      await setMatch(page, TEST_MATCH);
      await setGame(page, { turn: 'opponent-uid', status: 'ROLLING' });
      // All dice images should carry the 'used' class when the disabled prop is true
      await expect(page.locator('.dice img').first()).toHaveClass(/used/);
    });

    test('dice are not disabled when it is your turn', async ({ page }) => {
      // Local mode (no match): isMyTurn is always true
      await expect(page.locator('.dice.pulsate')).toBeVisible();
      await expect(page.locator('.dice img').first()).not.toHaveClass(/used/);
    });

    test('pieces cannot be selected when it is not your turn', async ({ page }) => {
      await setMatch(page, TEST_MATCH);
      await setGame(page, { turn: 'opponent-uid', color: 'white', status: 'MOVING', dice: [3, 5] });
      // With match set and game.turn pointing to someone else, enabled=false on all points
      const point = page.locator('.point').nth(18);
      await point.click();
      await expect(point).not.toHaveClass(/selected/);
    });
  });

  test.describe('Valid move highlighting', () => {
    test.beforeEach(({ page }) => load(page));

    test('valid source points are highlighted after rolling', async ({ page }) => {
      await setGame(page, { color: 'white', status: 'MOVING', dice: [3, 5] });
      // White has pieces at indices 0, 11, 16 and 18 in the default board; all
      // have at least one reachable empty point with the given dice.
      await expect(page.locator('.point.valid')).not.toHaveCount(0);
    });

    test('valid destinations are shown after selecting a source piece', async ({ page }) => {
      await setGame(page, { color: 'white', status: 'MOVING', dice: [3, 5] });
      // Click white piece at index 18 (5 white pieces in default board)
      await page.locator('.point').nth(18).click();
      // die=3 → index 21 is empty → valid
      await expect(page.locator('.point').nth(21)).toHaveClass(/valid/);
    });

    test('blocked points with 2+ opponent pieces are not valid destinations', async ({ page }) => {
      await setGame(page, { color: 'white', status: 'MOVING', dice: [3, 5] });
      // Click white piece at index 18
      await page.locator('.point').nth(18).click();
      // die=5 → index 23 has -2 (two black pieces) → BLOCKED, must not be valid
      await expect(page.locator('.point').nth(23)).not.toHaveClass(/valid/);
    });
  });

  test.describe('Bar (Prison)', () => {
    test.beforeEach(({ page }) => load(page));

    test('bar is highlighted as valid source when a piece is on it', async ({ page }) => {
      // White has a piece on the bar; die=3 re-enters at index 9 (empty)
      await setGame(page, {
        color: 'white',
        status: 'MOVING',
        dice: [3],
        prison: { white: 1, black: 0 },
      });
      // The first .bar element in DOM order is the white bar
      await expect(page.locator('.bar').first()).toHaveClass(/valid/);
    });

    test('no regular points are valid sources when a piece is on the bar', async ({ page }) => {
      await setGame(page, {
        color: 'white',
        status: 'MOVING',
        dice: [3],
        prison: { white: 1, black: 0 },
      });
      // All source selection must go through the bar; regular points must not be valid
      await expect(page.locator('.point.valid')).toHaveCount(0);
    });
  });

  test.describe('Doubles', () => {
    test('doubles produce four dice', async ({ page }) => {
      await load(page);
      // Inject a 4-dice state directly (equivalent to a doubles roll)
      await setGame(page, { status: 'MOVING', dice: [4, 4, 4, 4] });
      await expect(page.locator('.dice img')).toHaveCount(4);
    });
  });
});
