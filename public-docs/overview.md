# Overview

VK is an Astro boilerplate for small full-stack applications on Cloudflare
Workers.

It gives you a deployable base with authentication, database access, email,
forms, validation, and tests already connected. It stays close to Astro,
Cloudflare, Drizzle, Better Auth, and Tailwind instead of adding a large custom
framework layer.

## Included

- Astro server app with strict TypeScript.
- Cloudflare Workers adapter.
- D1 database binding named `DB`.
- Drizzle schema and migrations.
- Better Auth using D1 through the Drizzle adapter.
- Register, login, logout, email verification, forgot password, and reset
  password flows.
- Middleware-authenticated `Astro.locals`.
- Protected dashboard route.
- API response helpers.
- Zod request parsing.
- Astro Actions example.
- Email providers for console, Cloudflare Email, Resend, Mailgun, and explicit
  Node SMTP usage.
- Auth email templates with `@backstro/email`.
- Tailwind CSS v4 and local Astro UI components.
- Lucide Astro icons.
- Vitest, happy-dom, oxlint, Prettier, and verification scripts.

## Not Included Yet

- Admin UI.
- RBAC.
- Uploads and storage adapters.
- Media processing.
- CLI installer.
- Production PostgreSQL or MySQL runtime support.

## Database Status

D1 is the only supported runtime database.

The project has proof tests for future Hyperdrive PostgreSQL and MySQL support.
Those targets are not enabled at runtime.

## Project Shape

```text
src/
  actions/       Astro Actions
  auth/          Better Auth setup and route rules
  components/    local Astro UI components
  db/            Drizzle schema, clients, and query seams
  email/         providers and auth email templates
  lib/http/      JSON and Zod parsing helpers
  pages/         Astro pages and API routes
  middleware.ts  auth locals and route protection
```
