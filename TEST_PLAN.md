# Test Plan — Sauce Demo Web Application

**Application under test:** [Sauce Demo](https://www.saucedemo.com/) (Swag Labs storefront)
**Test type:** End-to-end UI automation (Playwright + TypeScript)
**Browsers:** Chromium, Firefox, WebKit
**Total test cases:** 27 (each executed on 3 browsers)

---

## How to read this document

Each test case is listed as a row so a non-technical reader can scan the business
reason, the steps a user takes, and what the user should see. Every case is
automated — the "Steps" mirror what the automation performs. Cases are grouped by
priority (P0 → P2).

### Priority definitions

| Priority | Meaning | Release rule |
|----------|---------|--------------|
| **P0 — Critical** | Blocks revenue or blocks access. If this fails, customers cannot buy or cannot log in. | Must pass. A failure blocks release. |
| **P1 — High** | Core shopping functionality customers use on every visit. Failure causes major friction. | Should pass. A failure needs sign-off to release. |
| **P2 — Medium** | Validation, convenience, and quality-of-life features. Failure is a poor experience, not a blocker. | Track and fix; does not block release on its own. |

### Coverage at a glance

| Area | P0 | P1 | P2 | Total |
|------|----|----|----|-------|
| Login & Access | 1 | 1 | 3 | 5 |
| Logout | — | — | 1 | 1 |
| Product Catalog | 2 | — | 4 | 6 |
| Shopping Cart | 2 | — | 1 | 3 |
| Checkout | 2 | — | 1 | 3 |
| Access Control (security) | — | 4 | — | 4 |
| Broken-UI / Defect detection | — | 2 | — | 2 |
| Accessibility (WCAG) | — | 2 | — | 2 |
| Performance resilience | — | — | 1 | 1 |
| **Total** | **7** | **9** | **11** | **27** |

---

## Test tags & execution

Every automated test is labelled with tags so the suite can be run in slices —
for example, a fast pre-release check of only the critical cases, or everything
for one feature area — without maintaining separate test files. The tags on each
case below map directly to what the automation carries in code.

Three kinds of tags are used:

| Tag group | Tags | Purpose |
|-----------|------|---------|
| **Priority** | `@p0`, `@p1`, `@p2` | Matches the priority of the case (critical / high / medium) |
| **Suite** | `@smoke`, `@regression` | `@smoke` = the 7 P0 must-pass cases run on every build; `@regression` = the full suite |
| **Feature area** | `@login`, `@inventory`, `@cart`, `@checkout`, `@security`, `@visual`, `@accessibility`, `@performance` | Groups cases by the part of the app or the type of quality check they exercise |

| Tag | Selects | Count |
|-----|---------|-------|
| `@smoke` | P0 must-pass set | 7 |
| `@regression` | The full suite | 27 |
| `@p0` / `@p1` / `@p2` | By priority | 7 / 9 / 11 |
| `@login` / `@inventory` / `@cart` / `@checkout` | Core feature areas | 6 / 6 / 3 / 3 |
| `@security` / `@visual` / `@accessibility` / `@performance` | Quality / non-functional checks | 4 / 2 / 2 / 1 |

**How they're run** (see the README for the full command list):

- `npm run test:smoke` — the 7 P0 cases; intended for every build / pull request.
- `npm run test:regression` — all 27 cases; intended nightly and before a release.
- `npm run test:p0` / `test:p1` / `test:p2` — by priority.
- `npm run test:checkout` (and similar) — by feature area.
- `npm run test:security` / `test:visual` / `test:accessibility` / `test:performance` — by quality check.

Recommended cadence: run **`@smoke`** on every commit for fast feedback, and the
full **`@regression`** suite nightly and before each release.

---

## P0 — Critical (must pass to release)

These seven cases protect the two things the business cannot lose: the ability to **log in** and the ability to **complete a purchase**.

| TC | Title | Area | Tags | Business reason | Preconditions | Steps | Expected result | Automation assertion |
|----|-------|------|------|-----------------|---------------|-------|-----------------|----------------------|
| TC-01 | Registered customer can log in | Login & Access | `@p0` `@smoke` `@login` | Login is the front door to the store; if it fails, no customer can shop. | Valid account (`standard_user`). | 1. Open the home page. 2. Enter a valid username and password. 3. Select **Login**. | Customer reaches the catalog; heading reads **"Products"**; all 6 products display. | Verify the URL is the inventory page, the heading reads "Products", and exactly 6 products are shown. |
| TC-02 | Add a product to the cart | Product Catalog | `@p0` `@smoke` `@inventory` | Adding to cart is the first step of every purchase. | Logged in, viewing the catalog, cart empty. | 1. Locate a product (Backpack). 2. Select **Add to cart**. | Cart counter shows **1**; the product's button changes from **Add to cart** to **Remove**. | Verify the cart badge shows "1", a "Remove" button is now visible, and the "Add to cart" button is gone. |
| TC-03 | Products appear correctly in the cart | Shopping Cart | `@p0` `@smoke` `@cart` | The cart must faithfully carry the customer's selections. | Logged in. | 1. Add two products (Backpack, Fleece Jacket). 2. Open the cart. | Cart page titled **"Your Cart"**; exactly **2** items; both chosen products present by name. | Verify the URL is the cart page, the title reads "Your Cart", exactly 2 line items appear, and both product names (Backpack and Fleece Jacket) are present. |
| TC-04 | Complete a purchase end-to-end | Checkout | `@p0` `@smoke` `@checkout` | The revenue path; a broken checkout loses every sale. | Logged in with items to buy. | 1. Add two products, open cart. 2. **Checkout**. 3. Enter buyer info, continue. 4. Review summary. 5. **Finish**. | Summary shows both items; confirmation reads **"Thank you for your order!"** | Verify the summary step lists both items, then after finishing the URL is the completion page and the confirmation reads "Thank you for your order!". |
| TC-05 | Order total = item price + tax | Checkout | `@p0` `@smoke` `@checkout` | Charging the wrong amount is a financial/legal risk. | Logged in with items, at the order summary. | 1. Add two products, checkout. 2. Enter buyer info, continue to summary. 3. Read subtotal, tax, total. | Displayed **Total** equals **subtotal + tax**, accurate to the cent. | Verify the displayed total equals the item subtotal plus tax, to the cent. |
| TC-06 | Locked-out customer is blocked | Login & Access | `@p0` `@smoke` `@login` | Access control must hold for suspended accounts. | Locked account (`locked_out_user`). | 1. Open the home page. 2. Enter locked account credentials. 3. Select **Login**. | Stays on login page (no access); clear error explaining the account is **locked out**. | Verify the user stays on the login page and an error containing "locked out" is shown. |
| TC-07 | Login refused with wrong password | Login & Access | `@p0` `@smoke` `@login` | Basic account security; a wrong password must never grant access. | A valid account exists. | 1. Open the home page. 2. Enter a valid username with an **incorrect** password. 3. Select **Login**. | Access denied; error **"Username and password do not match."** | Verify an error is shown containing "Username and password do not match". |

---

## P1 — High (core functionality; sign-off needed if failing)

| TC | Title | Area | Tags | Business reason | Preconditions | Steps | Expected result | Automation assertion |
|----|-------|------|------|-----------------|---------------|-------|-----------------|----------------------|
| TC-08 | Cart accumulates multiple products | Product Catalog | `@p1` `@inventory` | Customers routinely buy more than one item; the counter must reflect all of them. | Logged in, viewing the catalog. | 1. Add three different products, one after another. | Cart counter shows **3**. | Verify the cart badge shows "3". |
| TC-19 | Inventory page blocked without login | Access Control (security) | `@p1` `@security` | Protected pages must not be reachable via direct URL ("forced browsing"). | No active session (no cookies). | 1. Without logging in, go directly to `/inventory.html`. | Catalog does **not** render; error **"You can only access '/inventory.html' when you are logged in."** | Verify an error containing "You can only access" is shown and the products heading does not appear. |
| TC-20 | Cart page blocked without login | Access Control (security) | `@p1` `@security` | Same forced-browsing protection for the cart. | No active session. | 1. Without logging in, go directly to `/cart.html`. | Page refused with an access error; protected content does not render. | Verify an error containing "You can only access" is shown and the protected content does not appear. |
| TC-21 | Checkout step one blocked without login | Access Control (security) | `@p1` `@security` | The checkout flow must be gated behind authentication. | No active session. | 1. Without logging in, go directly to `/checkout-step-one.html`. | Page refused with an access error; protected content does not render. | Verify an error containing "You can only access" is shown and the protected content does not appear. |
| TC-22 | Checkout step two blocked without login | Access Control (security) | `@p1` `@security` | The order-summary step must also be gated. | No active session. | 1. Without logging in, go directly to `/checkout-step-two.html`. | Page refused with an access error; protected content does not render. | Verify an error containing "You can only access" is shown and the protected content does not appear. |
| TC-23 | Broken product images detected | Broken-UI / Defect detection | `@p1` `@visual` | Product imagery drives sales; proves automation catches broken images (via `problem_user`, broken on purpose). | `problem_user` available. | 1. Log in as `problem_user`. 2. Inspect the product images. | Every product image resolves to a broken 404 placeholder rather than the real photo. *(Documents a known-bad demo state; on a live app the same check guards against regressions.)* | Verify at least one product image exists and that every image source points to the broken "sl-404" placeholder. |
| TC-24 | Broken checkout field detected | Broken-UI / Defect detection | `@p1` `@visual` | A field that silently rejects input blocks checkout; proves automation catches it (`problem_user` broken "Last Name"). | Logged in as `problem_user`, item in cart, at checkout info step. | 1. Enter a first name. 2. Attempt to enter a last name. | First name accepted; **Last Name stays empty** despite typing — defect detected. | Verify the first-name field holds "Ada" while the last-name field remains empty after typing. |
| TC-25 | Login page a11y — no serious/critical | Accessibility (WCAG) | `@p1` `@accessibility` | Customers using assistive tech must be able to log in; serious barriers exclude users and carry compliance risk. | None. | 1. Open the login page. 2. Run a WCAG 2.0/2.1 (A & AA) scan. | No **serious** or **critical** violations. Lower-severity findings attached for triage. | Verify the accessibility scan reports no violations of serious or critical severity. |
| TC-26 | Inventory page a11y — no serious/critical | Accessibility (WCAG) | `@p1` `@accessibility` | The main shopping page must be usable with assistive tech. | Valid account (`standard_user`). | 1. Log in, open the catalog. 2. Run a WCAG 2.0/2.1 (A & AA) scan. | No **serious** or **critical** violations. Full findings attached. *(Automated scans catch a subset of issues; full conformance still needs manual assistive-tech testing.)* | Verify the catalog loaded ("Products" heading) and the accessibility scan reports no serious or critical violations. |

---

## P2 — Medium (validation, convenience, and quality)

| TC | Title | Area | Tags | Business reason | Preconditions | Steps | Expected result | Automation assertion |
|----|-------|------|------|-----------------|---------------|-------|-----------------|----------------------|
| TC-09 | Login requires a username | Login & Access | `@p2` `@login` | Clear validation helps customers recover from mistakes. | — | 1. Enter a password, leave username blank. 2. **Login**. | Error **"Username is required."** | Verify an error containing "Username is required" is shown. |
| TC-10 | Login requires a password | Login & Access | `@p2` `@login` | Same — helpful, correct validation messaging. | — | 1. Enter a username, leave password blank. 2. **Login**. | Error **"Password is required."** | Verify an error containing "Password is required" is shown. |
| TC-11 | Customer can log out | Logout | `@p2` `@login` | Customers on shared devices need to sign out cleanly. | Logged in. | 1. Open the menu. 2. Select **Logout**. | Returned to the login page; login button shown, confirming the session ended. | Verify the URL is the login page and the login button is visible. |
| TC-12 | Remove an item from the catalog view | Product Catalog | `@p2` `@inventory` | Customers change their minds; removal must update the cart immediately. | Logged in with two items added. | 1. Select **Remove** on one product from the catalog. | Cart counter drops to **1**; that product's button reverts to **Add to cart**. | Verify the cart badge shows "1" and the product's "Add to cart" button is visible again. |
| TC-13 | Remove an item from within the cart | Shopping Cart | `@p2` `@cart` | Editing the cart before checkout is a basic expectation. | Logged in with two items, viewing the cart. | 1. On the cart page, select **Remove** for one item. | Only **1** item remains; removed product gone, other still listed. | Verify exactly 1 line item remains, the removed product is absent, and the other product is still listed. |
| TC-14 | Sort by price, low to high | Product Catalog | `@p2` `@inventory` | Sorting helps customers find products in budget, aiding conversion. | Logged in, viewing the catalog. | 1. Choose **Price (low to high)** from the sort menu. | Products displayed in ascending price order. | Verify the displayed prices match the same list sorted low-to-high. |
| TC-15 | Sort by price, high to low | Product Catalog | `@p2` `@inventory` | Same convenience for customers browsing premium items first. | Logged in, viewing the catalog. | 1. Choose **Price (high to low)** from the sort menu. | Products displayed in descending price order. | Verify the displayed prices match the same list sorted high-to-low. |
| TC-16 | Sort by name, Z to A | Product Catalog | `@p2` `@inventory` | Name sorting is a standard browsing aid. | Logged in, viewing the catalog. | 1. Choose **Name (Z to A)** from the sort menu. | Products displayed in reverse alphabetical order. | Verify the displayed names match the same list sorted in reverse alphabetical order. |
| TC-17 | "Continue Shopping" returns to catalog | Shopping Cart | `@p2` `@cart` | Smooth navigation back to browsing encourages larger baskets. | Logged in, viewing the cart. | 1. On the cart page, select **Continue Shopping**. | Customer returned to the product catalog. | Verify the URL is the inventory page. |
| TC-18 | Checkout requires buyer information | Checkout | `@p2` `@checkout` | Orders must not proceed without shipping details; prevents undeliverable orders. | Logged in with an item, at checkout info step. | 1. Leave buyer info fields blank. 2. Select **Continue**. | Checkout blocked with error **"First Name is required."** | Verify an error containing "First Name is required" is shown. |
| TC-27 ⚠️ | Login succeeds under injected latency | Performance resilience | `@p2` `@performance` | The store must remain usable on slow connections (`performance_glitch_user` adds latency). **Known flaky — see [Known issues](#known-issues).** | `performance_glitch_user` available. | 1. Log in as `performance_glitch_user`. 2. Wait for the catalog to load. | Customer reaches the catalog with all products; login completes within a generous budget (< 15s), guarding against a hang. | Verify the URL is the inventory page, the "Products" heading shows, all 6 products load, and login completed in under 15 seconds. |

---

## Known issues

| Test | Status | Reason & fix |
|------|--------|--------------|
| **TC-27 · Login under injected latency** | ⚠️ Flaky (intermittently fails) | `performance_glitch_user` deliberately delays the inventory page beyond the default 5-second `expect()` timeout, so the "Products" assertion sometimes times out before the (slow) page renders. It is left in the default run as honest, visible coverage rather than being hidden or removed. **Fix options:** raise the assertion timeout for this test to match the known latency (e.g. `expect(...).toHaveText('Products', { timeout: 15000 })`), or move this check to a separate non-blocking "optional" run so it never gates the main suite. |

**Current suite status on Chromium:** 26 of 27 passing; TC-27 is the single expected, documented failure above.
