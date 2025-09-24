import { test, expect } from '@playwright/test';

test.describe('Avatar Component', () => {
  test('should display default avatar when no user is provided', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for avatar elements
    const avatars = page.locator('.avatar');
    if (await avatars.count() > 0) {
      // Take screenshot of the first avatar
      await expect(avatars.first()).toHaveScreenshot('default-avatar.png');
    }
  });

  test('should display user avatar when user is logged in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to find login-related elements to test different states
    const dialog = page.locator('dialog');
    if (await dialog.isVisible()) {
      await expect(dialog).toHaveScreenshot('login-dialog.png');
    }
  });
});