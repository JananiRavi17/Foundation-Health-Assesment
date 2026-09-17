import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/** Buyer details required by checkout step one. */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * The two-step checkout flow plus the completion screen.
 *
 * Step one (/checkout-step-one.html): buyer information form.
 * Step two (/checkout-step-two.html): order summary and totals.
 * Complete (/checkout-complete.html): confirmation message.
 *
 * These share enough context that one page object models the whole flow.
 */
export class CheckoutPage extends BasePage {
  /** Default entry point of the flow. */
  readonly path = '/checkout-step-one.html';

  constructor(page: Page) {
    super(page);
  }

  // --- Step one: information form ---
  get firstNameInput(): Locator {
    return this.page.locator('[data-test="firstName"]');
  }

  get lastNameInput(): Locator {
    return this.page.locator('[data-test="lastName"]');
  }

  get postalCodeInput(): Locator {
    return this.page.locator('[data-test="postalCode"]');
  }

  get continueButton(): Locator {
    return this.page.locator('[data-test="continue"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-test="error"]');
  }

  // --- Step two: order summary ---
  get finishButton(): Locator {
    return this.page.locator('[data-test="finish"]');
  }

  get summaryItems(): Locator {
    return this.page.locator('[data-test="cart-list"] [data-test="inventory-item"]');
  }

  get itemTotalLabel(): Locator {
    return this.page.locator('[data-test="subtotal-label"]');
  }

  get taxLabel(): Locator {
    return this.page.locator('[data-test="tax-label"]');
  }

  get totalLabel(): Locator {
    return this.page.locator('[data-test="total-label"]');
  }

  // --- Completion ---
  get completeHeader(): Locator {
    return this.page.locator('[data-test="complete-header"]');
  }

  get completeText(): Locator {
    return this.page.locator('[data-test="complete-text"]');
  }

  /** Fill the buyer-info form and continue to the summary. */
  async fillInformation(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }

  /** Confirm and place the order from the summary step. */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /** Parse a currency label (e.g. "Item total: $29.99") into a number. */
  private static parseAmount(text: string | null): number {
    const match = text?.match(/\$([\d.]+)/);
    return match ? Number(match[1]) : NaN;
  }

  async itemTotal(): Promise<number> {
    return CheckoutPage.parseAmount(await this.itemTotalLabel.textContent());
  }

  async tax(): Promise<number> {
    return CheckoutPage.parseAmount(await this.taxLabel.textContent());
  }

  async total(): Promise<number> {
    return CheckoutPage.parseAmount(await this.totalLabel.textContent());
  }
}
