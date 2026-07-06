# Configuration Guide

Configuration is split by responsibility so project-specific edits stay small
and secrets stay out of the repo.

## What Goes Where

| Location | Use for | Examples |
| --- | --- | --- |
| `src/config/*.ts` | Source-level defaults, policies, and schema that app code imports. These are committed and typed. | App name, default authenticated path, protected routes, app roles, permission values, D1 table definitions. |
| `wrangler.jsonc` `vars` | Committed, non-secret Worker runtime values that can differ by deployed environment. | `EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `BETTER_AUTH_URL`, `MAILGUN_DOMAIN`. |
| `.dev.vars` | Local-only secrets and local-only overrides. Never commit this file. | `BETTER_AUTH_SECRET`, local `BETTER_AUTH_URL`, `RESEND_API_KEY`, `MAILGUN_API_KEY`, local email overrides. |
| Wrangler secrets | Deployed secret values managed by Cloudflare, not committed to git. | `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `MAILGUN_API_KEY`. |

This separation of concerns keeps editable source policy in `src/config`, runtime
environment selection in Wrangler config, and secret material outside committed
files.

## Source Config

Use `src/config` when changing values that the app code should import directly:

- `src/config/app.ts`: app identity and default navigation paths.
- `src/config/auth.ts`: middleware route policy, admin route policy, app roles,
  app permission values, and banned-session copy.
- `src/config/schema.ts`: Drizzle D1 table definitions shared by app code,
  Better Auth, and Drizzle Kit.

Email provider selection stays with `@vergekit/core/email`, and auth-email
fallback/render behavior stays with `src/auth/email.ts`. Do not put environment
secrets here. Do not add runtime database target selection here; database target
selection should wait until Hyperdrive adapters are implemented.

## Worker Runtime Config

Use `wrangler.jsonc` for non-secret values the Worker reads from `env`:

```jsonc
{
  "vars": {
    "EMAIL_PROVIDER": "console"
  }
}
```

Named Wrangler environments need their own `vars` block because Wrangler does
not inherit top-level vars into environments.

## Local And Deployed Secrets

Use `.dev.vars` for local development secrets:

```bash
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:4321
RESEND_API_KEY=your-local-resend-key
```

Use Wrangler secrets for deployed secrets:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAILGUN_API_KEY
```

Only configure provider-specific secrets for the email provider the environment
actually uses.
