import { type Page, type Locator } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 * Concrete pages extend this to get the `page` handle and common helpers,
 * keeping navigation and small utilities in one place.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Path this page lives at, relative to the configured baseURL (e.g. "/inventory.html"). */
  abstract readonly path: string;

  /** Navigate directly to this page's path. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** The burger-menu logout link, shared by every authenticated page. */
  private get menuButton(): Locator {
    return this.page.locator('#react-burger-menu-btn');
  }

  private get logoutLink(): Locator {
    return this.page.locator('[data-test="logout-sidebar-link"]');
  }

  /** Open the burger menu and sign the current user out. */
  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
