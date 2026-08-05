# 0003. Minimal Runtime Dependencies

Date: 2026-08-05

Status: Accepted

## Context

The boilerplate needs enough shared tooling to provide a useful starting point.
Each additional runtime dependency also adds maintenance work and can constrain
the architecture of applications that start from the boilerplate.

Astro, Cloudflare, Better Auth, Drizzle, Tailwind, and Vitest already provide the
main application and development surfaces. React remains a server-side dependency
for React Email templates. The browser application does not require React or
another client framework.

## Decision

Prefer first-party packages from the technologies in the supported stack. Add a
helper package only when a supported integration requires it or when it removes
meaningful repeated code.

Do not add a browser UI framework or a dependency that changes the application
into a single-page application by default. Introduce such a dependency only for
a documented product requirement.

## Consequences

- New projects keep a small browser runtime and an Astro-first UI architecture.
- Maintainers must assess the maintenance and architecture costs of each new
  runtime dependency.
- Applications can add client frameworks when their requirements justify the
  added architecture.
