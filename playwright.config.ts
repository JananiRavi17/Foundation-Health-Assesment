import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Sauce Demo test suite.
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Maximum time one test can run. */
  timeout: 30_000,

  /* Assertion (expect) timeout. */
  expect: {
    timeout: 5_000,
  },

  /* Run tests within a file in parallel. */
  fullyParallel: true,

  /* Fail the build on CI if test.only is accidentally left in the source. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only to smooth over flaky infra; keep local runs honest. */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel workers on CI for stable, reproducible runs. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporters: readable line output locally + an HTML report artifact. */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* Settings shared across all projects. */
  use: {
    /* Base URL so specs and page objects use relative paths. */
    baseURL: 'https://www.saucedemo.com',

    /* Collect a trace when retrying a failed test for easier debugging. */
    trace: 'on-first-retry',

    /* Capture screenshots and video only on failure to keep artifacts small. */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Reasonable action/navigation timeouts. */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  /* Run the core suite across the three major browser engines. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
