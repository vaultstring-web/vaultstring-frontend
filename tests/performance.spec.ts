import { test, expect } from '@playwright/test';

test.describe('Performance Audit', () => {
  test('home page should meet performance budgets', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Measure time to reach a key element (TTI approximation)
    await page.waitForSelector('main');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Target: Load time under 3 seconds in test environment
    expect(loadTime).toBeLessThan(3000);

    // Check for LCP-like element
    const lcpElement = await page.locator('h1').first();
    await expect(lcpElement).toBeVisible();

    // Verify bundle sizes by checking script tags (basic check)
    const scripts = await page.locator('script[src]').count();
    console.log(`Number of scripts: ${scripts}`);
  });

  test('dashboard should load efficiently', async ({ page }) => {
    // Mock authentication if needed
    await page.goto('/login');
    // ... login logic ...
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.animate-pulse', { state: 'hidden' }); // Wait for lazy-loaded components
    const dashboardLoadTime = Date.now() - startTime;
    
    console.log(`Dashboard full load time: ${dashboardLoadTime}ms`);
    expect(dashboardLoadTime).toBeLessThan(5000); // 5s for full dashboard with charts
  });
});
