import { test, expect } from '../src/fixtures/pages.js';
import { users } from '../src/data/users.js';

/**
 * Slow-connection resilience using `performance_glitch_user`, which injects
 * artificial latency. The goal is not a precise benchmark (timings vary by
 * machine and network) but to prove the app still WORKS under latency and lands
 * the user where they expect, within a generous budget.
 *
 * KNOWN FLAKY: this test can fail intermittently. `performance_glitch_user`
 * delays the inventory page beyond the default 5s expect() timeout, so the
 * `toHaveText('Products')` assertion sometimes times out before the (slow) page
 * renders. It is kept in the default run as honest, visible coverage rather than
 * being hidden. See TEST_PLAN.md ("Known issues") for the fix options.
 */
test.describe('Performance resilience (performance_glitch_user)', () => {
  // Give this account extra head-room; the glitch user is deliberately slow.
  test.slow();

  test('login still succeeds under injected latency', {
    tag: ['@p2', '@regression', '@performance'],
  }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();

    const start = Date.now();
    await loginPage.loginAs(users.performanceGlitch);

    // The catalog must eventually render — functional correctness under load.
    await expect(page).toHaveURL(/.*\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);

    const elapsed = Date.now() - start;

    // Generous upper bound: the login must complete within 15s even when slow.
    // This guards against a hard hang/regression without being flaky on timing.
    expect(elapsed).toBeLessThan(15_000);
  });
});
