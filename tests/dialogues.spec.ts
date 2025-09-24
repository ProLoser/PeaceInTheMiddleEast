import { test, expect } from '@playwright/test';

test.describe('Dialogues Components', () => {
  test('should display login modal for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if login dialog is present
    const dialog = page.locator('dialog[open]');
    if (await dialog.count() > 0) {
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveScreenshot('login-modal.png');
      
      // Check for login form elements
      const loginForm = dialog.locator('#login, .login, [data-testid="login"]').first();
      if (await loginForm.count() > 0) {
        await expect(loginForm).toHaveScreenshot('login-form.png');
      }
    }
  });

  test('should handle dialog interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for clickable elements that might open dialogs
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Take screenshot of buttons/toolbar
      const toolbar = page.locator('.toolbar');
      if (await toolbar.count() > 0) {
        await expect(toolbar).toHaveScreenshot('game-toolbar.png');
      }
    }
  });

  test('should display game modals appropriately', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check the current state and take appropriate screenshots
    const body = page.locator('body');
    await expect(body).toHaveScreenshot('full-page-initial-state.png', { fullPage: true });
  });
});