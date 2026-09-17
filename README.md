# Sauce Demo — Playwright E2E Automation

End-to-end UI test automation for [Sauce Demo](https://www.saucedemo.com/), built with
**Playwright** and **TypeScript**. The suite covers the login flow plus the most
business-critical journeys of the app: browsing/sorting the catalog, managing the
cart, and completing a checkout.

---

## Why these tests

Sauce Demo is a storefront, so the tests target the flows that would cost real revenue
or block real users if they broke:

| Area | What's covered | Why it's critical |
|------|----------------|-------------------|
| **Login** | Happy path, locked-out user, wrong password, missing username/password, logout | The gate to the entire app; every other journey depends on it |
| **Inventory** | Add/remove items, cart badge count, button state toggle, sort by price & name | Where users spend most of their time and make selections |
| **Cart** | Items persist from inventory, remove from cart, continue shopping | Must faithfully carry selections across pages |
| **Checkout** | Full purchase end-to-end, total = subtotal + tax, buyer-info validation | The revenue path; a broken checkout means lost sales |

There are **18 tests**, each run across **Chromium, Firefox, and WebKit**.

---

## Tech & design choices

- **Playwright + TypeScript** — fast, reliable auto-waiting, first-class TS support, and
  cross-browser execution out of the box.
- **Page Object Model (POM)** — each page (`LoginPage`, `InventoryPage`, `CartPage`,
  `CheckoutPage`) encapsulates its locators and actions, so specs read like user stories
  and selectors live in exactly one place. A `BasePage` holds shared behaviour (navigation,
  logout).
- **Custom fixtures** (`src/fixtures/pages.ts`) inject ready-to-use page objects into every
  test, including a `loggedInInventoryPage` fixture that handles the login boilerplate so
  cart/checkout specs start from an authenticated state.
- **Centralized test data** (`src/data/`) — users and product names are defined once and
  referenced by intent, never hard-coded in specs.
- **`data-test` selectors** — the app exposes stable `data-test` attributes; using them
  keeps tests resilient to styling/DOM changes.
- **Meaningful assertions** — tests assert on outcomes users care about (URL, headings,
  cart counts, exact product names, order totals), not incidental implementation details.

### Project structure

```
saucedemo-playwright/
├── playwright.config.ts        # Browsers, baseURL, reporters, retries, artifacts
├── tsconfig.json               # Strict TypeScript config
├── src/
│   ├── data/                   # Test data (users, products)
│   ├── fixtures/               # Custom Playwright fixtures wiring page objects
│   └── pages/                  # Page Object Model classes
└── tests/                      # Spec files (login, inventory, cart, checkout)
```

---

## Setup

**Prerequisites:** [Node.js](https://nodejs.org/) 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

> The suite is configured to run on Chromium, Firefox, and WebKit. If you only
> want to try it quickly on one engine, `npx playwright install chromium` and
> `npm run test:chromium` is enough. All 18 tests were verified passing on
> Chromium.

---

## Running the tests

```bash
# Run the full suite (all browsers, headless)
npm test

# Run only Chromium (fastest for local iteration)
npm run test:chromium

# Watch the tests run in a browser window
npm run test:headed

# Open Playwright's interactive UI mode
npm run test:ui

# Step through a test with the inspector
npm run test:debug

# Type-check without running tests
npm run typecheck
```

### Viewing results

After a run, open the HTML report:

```bash
npm run report
```

Traces, screenshots, and video are captured automatically on failure (see
`playwright.config.ts`) to make debugging failures straightforward.

---

## To Do — what I'd add with more time

- **CI pipeline** — a GitHub Actions workflow to run the suite on every push/PR, sharded
  across browsers, publishing the HTML report as an artifact.
- **Authentication via stored state** — log in once and reuse `storageState` to skip the
  UI login in cart/checkout specs, cutting runtime.
- **API-level setup/teardown** — Sauce Demo has no public API, but on a real app I'd seed
  cart state via API and reserve the UI for what genuinely needs the browser.
- **Visual regression** — snapshot testing (and exercising `problem_user` / `visual_user`)
  to catch broken images and layout regressions.
- **Data-driven login tests** — parameterize the negative login cases from a table for
  tighter coverage with less duplication.
- **Accessibility checks** — integrate `@axe-core/playwright` to assert WCAG basics on key
  pages.
- **Performance assertions** — use `performance_glitch_user` to assert load budgets and
  guard against slow-load regressions.
- **Test tagging & sharding** — tag `@smoke` vs `@regression` so CI can run a fast smoke
  subset on every commit and the full suite nightly.

---

## AI usage

This project was built with the assistance of an AI coding agent. How it was used:

- **Test planning** — brainstormed which flows are most business-critical for an
  e-commerce app and which negative/edge cases matter most (locked-out user, missing
  fields, order-total math), then prioritized them into the coverage table above.
- **Scaffolding & boilerplate** — generated the initial project structure, Playwright
  config, and the repetitive parts of the page objects and fixtures, which I then reviewed
  and refined.
- **Design review** — used the AI as a sounding board on structure decisions (POM vs. flat
  helpers, fixture design, where to centralize test data).

Everything was reviewed for correctness: selectors were validated against the live app's
`data-test` attributes, and the suite was executed to confirm all tests pass before
delivery. No custom AI skills or agents were created for this task; the AI was used as a
pair-programming assistant.

> **Tip for reviewers:** every assertion targets a user-visible outcome, so the specs
> double as living documentation of how the app is expected to behave.
