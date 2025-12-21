import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Clinical Toolkit
 *
 * Uses Playwright's built-in screenshot comparison
 * Cost-effective strategy: Screenshot only critical screens
 *
 * To update baselines: npm run test:e2e -- --update-snapshots
 */

test.describe('Clinical Toolkit - Visual Regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Close welcome modal if present
    const welcomeModal = page.locator('[role="dialog"]');
    if (await welcomeModal.isVisible()) {
      const acceptButton = page.getByRole('button', { name: /accept|agree|continue|close/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Dashboard layout', async ({ page }) => {
    // Wait for dashboard to fully load
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences (anti-aliasing, fonts)
    });
  });

  test('Dashboard - Above the fold', async ({ page }) => {
    // Screenshot just the visible viewport (faster)
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-viewport.png', {
      maxDiffPixels: 100,
    });
  });

  test('A1C Converter - Calculator screen', async ({ page }) => {
    await page.getByText(/A1C to Glucose/i).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('a1c-calculator.png', {
      maxDiffPixels: 100,
    });
  });

  test('A1C Converter - With results', async ({ page }) => {
    await page.getByText(/A1C to Glucose/i).click();
    await page.waitForTimeout(500);

    const a1cInput = page.locator('input[type="number"]').first();
    await a1cInput.fill('7.0');

    const calculateButton = page.getByRole('button', { name: /calculate/i });
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
    }

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('a1c-results.png', {
      maxDiffPixels: 100,
    });
  });

  test('ASCVD Calculator screen', async ({ page }) => {
    await page.getByText(/Heart Risk/i).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('ascvd-calculator.png', {
      maxDiffPixels: 150,
    });
  });

  test('PHQ-9 Assessment screen', async ({ page }) => {
    await page.getByText(/Mood Check/i).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('phq9-assessment.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Error state - Invalid input', async ({ page }) => {
    await page.getByText(/A1C to Glucose/i).click();
    await page.waitForTimeout(500);

    const a1cInput = page.locator('input[type="number"]').first();
    await a1cInput.fill('-5'); // Invalid

    const calculateButton = page.getByRole('button', { name: /calculate/i });
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('error-invalid-input.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('Mobile - Dashboard', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('Mobile - A1C Calculator', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Close modal if present
    const welcomeModal = page.locator('[role="dialog"]');
    if (await welcomeModal.isVisible()) {
      const acceptButton = page.getByRole('button', { name: /accept|agree|continue|close/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
      }
    }

    await page.getByText(/A1C to Glucose/i).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('mobile-a1c-calculator.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('Tablet - Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('tablet-dashboard.png', {
      maxDiffPixels: 150,
    });
  });
});

/**
 * Test Suite: Component-Level Visual Regression
 * Screenshots specific components rather than full pages
 */
test.describe('Component Visual Regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const welcomeModal = page.locator('[role="dialog"]');
    if (await welcomeModal.isVisible()) {
      const acceptButton = page.getByRole('button', { name: /accept|agree|continue|close/i });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
      }
    }
  });

  test('Quick actions grid', async ({ page }) => {
    // Find the quick actions section
    const quickActions = page.locator('div').filter({ hasText: /Heart Risk|A1C to Glucose/ }).first();

    if (await quickActions.isVisible()) {
      await expect(quickActions).toHaveScreenshot('component-quick-actions.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('Header navigation', async ({ page }) => {
    const header = page.locator('header, nav').first();

    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('component-header.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('Footer', async ({ page }) => {
    const footer = page.locator('footer').first();

    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('component-footer.png', {
        maxDiffPixels: 50,
      });
    }
  });
});

/**
 * Dark Mode Visual Regression (if supported)
 */
test.describe('Dark Mode Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Dashboard in dark mode', async ({ page }) => {
    // Try to enable dark mode
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });

    if (await themeToggle.isVisible()) {
      // Check current theme
      const bodyClass = await page.locator('body').getAttribute('class');

      // Toggle if not already dark
      if (!bodyClass?.includes('dark')) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        maxDiffPixels: 150,
      });
    }
  });
});
