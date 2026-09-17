import { test, expect } from '../src/fixtures/pages.js';
import { products } from '../src/data/products.js';

/**
 * The inventory page is where users spend most of their time. Adding to cart,
 * removing, and sorting are the core interactions and must stay correct.
 */
test.describe('Inventory page', () => {
  test('adding an item updates the cart badge and toggles the button to Remove', {
    tag: ['@p0', '@smoke', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    // Cart starts empty (no badge shown).
    expect(await inventory.cartCount()).toBe(0);

    await inventory.addToCart(products.backpack);

    // Badge reflects one item, and the button flips to "Remove".
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(inventory.removeButton(products.backpack)).toBeVisible();
    await expect(inventory.addToCartButton(products.backpack)).toHaveCount(0);
  });

  test('adding multiple items accumulates the cart count', {
    tag: ['@p1', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.bikeLight);
    await inventory.addToCart(products.boltTShirt);

    await expect(inventory.cartBadge).toHaveText('3');
  });

  test('removing an item from the inventory page decrements the cart', {
    tag: ['@p2', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    await inventory.addToCart(products.backpack);
    await inventory.addToCart(products.bikeLight);
    await expect(inventory.cartBadge).toHaveText('2');

    await inventory.removeFromCart(products.backpack);

    await expect(inventory.cartBadge).toHaveText('1');
    // The removed item's button reverts to "Add to cart".
    await expect(inventory.addToCartButton(products.backpack)).toBeVisible();
  });

  test('sorting by price low-to-high orders products ascending', {
    tag: ['@p2', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    await inventory.sortBy('lohi');

    const prices = await inventory.prices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sorting by price high-to-low orders products descending', {
    tag: ['@p2', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    await inventory.sortBy('hilo');

    const prices = await inventory.prices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('sorting by name Z-to-A orders products in reverse alphabetical order', {
    tag: ['@p2', '@regression', '@inventory'],
  }, async ({
    loggedInInventoryPage: inventory,
  }) => {
    await inventory.sortBy('za');

    const names = await inventory.names();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });
});
