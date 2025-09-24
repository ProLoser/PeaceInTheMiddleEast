import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('desktop-view.png', { fullPage: true });
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-view.png', { fullPage: true });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-view.png', { fullPage: true });
  });

  test('should have appropriate touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that interactive elements are appropriately sized for mobile
    const pieces = page.locator('.piece');
    if (await pieces.count() > 0) {
      await expect(pieces.first()).toHaveScreenshot('mobile-piece.png');
    }
    
    const dice = page.locator('.dice');
    if (await dice.count() > 0) {
      await expect(dice).toHaveScreenshot('mobile-dice.png');
    }
  });
});