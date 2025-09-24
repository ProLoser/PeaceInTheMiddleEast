import { test, expect } from '@playwright/test';

test.describe('Backgammon Game Application', () => {
  test('should display the main game board', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the full page
    await expect(page).toHaveScreenshot('main-game-board.png', { fullPage: true });
    
    // Check that key elements are visible
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.board')).toBeVisible();
  });

  test('should display dice correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for dice elements
    const dice = page.locator('.dice');
    await expect(dice).toBeVisible();
    
    // Take screenshot of dice area
    await expect(dice).toHaveScreenshot('game-dice.png');
  });

  test('should display game points', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for board points
    const points = page.locator('.point');
    await expect(points.first()).toBeVisible();
    
    // Take screenshot of the board area
    await expect(page.locator('.board')).toHaveScreenshot('game-board.png');
  });
});