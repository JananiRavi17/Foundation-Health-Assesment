import { test, expect } from '../src/fixtures/pages.js';
import { products } from '../src/data/products.js';

const buyer = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: 'EC1A 1BB',
};

/**
 * Checkout is the most business-critical journey: a broken checkout means lost
 * revenue. This covers the full happy path end-to-end, the money math on the
 * summary, and the form validation that guards it.
 */
test.describe('Checkout', () => {
  test('completes an end-to-end purchase from login to confirmation', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutPage,
    page,
  }) => {
    // Add two items and head to the cart.
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.bikeLight);
    await inventory.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // Enter the checkout flow and provide buyer information.
    await cartPage.checkout();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
    await checkoutPage.fillInformation(buyer);

    // Summary step shows both line items.
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(checkoutPage.summaryItems).toHaveCount(2);

    // Place the order and assert on the confirmation.
    await checkoutPage.finish();
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('order total equals item subtotal plus tax', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutPage,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.fleeceJacket);
    await inventory.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(buyer);

    const subtotal = await checkoutPage.itemTotal();
    const tax = await checkoutPage.tax();
    const total = await checkoutPage.total();

    // The displayed total must be internally consistent (allow float rounding).
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('checkout requires buyer information', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutPage,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.openCart();
    await cartPage.checkout();

    // Submit the info form with everything blank.
    await checkoutPage.fillInformation({
      firstName: '',
      lastName: '',
      postalCode: '',
    });

    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });
});
