import { test, expect } from '../src/fixtures/pages.js';

/**
 * Access control: pages behind the login must not be reachable by typing their
 * URL directly. Sauce Demo enforces this by refusing the deep link and showing
 * an error rather than rendering the protected page.
 *
 * These are the classic "forced browsing" checks — a broken guard here would
 * expose the store to unauthenticated users.
 */
const protectedPages = [
  { name: 'inventory', path: '/inventory.html' },
  { name: 'cart', path: '/cart.html' },
  { name: 'checkout step one', path: '/checkout-step-one.html' },
  { name: 'checkout step two', path: '/checkout-step-two.html' },
];

test.describe('Access control — direct URL access without a session', () => {
  for (const target of protectedPages) {
    test(`${target.name} page is not accessible without logging in`, {
      tag: ['@p1', '@regression', '@security'],
    }, async ({ loginPage, page }) => {
      // Start from a clean, unauthenticated browser context.
      await page.context().clearCookies();

      // Attempt to deep-link straight to the protected page.
      await page.goto(target.path);

      // The app must refuse: an error is shown and the protected content
      // (the products title) must not be rendered.
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(
        'You can only access',
      );
      await expect(page.locator('[data-test="title"]')).toHaveCount(0);
    });
  }
});
