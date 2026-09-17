import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { type TestUser } from '../data/users.js';

/**
 * The Sauce Demo login screen (the site root).
 * Exposes granular actions (fill fields, submit) plus a `login` convenience
 * so specs can either drive the form step-by-step or authenticate in one call.
 */
export class LoginPage extends BasePage {
  readonly path = '/';

  constructor(page: Page) {
    super(page);
  }

  get usernameInput(): Locator {
    return this.page.locator('[data-test="username"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('[data-test="password"]');
  }

  get loginButton(): Locator {
    return this.page.locator('[data-test="login-button"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-test="error"]');
  }

  /** Type a username without submitting. */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Type a password without submitting. */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  /** Fill both fields and submit in one step. */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Log in using a catalogued {@link TestUser}. */
  async loginAs(user: TestUser): Promise<void> {
    await this.login(user.username, user.password);
  }
}
