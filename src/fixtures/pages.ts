import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { users } from '../data/users.js';

/**
 * Page objects made available to every test through Playwright fixtures.
 * Instead of `new LoginPage(page)` in each spec, tests declare the pages they
 * need in the destructured argument and get a ready-to-use instance.
 */
interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** An inventory page reached by logging in as the standard user first. */
  loggedInInventoryPage: InventoryPage;
}

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  loggedInInventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(users.standard);
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
