import { test, expect } from '@playwright/test';
import { load } from './helpers';

test.describe('Dialogues', () => {
  test.describe('Login dialog', () => {
    test.beforeEach(({ page }) => load(page));

    test('dialog is closed by default', async ({ page }) => {
      await expect(page.locator('dialog')).not.toBeVisible();
    });

    test('toolbar click opens the login dialog', async ({ page }) => {
      await page.locator('#toolbar').click();
      await expect(page.locator('dialog[open]')).toBeVisible();
      await expect(page.locator('#login')).toBeVisible();
    });

    test('login dialog title shows Play Online when no friend is loaded', async ({ page }) => {
      await page.locator('#toolbar').click();
      await expect(page.locator('#login h1')).toHaveText('Play Online');
    });

    test('login dialog has a FirebaseUI container', async ({ page }) => {
      await page.locator('#toolbar').click();
      // The div that FirebaseUI mounts into is always present
      await expect(page.locator('#login > div')).toBeVisible();
    });

    test('clicking outside the dialog closes it', async ({ page }) => {
      await page.locator('#toolbar').click();
      await expect(page.locator('dialog[open]')).toBeVisible();
      await page.locator('#board').click({ position: { x: 5, y: 5 }, force: true });
      await expect(page.locator('dialog')).not.toBeVisible();
    });
  });

  test.describe('Menu', () => {
    test.beforeEach(async ({ page }) => {
      await load(page);
      await page.locator('#toolbar').click();
      await expect(page.locator('#login')).toBeVisible();
    });

    test('menu button has correct accessibility attributes', async ({ page }) => {
      const btn = page.locator('#login button[aria-haspopup="menu"]');
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
    });

    test('menu button toggles aria-expanded on click', async ({ page }) => {
      const btn = page.locator('#login button[aria-haspopup="menu"]');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
    });

    test('menu contains a Reset Game option', async ({ page }) => {
      await page.locator('#login button[aria-haspopup="menu"]').click();
      await expect(page.locator('#login menu').getByText('Reset Game')).toBeVisible();
    });

    test('menu contains a Report Bug link', async ({ page }) => {
      await page.locator('#login button[aria-haspopup="menu"]').click();
      await expect(page.locator('#login menu').getByText('Report Bug')).toBeVisible();
    });

    test('menu contains an About link', async ({ page }) => {
      await page.locator('#login button[aria-haspopup="menu"]').click();
      await expect(page.locator('#login menu').getByText('About')).toBeVisible();
    });

    test('menu shows the app version', async ({ page }) => {
      await page.locator('#login button[aria-haspopup="menu"]').click();
      // Version component renders a version string like "1.1.0-abc1234"
      await expect(page.locator('#login menu').getByText(/\d+\.\d+\.\d+/)).toBeVisible();
    });
  });
});
