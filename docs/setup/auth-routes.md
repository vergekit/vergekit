# Route Authentication

VK loads auth state for every request, but routes are public by default. The
middleware in `src/middleware.ts` reads the Better Auth session, writes
`Astro.locals.user`, `Astro.locals.session`, and
`Astro.locals.isAuthenticated`, then asks `src/auth/routes.ts` whether the
current URL requires a login redirect. Route policy values live in
`src/config/auth.ts`.

Use `src/config/auth.ts` for route rules that should be enforced consistently by
middleware. Use a route-local check when the rule is specific to one page or API
handler.

The boilerplate also ships with app roles powered by the Better Auth admin
plugin: `admin`, `moderator`, `user`, and `banned`. Admin URL routes are
reserved for users with the `app:administer` permission.

## Better Auth Plugins

The Better Auth admin plugin is installed and configured. Server-side Better
Auth plugins live in `createAuthServerPlugins()` in `src/config/auth.ts`; the
matching browser client plugins live in `createAuthClientPlugins()` in
`src/config/auth.ts`.

When adding or modifying a Better Auth plugin, check the full plugin surface:

- `src/config/auth.ts` for server and client plugin option composition, app
  roles, app permission values, access-control construction, auth email
  options, and browser auth fallback copy.
- `src/auth/server.ts` for providing server plugin factories, database hooks,
  and runtime config used by Better Auth.
- `src/auth/client.ts` for providing client plugin factories and initializing
  the Better Auth client.
- `src/auth/permissions.ts` for role normalization and permission helpers used
  by app code.
- `src/config/schema.ts` and `drizzle/d1/*` migrations for plugin-required
  tables or columns.
- `src/env.d.ts` when the plugin changes the session or user fields exposed on
  `Astro.locals`.
- `tests/auth/server-config.test.ts`, `tests/auth/auth-schema.test.ts`, and
  `tests/auth/permissions.test.ts` for plugin config, schema, and permission
  coverage.

## Middleware-Protected Routes

Add exact URLs to `protectedExactPaths` when one route needs authentication:

```ts
export const authRouteConfig = {
  protectedExactPaths: ['/dashboard', '/account'],
  protectedPrefixes: [],
  // ...
} as const;
```

Unauthenticated requests to those paths redirect to `/login` with the original
destination preserved:

```text
/login?redirectTo=%2Fdashboard
```

Add URL prefixes to `protectedPrefixes` when a group of routes shares the same
auth requirement:

```ts
export const authRouteConfig = {
  protectedExactPaths: ['/dashboard'],
  protectedPrefixes: ['/settings/', '/api/account/'],
  // ...
} as const;
```

Use slash-terminated prefixes when matching a route group. A prefix such as
`/settings/` protects `/settings/profile` without also matching unrelated paths
like `/settings-public`. If the group index route should also be protected, add
it as an exact path:

```ts
export const authRouteConfig = {
  protectedExactPaths: ['/dashboard', '/settings'],
  protectedPrefixes: ['/settings/'],
  // ...
} as const;
```

Astro filesystem route groups, such as `src/pages/(app)/dashboard.astro`, do not
appear in request URLs. Add the URL path that the group produces, such as
`/dashboard`, or a shared URL prefix used by the pages in that group.

## Admin Routes

`/admin` and `/admin/*` are protected separately from general authenticated
routes. Anonymous users are redirected to `/login`; authenticated users without
the `app:administer` permission receive a `403` response.

Change admin route policy in `src/config/auth.ts`:

```ts
export const authRouteConfig = {
  adminExactPaths: ['/admin'],
  adminPrefixes: ['/admin/'],
  adminPermission: { app: ['administer'] },
  // ...
} as const;
```

Change role permissions in `src/config/auth.ts`:

```ts
export const authRoleConfig = {
  roleAppPermissions: {
    admin: ['access', 'moderate', 'administer'],
    moderator: ['access', 'moderate'],
    user: ['access'],
    banned: [],
  },
  // ...
} as const;
```

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
import { jsonFailure, jsonSuccess } from '@vergekit/core/http';

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

Use `protectedPrefixes` for URL namespaces like `/settings/` or
`/api/account/`. Use the admin route policy for `/admin` and `/admin/*`.

Use route-local checks when the response should be custom, especially for API
routes that should return `401` JSON instead of redirecting to the login page.

Use `userHasAppPermission` for local role checks:

```ts
import { userHasAppPermission } from '@/auth/permissions';

if (!userHasAppPermission(locals.user, { app: ['moderate'] })) {
  return new Response('Forbidden', { status: 403 });
}
```

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
