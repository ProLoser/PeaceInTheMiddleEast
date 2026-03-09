import type { Page } from '@playwright/test';

export async function load(page: Page) {
  await page.goto('/');
  await page.locator('#board').waitFor({ state: 'visible' });
}

export async function setGame(page: Page, state: Record<string, unknown>) {
  await page.evaluate((s) => { (window as any).__e2e__?.setGame(s); }, state);
}

export async function setMatch(page: Page, match: Record<string, string> | null) {
  await page.evaluate((m) => { (window as any).__e2e__?.setMatch(m); }, match);
}
