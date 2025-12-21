import { test, expect } from '@playwright/test';

/**
 * Basic E2E Tests for Clinical Toolkit
 * Minimal test suite to verify core functionality
 */

test.describe('Clinical Toolkit - Basic Functionality', () => {

  test('App loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();

    // Check for main heading or key text
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('Dashboard has quick actions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Close welcome modal if present
    const acceptButton = page.getByRole('button', { name: /accept|agree|continue|close/i });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(500);
    }

    // Look for any calculator or action buttons
    const body = await page.textContent('body');
    const hasCalculators = body && (
      body.includes('A1C') ||
      body.includes('Risk') ||
      body.includes('Assessment') ||
      body.includes('Calculator')
    );

    expect(hasCalculators).toBeTruthy();
  });

  test('Educational disclaimer is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body');
    const hasDisclaimer = bodyText && (
      bodyText.match(/educational/i) ||
      bodyText.match(/not for clinical use/i) ||
      bodyText.match(/consult.*healthcare/i)
    );

    expect(hasDisclaimer).toBeTruthy();
  });

  test('Mobile viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});
