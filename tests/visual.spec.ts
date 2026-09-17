import { test, expect } from '../src/fixtures/pages.js';
import { users } from '../src/data/users.js';

/**
 * Broken-UI / defect detection using the intentionally buggy `problem_user`.
 *
 * Sauce Demo ships this account specifically so automation can prove it catches
 * real defects. Two reliable, business-relevant defects are asserted here:
 *   1. Every product image is broken (served as a 404 placeholder asset).
 *   2. The checkout "Last Name" field does not accept input.
 *
 * These tests are written to FAIL if the app were ever fixed for this user,
 * which is the expected behaviour for defect-detection checks: they document a
 * known-bad state. For a real product, the same assertions would guard against
 * regressions on the standard user.
 */
test.describe('Broken-UI detection (problem_user)', () => {
  test('all product images are broken (404 placeholder)', {
    tag: ['@p1', '@regression', '@visual'],
  }, async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.loginAs(users.problem);

    await expect(inventoryPage.title).toHaveText('Products');

    const sources = await inventoryPage.imageSources();
    expect(sources.length).toBeGreaterThan(0);

    // The defect: every image points at the same broken 404 placeholder.
    for (const src of sources) {
      expect(src).toContain('sl-404');
    }
  });

  test('checkout Last Name field does not accept input (known defect)', {
    tag: ['@p1', '@regression', '@visual'],
  }, async ({ loginPage, inventoryPage, cartPage, checkoutPage }) => {
    await loginPage.goto();
    await loginPage.loginAs(users.problem);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();

    // First name accepts input as normal.
    await checkoutPage.firstNameInput.fill('Ada');
    await expect(checkoutPage.firstNameInput).toHaveValue('Ada');

    // The defect: typing into Last Name leaves it empty.
    await checkoutPage.lastNameInput.fill('Lovelace');
    await expect(checkoutPage.lastNameInput).toHaveValue('');
  });
});
