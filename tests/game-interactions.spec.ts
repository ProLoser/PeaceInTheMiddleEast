import { test, expect } from '@playwright/test';

test.describe('Game Piece Interactions', () => {
  test('should highlight pieces when clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial game state
    await expect(page).toHaveScreenshot('initial-game-state.png', { fullPage: true });
    
    // Try clicking on different game pieces
    const pieces = page.locator('.piece, img[src*="piece"]');
    if (await pieces.count() > 0) {
      await pieces.first().click();
      
      // Take screenshot after piece selection
      await expect(page).toHaveScreenshot('piece-selected.png', { fullPage: true });
    }
  });

  test('should show dice rolling animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of dice before clicking
    const dice = page.locator('.dice');
    if (await dice.count() > 0) {
      await expect(dice).toHaveScreenshot('dice-before-roll.png');
      
      // Click on dice
      await dice.click();
      
      // Take screenshot after dice click
      await expect(dice).toHaveScreenshot('dice-after-roll.png');
    }
  });
});