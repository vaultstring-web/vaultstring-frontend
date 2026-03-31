import { test, expect } from '@playwright/test';

test.describe.skip('Google OAuth Flow (Mock Mode)', () => {
  test('logs in via Google and lands on dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Click Google button
    await page.getByText('Google', { exact: true }).click();

    // The flow should redirect through the gateway mock login
    // and then to our google-callback page which finishes auth.
    // Wait until we reach callback or home page.
    await page.waitForURL((url) => {
      const href = url.toString();
      return href.includes('/google-callback') || href.endsWith('/');
    }, { timeout: 15000 });

    // If we are on the callback page, it will auto-redirect to home after success
    // Wait for dashboard heading to be visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });

    // Sanity check: dashboard welcome text should be visible
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
  });
});
