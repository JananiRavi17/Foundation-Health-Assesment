import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { toProductId } from '../data/products.js';

/**
 * The shopping cart page. Lets specs inspect the line items, remove products,
 * and proceed to checkout.
 */
export class CartPage extends BasePage {
  readonly path = '/cart.html';

  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.locator('[data-test="title"]');
  }

  /** Scope line items to the cart list container so we don't match stray markup. */
  get cartItems(): Locator {
    return this.page.locator('[data-test="cart-list"] [data-test="inventory-item"]');
  }

  get itemNames(): Locator {
    return this.page.locator(
      '[data-test="cart-list"] [data-test="inventory-item-name"]',
    );
  }

  get checkoutButton(): Locator {
    return this.page.locator('[data-test="checkout"]');
  }

  get continueShoppingButton(): Locator {
    return this.page.locator('[data-test="continue-shopping"]');
  }

  removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${toProductId(productName)}"]`);
  }

  /** A cart line item located by its product name. */
  itemByName(productName: string): Locator {
    return this.page
      .locator('[data-test="cart-list"] [data-test="inventory-item"]')
      .filter({ hasText: productName });
  }

  async removeItem(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /** Number of distinct line items in the cart. */
  async itemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /** All product names currently in the cart. */
  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((name) => name.trim());
  }
}
