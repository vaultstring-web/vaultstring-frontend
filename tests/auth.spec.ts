import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Add console logging
    page.on('console', msg => {
      if (msg.type() === 'error') console.error(`[CONSOLE ERROR] ${msg.text()}`);
      else console.log(`[CONSOLE] ${msg.text()}`);
    });
    page.on('pageerror', error => console.error(`[PAGE ERROR] ${error.message}`));

    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'admin@kyd.com');
    await page.fill('input[name="password"]', 'password123');

    // Click submit and wait for load
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);

    // Check if dashboard content is visible
    await expect(page.getByText('Total Available Balance')).toBeVisible({ timeout: 60000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Check for error message
    const errorAlert = page.getByRole('alert').first();
    await expect(errorAlert).toContainText('Invalid credentials', { ignoreCase: true });
  });
});
