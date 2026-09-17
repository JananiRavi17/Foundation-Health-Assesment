import { test, expect } from '../src/fixtures/pages.js';
import { products } from '../src/data/products.js';

/**
 * The cart must faithfully carry the user's selections across pages. These
 * tests verify items persist into the cart and can be removed from there.
 */
test.describe('Shopping cart', () => {
  test('items added on the inventory page appear in the cart', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    page,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.fleeceJacket);
    await inventory.openCart();

    await expect(page).toHaveURL(/.*\/cart\.html/);
    await expect(cartPage.title).toHaveText('Your Cart');
    // Web-first assertion auto-waits for the cart list to render.
    await expect(cartPage.cartItems).toHaveCount(2);

    // The exact products carried over, not just the count.
    const names = await cartPage.names();
    expect(names).toContain(products.backpack);
    expect(names).toContain(products.fleeceJacket);
  });

  test('removing an item from the cart updates its contents', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.fleeceJacket);
    await inventory.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.removeItem(products.backpack);

    await expect(cartPage.cartItems).toHaveCount(1);
    const names = await cartPage.names();
    expect(names).not.toContain(products.backpack);
    expect(names).toContain(products.fleeceJacket);
  });

  test('continue shopping returns the user to the inventory page', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    page,
  }) => {
    await inventory.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });
});
