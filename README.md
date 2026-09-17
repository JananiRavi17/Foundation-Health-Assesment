# Sauce Demo — Playwright E2E Automation

End-to-end UI test automation for [Sauce Demo](https://www.saucedemo.com/), built with
**Playwright** and **TypeScript**. The suite covers the login flow plus the most
business-critical journeys of the app: browsing/sorting the catalog, managing the
cart, and completing a checkout.

> **Scope note:** The brief asks for the login flow plus at least three critical tests.
> I treated **login, cart, and checkout** as the core deliverable, then deliberately
> layered additional risk-based coverage (access control, broken-UI defects, accessibility,
> and performance) to show how I'd prioritize and structure a suite on a real project. The
> priority rationale is in [`TEST_PLAN.md`](./TEST_PLAN.md).

---

## Coverage summary

Sauce Demo is a storefront, so tests are prioritized by revenue and access risk. Full
case-by-case detail (steps, expected results, and assertions) lives in
[`TEST_PLAN.md`](./TEST_PLAN.md).

| Area | Tests | Priority | What's verified |
|------|-------|----------|-----------------|
| Login & access | 6 | P0 / P2 | Valid login, locked-out & wrong-password rejection, field validation, logout |
| Product catalog | 6 | P0 / P1 / P2 | Add/remove, cart badge, button state, sort by price & name |
| Cart | 3 | P0 / P2 | Items persist from catalog, remove in cart, continue shopping |
| Checkout | 3 | P0 / P2 | Full purchase, order total = subtotal + tax, buyer-info validation |
| Access control (security) | 4 | P1 | Protected pages refuse direct-URL access without login |
| Broken-UI / defects | 2 | P1 | Broken product images & broken checkout field caught via `problem_user` |
| Accessibility (WCAG) | 2 | P1 | axe scan of login & inventory, gated on serious/critical |
| Performance | 1 | P2 | Login under injected latency (known-flaky — see TEST_PLAN.md) |

**27 tests**, each run across **Chromium, Firefox, and WebKit**.

> **Suite status:** 26 of 27 pass reliably. One performance test
> (`performance.spec.ts`) is a **known intermittent failure** — the
> `performance_glitch_user` account delays the page past the default 5s
> assertion timeout. It's kept in the default run as honest, visible coverage;
> see the "Known issues" section in [`TEST_PLAN.md`](./TEST_PLAN.md) for the
> reason and fix options.

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
└── tests/                      # Spec files: login, inventory, cart, checkout,
                                #   security, visual, accessibility, performance
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
> `npm run test:chromium` is enough. 26 of 27 tests pass reliably on Chromium;
> the one known-flaky performance test is documented in the suite-status note
> above and in [`TEST_PLAN.md`](./TEST_PLAN.md).

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

### Running by tag

Every test is tagged so you can run a slice without maintaining separate files.
Tags cover **priority** (`@p0`/`@p1`/`@p2`), **suite** (`@smoke`/`@regression`),
**feature area** (`@login`/`@inventory`/`@cart`/`@checkout`), and
**quality checks** (`@security`/`@visual`/`@accessibility`/`@performance`).

```bash
# Fast pre-release smoke check (the 7 P0 must-pass cases)
npm run test:smoke

# Full regression (all tests)
npm run test:regression

# By priority
npm run test:p0        # critical: revenue/access blockers
npm run test:p1        # high: core shopping functionality
npm run test:p2        # medium: validation & convenience

# By feature area
npm run test:login
npm run test:checkout

# By quality check
npm run test:security
npm run test:visual
npm run test:accessibility
npm run test:performance

# Combine tags with Playwright's --grep directly:
npx playwright test --grep "@p0|@p1"          # P0 and P1
npx playwright test --grep-invert @p2         # everything except P2
npx playwright test --grep @checkout --project=chromium
```

| Tag | Meaning | Count |
|-----|---------|-------|
| `@smoke` | P0 must-pass set, run on every build | 7 |
| `@regression` | The full suite | 27 |
| `@p0` / `@p1` / `@p2` | Priority (critical / high / medium) | 7 / 9 / 11 |
| `@login` `@inventory` `@cart` `@checkout` | Core feature area | 6 / 6 / 3 / 3 |
| `@security` `@visual` `@accessibility` `@performance` | Quality / non-functional | 4 / 2 / 2 / 1 |

See [`TEST_PLAN.md`](./TEST_PLAN.md) for the full business-readable test plan
with priorities.

### Viewing results

After a run, open the HTML report:

```bash
npm run report
```

Traces, screenshots, and video are captured automatically on failure (see
`playwright.config.ts`) to make debugging failures straightforward.

---

## To Do — what I'd add with more time

The suite covers the critical journeys; these are the next steps I'd take to make it
production-grade, ordered by impact on reliability and maintainability:

- **CI pipeline** — wire the suite into GitHub Actions: `@smoke` on every push/PR for fast
  feedback, full `@regression` nightly and pre-release, sharded across browsers with the
  HTML report published as an artifact. This is the highest-value next step — automated
  coverage only pays off when it runs on every change.
- **Authentication via stored state** — log in once and reuse `storageState` so cart and
  checkout specs skip the UI login. Cuts runtime and removes login as a shared point of
  failure for unrelated tests.
- **Mobile web coverage** — add mobile-viewport projects (Playwright device descriptors
  such as iPhone and Pixel) to complement the desktop cross-browser runs already in place,
  verifying responsive layout and touch interactions on a storefront most customers reach
  from a phone.
- **Self-healing locators (next phase)** — an AI-assisted layer that, when a test fails on
  a changed selector, inspects the live DOM, proposes an updated locator, and surfaces the
  fix for review rather than editing silently. This targets selector drift — the biggest
  long-term maintenance cost in UI automation — and builds on the live-DOM probing I used
  to ground the current selectors.

---

## AI usage

I owned the test plan, the P0/P1/P2 priorities, and the Page Object Model design.
AI (Claude) assisted with the mechanical parts:

- **Configuration setup** — the Playwright config, `tsconfig`, and project scaffolding.
- **Authoring tests** — accelerating test implementation by generating page objects, spec
  skeletons, and boilerplate from the cases I designed, which I then reviewed and refined.
- **Documentation** — drafting and proofreading this README and the test plan, which I
  edited for accuracy and tone.

No custom AI skills or agents were created for this task.
