import { test, expect } from '@playwright/test';

test.describe('Dashboard Features Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kyd.com');
    await page.fill('input[name="password"]', 'password123');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);
  });

  test('should verify all sidebar links and navigation', async ({ page }) => {
    // Labels based on en.json translations
    const sidebarLinks = [
      { label: 'Dashboard', url: '/' },
      { label: 'Wallet', url: '/wallet' },
      { label: 'Send Money', url: '/send-money' },
      { label: 'Transactions', url: '/transactions' },
      { label: 'Profile', url: '/profile' }
    ];

    for (const link of sidebarLinks) {
      console.log(`Checking sidebar link: ${link.label}`);
      // The Sidebar uses t('dashboard'), etc. We use regex to be case-insensitive
      const locator = page.locator('aside').getByRole('link', { name: new RegExp(link.label, 'i') });
      await expect(locator).toBeVisible({ timeout: 10000 });
      await locator.click();
      await page.waitForURL(url => url.pathname === link.url, { timeout: 30000 });
      console.log(`Successfully navigated to ${link.url}`);
    }
  });

  test('should verify wallet balance and asset list visibility', async ({ page }) => {
    await page.goto('/wallet');
    // Using a more generic locator based on common dashboard patterns
    await expect(page.locator('text=Balance').first()).toBeVisible({ timeout: 30000 });
  });

  test('should verify profile page and tabs', async ({ page }) => {
    await page.goto('/profile');
    // Check for profile name or email (admin@kyd.com)
    await expect(page.getByText('admin@kyd.com').first()).toBeVisible({ timeout: 30000 });
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible();
    
    // Check for tab switching if available (based on page.tsx)
    // The tabs in profile are 'posts', 'security', 'settings', etc.
    const securityTab = page.locator('button').filter({ has: page.locator('svg') }).nth(1); // Rough estimate
    // Better to use text if available
    await expect(page.getByText(/security/i).first()).toBeVisible();
  });
});
