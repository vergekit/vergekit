# Route Authentication

VK initializes every request with anonymous auth locals, but routes are public
by default. The middleware in `src/middleware.ts` evaluates the current URL
against `authConfig` from `src/config/auth.ts` before it creates Better Auth or
loads a session.

Use `src/config/auth.ts` for route rules that should be enforced consistently by
middleware. Use a route-local check when the rule is specific to one page or API
handler. Public route-local checks must call `Astro.locals.loadAuthSession()`
before reading the authenticated user or session.

The boilerplate also ships with app roles powered by the Better Auth admin
plugin: `admin`, `moderator`, `user`, and `banned`. Admin URL routes are
reserved for users with the `app:administer` permission.

## Better Auth Boundary

App-owned auth policy lives in `src/config/auth.ts`:

```ts
import { defineAuthConfig } from '@vergekit/core/auth';

export const authConfig = defineAuthConfig({
  routes: {
    authApiPrefix: '/api/auth',
    loginPath: '/login',
    protectedExactPaths: ['/dashboard'],
    protectedPrefixes: [],
    adminExactPaths: ['/admin'],
    adminPrefixes: ['/admin/'],
    adminPermission: { app: ['administer'] },
  },
  roles: {
    roles: ['admin', 'moderator', 'user', 'banned'],
    defaultRole: 'user',
    adminRoles: ['admin'],
    appStatements: ['access', 'moderate', 'administer'],
    roleAppPermissions: {
      admin: ['access', 'moderate', 'administer'],
      moderator: ['access', 'moderate'],
      user: ['access'],
      banned: [],
    },
    bannedSessionError: {
      code: 'BANNED_USER',
      message: 'Your account has been suspended.',
    },
  },
  browser: {
    defaultErrorMessage:
      "We couldn't complete that request. Check the fields and try again.",
  },
});
```

Foundational runtime behavior lives in `@vergekit/core/auth`: Better Auth option
construction, admin plugin setup, route access evaluation, role helpers,
sign-out redirect handling, browser form helpers, and Better Auth URL/secret
resolution.

The app still owns the database, schema, and email renderers. `src/middleware.ts`
and `src/pages/api/auth/[...all].ts` pass those app-owned pieces into the core
helpers.

## Lazy Session Loading

Every request begins with these typed values:

- `Astro.locals.user = null`
- `Astro.locals.session = null`
- `Astro.locals.isAuthenticated = false`
- `Astro.locals.loadAuthSession()` as a request-scoped, memoized loader

Middleware then follows a path-first policy:

- `/api/auth/*` bypasses global session loading because the Better Auth handler
  owns those requests.
- Protected and admin routes without a candidate session cookie redirect to
  login without initializing Better Auth.
- Protected and admin routes with a candidate cookie call `getSession()` and
  enforce access from the validated result. Cookie presence never authorizes a
  request by itself.
- Public routes skip session loading, even when a cookie is present, unless the
  route is explicitly auth-aware or its handler calls `loadAuthSession()`.

The loader updates all three auth values and returns the validated session. Its
promise is memoized, so middleware and route code share at most one session
lookup per request.

The homepage is the default explicitly auth-aware public route because it
renders different controls for authenticated users. Keep this list small:

```ts
const authAwarePublicPaths = new Set(['/']);
```

Public pages that do not vary by user remain independent of auth state and are
better candidates for shared caching. Admin routes always request an
authoritative session lookup, which also keeps them independent of any optional
cookie cache added later.

## Adding Better Auth Plugins

Keep app-specific plugin policy in `src/config/auth.ts`, but register plugin
instances where Better Auth is created. For a server plugin, export an app-owned
plugin list:

```ts
import { organization } from 'better-auth/plugins';
import { defineAuthConfig, type AuthServerPlugin } from '@vergekit/core/auth';

export const authConfig = defineAuthConfig({
  // ...
});

export const authServerPlugins = [
  organization({
    allowUserToCreateOrganization: async (user) =>
      user.email.endsWith('@example.com'),
  }),
] satisfies AuthServerPlugin[];
```

Then pass that list to the auth API route:

```ts
import { authConfig, authServerPlugins } from '@/config/auth';

const authResponse = await createAuthFromEnv({
  // ...
  authConfig,
  additionalPlugins: authServerPlugins,
}).handler(authRequest);
```

If the plugin requires final Better Auth option changes that do not fit a plugin
factory, use the `extendOptions` escape hatch in the same `createAuthFromEnv`
call.

Plugins with client APIs also need their Better Auth client plugin wherever the
app creates a Better Auth client:

```ts
import { createAuthClient } from 'better-auth/client';
import type { BetterAuthClientPlugin } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClientPlugins } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';

const appAuthClientPlugins = [
  organizationClient(),
] satisfies BetterAuthClientPlugin[];

export const authClient = createAuthClient({
  plugins: createAuthClientPlugins(authConfig, appAuthClientPlugins),
});
```

For plugins such as Better Auth's organization plugin, also check the rest of
the integration surface:

- `src/config/schema.ts` and `migrations/*` for plugin-required migrations
  tables or columns.
- `src/env.d.ts` when the plugin changes the session or user fields exposed on
  `Astro.locals`.
- `src/config/auth-email.ts` if the plugin sends transactional auth email that
  should use app templates or sender defaults.
- `tests/auth/server-config.test.ts`, `tests/auth/auth-schema.test.ts`, and
  `tests/auth/permissions.test.ts` for plugin config, schema, and permission
  coverage.

## Middleware-Protected Routes

Add exact URLs to `authConfig.routes.protectedExactPaths` when one route needs
authentication:

```ts
export const authConfig = defineAuthConfig({
  routes: {
    protectedExactPaths: ['/dashboard', '/account'],
    protectedPrefixes: [],
    // ...
  },
  // ...
});
```

Unauthenticated requests to those paths redirect to `/login` with the original
destination preserved:

```text
/login?redirectTo=%2Fdashboard
```

Add URL prefixes to `authConfig.routes.protectedPrefixes` when a group of routes
shares the same auth requirement:

```ts
export const authConfig = defineAuthConfig({
  routes: {
    protectedExactPaths: ['/dashboard'],
    protectedPrefixes: ['/settings/', '/api/account/'],
    // ...
  },
  // ...
});
```

Use slash-terminated prefixes when matching a route group. A prefix such as
`/settings/` protects `/settings/profile` without also matching unrelated paths
like `/settings-public`. If the group index route should also be protected, add
it as an exact path.

Astro filesystem route groups, such as `src/pages/(app)/dashboard.astro`, do not
appear in request URLs. Add the URL path that the group produces, such as
`/dashboard`, or a shared URL prefix used by the pages in that group.

## Admin Routes

`/admin` and `/admin/*` are protected separately from general authenticated
routes. Anonymous users are redirected to `/login`; authenticated users without
the `app:administer` permission receive a `403` response.

Change admin route policy in `src/config/auth.ts`:

```ts
export const authConfig = defineAuthConfig({
  routes: {
    adminExactPaths: ['/admin'],
    adminPrefixes: ['/admin/'],
    adminPermission: { app: ['administer'] },
    // ...
  },
  // ...
});
```

Change role permissions in `src/config/auth.ts`:

```ts
export const authConfig = defineAuthConfig({
  roles: {
    roleAppPermissions: {
      admin: ['access', 'moderate', 'administer'],
      moderator: ['access', 'moderate'],
      user: ['access'],
      banned: [],
    },
    // ...
  },
  // ...
});
```

## Route-Local Checks

Per-route auth is useful when a route needs custom behavior, conditional access,
or a JSON `401` response instead of a middleware login redirect. All requests
receive anonymous defaults and the memoized loader; protected routes are already
hydrated, while public route-local checks must load auth explicitly.

For a page, redirect from the page frontmatter:

```astro
---
const destination = `${Astro.url.pathname}${Astro.url.search}`;

await Astro.locals.loadAuthSession();

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
  await locals.loadAuthSession();

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
Call `loadAuthSession()` before checking auth on a public route.

Use `userHasAppPermission` from `@vergekit/core/auth` for local role checks:

```ts
import { userHasAppPermission } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';

if (!userHasAppPermission(authConfig, locals.user, { app: ['moderate'] })) {
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

When adding route-local auth, test the route handler directly and provide a
`locals.loadAuthSession` test implementation that hydrates the expected auth
state.
