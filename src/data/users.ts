/**
 * Central catalog of the demo accounts Sauce Demo ships with.
 * Every account uses the same password. Keeping them here means a spec never
 * hard-codes a credential and the intent of each user is documented in one place.
 */
export const PASSWORD = 'secret_sauce';

export interface TestUser {
  username: string;
  password: string;
  /** What makes this account interesting for testing. */
  description: string;
}

export const users = {
  /** Happy-path account with no injected quirks. */
  standard: {
    username: 'standard_user',
    password: PASSWORD,
    description: 'Normal account, full happy path works',
  },
  /** Login is rejected server-side for this account. */
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
    description: 'Login blocked with a lockout error',
  },
  /** UI is intentionally buggy (broken images, mis-wired buttons). */
  problem: {
    username: 'problem_user',
    password: PASSWORD,
    description: 'Renders a broken UI, useful for negative/visual checks',
  },
  /** Introduces artificial latency across the app. */
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    description: 'Adds latency, useful for slow-load resilience',
  },
} as const satisfies Record<string, TestUser>;
