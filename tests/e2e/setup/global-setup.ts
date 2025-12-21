import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  if (!baseURL) {
    throw new Error('baseURL is not configured');
  }

  // Launch browser to verify server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log(`Waiting for dev server at ${baseURL}...`);

    // Wait for the dev server to be ready (max 60 seconds)
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 60000 });

    console.log('Dev server is ready!');
  } catch (error) {
    console.error('Failed to connect to dev server:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
