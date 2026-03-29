import type { Page } from '@playwright/test';

export async function load(page: Page) {
  await page.goto('/');
  await page.locator('#board').waitFor({ state: 'visible' });
  // Wait for the Firebase auth observer to have fired and for React to have
  // committed all resulting state resets (setSelected(null), setUsedDice([])).
  // Without this, tests that click immediately after load can race with the
  // auth callback clearing their selection.
  await page.waitForFunction(() => (window as any).__e2e__?.authReady === true);
}

export async function setGame(page: Page, state: Record<string, unknown>) {
  await page.evaluate((s) => { (window as any).__e2e__?.setGame(s); }, state);
}

export async function setMatch(page: Page, match: Record<string, string> | null) {
  await page.evaluate((m) => { (window as any).__e2e__?.setMatch(m); }, match);
}
