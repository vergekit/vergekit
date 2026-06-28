# Route Authentication

VK loads auth state for every request, but routes are public by default. The
middleware in `src/middleware.ts` reads the Better Auth session, writes
`Astro.locals.user`, `Astro.locals.session`, and
`Astro.locals.isAuthenticated`, then asks `src/auth/routes.ts` whether the
current URL requires a login redirect.

Use `src/auth/routes.ts` for route rules that should be enforced consistently by
middleware. Use a route-local check when the rule is specific to one page or API
handler.

## Middleware-Protected Routes

Add exact URLs to `protectedExactPaths` when one route needs authentication:

```ts
const protectedExactPaths = new Set(['/dashboard', '/account']);
```

Unauthenticated requests to those paths redirect to `/login` with the original
destination preserved:

```text
/login?redirectTo=%2Fdashboard
```

Add URL prefixes to `protectedPrefixes` when a group of routes shares the same
auth requirement:

```ts
const protectedPrefixes: string[] = [
  '/settings/',
  '/admin/',
  '/api/account/',
];
```

Use slash-terminated prefixes when matching a route group. A prefix such as
`/settings/` protects `/settings/profile` without also matching unrelated paths
like `/settings-public`. If the group index route should also be protected, add
it as an exact path:

```ts
const protectedExactPaths = new Set(['/dashboard', '/settings']);

const protectedPrefixes: string[] = ['/settings/'];
```

Astro filesystem route groups, such as `src/pages/(app)/dashboard.astro`, do not
appear in request URLs. Add the URL path that the group produces, such as
`/dashboard`, or a shared URL prefix used by the pages in that group.

## Route-Local Checks

Per-route auth is useful when a route needs custom behavior, conditional access,
or a JSON `401` response instead of a middleware login redirect. Middleware still
populates `locals`, so the route can decide for itself.

For a page, redirect from the page frontmatter:

```astro
---
const destination = `${Astro.url.pathname}${Astro.url.search}`;

if (!Astro.locals.isAuthenticated) {
  return Astro.redirect(
    `/login?redirectTo=${encodeURIComponent(destination)}`,
  );
}
---
```

For an API route, return an API-shaped response:

```ts
import type { APIRoute } from 'astro';
import { jsonFailure, jsonSuccess } from '@/lib/http/json';

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.isAuthenticated) {
    return jsonFailure('Unauthorized', { status: 401 });
  }

  return jsonSuccess({ ok: true });
};
```

This is the right shape for one-off tools and diagnostics, including routes that
allow either an authenticated session or a route-specific secret. Keep that logic
inside the route when it should not apply globally.

## Choosing A Pattern

Use `protectedExactPaths` for single pages like `/dashboard`.

Use `protectedPrefixes` for URL namespaces like `/settings/`, `/admin/`, or
`/api/account/`.

Use route-local checks when the response should be custom, especially for API
routes that should return `401` JSON instead of redirecting to the login page.

Keep Better Auth endpoints under `/api/auth` public. Sign in, sign up, session,
callback, verification, reset, and sign-out requests must be able to reach Better
Auth before a user has an authenticated session.

## Tests

When changing middleware-protected route policy, update the route-policy tests:

```bash
npm run test -- tests/auth tests/middleware
```

When adding route-local auth, test the route handler directly and pass the
expected `locals.isAuthenticated` value in the route context.
