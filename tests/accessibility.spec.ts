import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../src/fixtures/pages.js';
import { users } from '../src/data/users.js';

/**
 * Accessibility (WCAG) smoke checks using axe-core.
 *
 * Rather than demanding zero violations (few real sites pass that on day one),
 * these tests GATE on the most severe issues — `serious` and `critical` — which
 * are the ones that actually block users of assistive technology. The full axe
 * report is attached to each test so lower-severity issues stay visible for
 * triage without failing the build.
 *
 * Note: automated scans catch a meaningful subset of WCAG issues; full
 * conformance still requires manual testing with assistive technologies.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const GATING_IMPACTS = new Set(['serious', 'critical']);

test.describe('Accessibility (axe-core WCAG scan)', () => {
  test('login page has no serious or critical accessibility violations', {
    tag: ['@p1', '@regression', '@accessibility'],
  }, async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    // Attach the full report for triage regardless of pass/fail.
    await testInfo.attach('axe-login.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const gating = results.violations.filter(
      (v) => v.impact && GATING_IMPACTS.has(v.impact),
    );
    expect(
      gating,
      `Serious/critical a11y violations: ${gating.map((v) => v.id).join(', ')}`,
    ).toEqual([]);
  });

  test('inventory page has no serious or critical accessibility violations', {
    tag: ['@p1', '@regression', '@accessibility'],
  }, async ({ loginPage, inventoryPage, page }, testInfo) => {
    await loginPage.goto();
    await loginPage.loginAs(users.standard);
    await expect(inventoryPage.title).toHaveText('Products');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    await testInfo.attach('axe-inventory.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const gating = results.violations.filter(
      (v) => v.impact && GATING_IMPACTS.has(v.impact),
    );
    expect(
      gating,
      `Serious/critical a11y violations: ${gating.map((v) => v.id).join(', ')}`,
    ).toEqual([]);
  });
});
