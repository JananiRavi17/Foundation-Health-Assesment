import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { toProductId } from '../data/products.js';

/** Options offered by the inventory sort dropdown, keyed by their <option> value. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/**
 * The product listing shown after a successful login.
 * Handles adding/removing items, reading prices and names, sorting, and
 * navigating to the cart.
 */
export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';

  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.locator('[data-test="title"]');
  }

  get items(): Locator {
    return this.page.locator('[data-test="inventory-item"]');
  }

  get itemNames(): Locator {
    return this.page.locator('[data-test="inventory-item-name"]');
  }

  get itemPrices(): Locator {
    return this.page.locator('[data-test="inventory-item-price"]');
  }

  get cartLink(): Locator {
    return this.page.locator('[data-test="shopping-cart-link"]');
  }

  get cartBadge(): Locator {
    return this.page.locator('[data-test="shopping-cart-badge"]');
  }

  get sortDropdown(): Locator {
    return this.page.locator('[data-test="product-sort-container"]');
  }

  /** All product images on the catalog. */
  get itemImages(): Locator {
    return this.page.locator('.inventory_item_img img');
  }

  /** The `src` of every product image, in listing order. */
  async imageSources(): Promise<string[]> {
    return this.itemImages.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src') ?? ''),
    );
  }

  /** The "Add to cart" button for a given product name. */
  addToCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${toProductId(productName)}"]`);
  }

  /** The "Remove" button for a given product name (present once it's in the cart). */
  removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${toProductId(productName)}"]`);
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Select a sort option from the dropdown. */
  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  /** Current cart badge count as a number (0 when the badge is hidden). */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }
    return Number((await this.cartBadge.textContent())?.trim() ?? '0');
  }

  /** All product prices in listing order, as numbers (dollar sign stripped). */
  async prices(): Promise<number[]> {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((text) => Number(text.replace('$', '').trim()));
  }

  /** All product names in listing order. */
  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((name) => name.trim());
  }
}
