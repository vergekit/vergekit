import type { BetterAuthOptions } from 'better-auth';

export function extendAuthOptions(options: BetterAuthOptions): BetterAuthOptions {
  return {
    ...options,
    session: {
      ...options.session,
      // Remembered sessions last one year and renew with activity once per day.
      expiresIn: 60 * 60 * 24 * 365,
      updateAge: 60 * 60 * 24,
    },
  };
}
