import { test, expect } from '../src/fixtures/pages.js';
import { users, PASSWORD } from '../src/data/users.js';

/**
 * Login is the gate to the whole app, so it gets the deepest coverage:
 * the happy path, plus the negative cases a real login form must handle.
 */
test.describe('Login flow', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user logs in and lands on the inventory page', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.loginAs(users.standard);

    // URL and page heading both confirm we reached the authenticated area.
    await expect(page).toHaveURL(/.*\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');

    // A real catalog should render; Sauce Demo ships six items.
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked-out user is rejected with a clear error', async ({ loginPage, page }) => {
    await loginPage.loginAs(users.lockedOut);

    // Stay on the login screen and surface the lockout reason.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('wrong password is rejected', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match',
    );
  });

  test('missing username is rejected', async ({ loginPage }) => {
    await loginPage.fillPassword(PASSWORD);
    await loginPage.submit();

    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('missing password is rejected', async ({ loginPage }) => {
    await loginPage.fillUsername(users.standard.username);
    await loginPage.submit();

    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('user can log out and is returned to the login screen', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.loginAs(users.standard);
    await expect(inventoryPage.title).toHaveText('Products');

    await inventoryPage.logout();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
