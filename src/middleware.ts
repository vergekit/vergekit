import { extendAuthOptions } from '@/config/auth-options';
import { defineMiddleware } from 'astro:middleware';
import {
  createAuthFromEnv,
  isAdminRoute,
  isAuthApiRoute,
  isProtectedRoute,
  resolveRouteAccess,
} from '@vergekit/core/auth';
import { getSessionCookie } from 'better-auth/cookies';
import { authConfig } from '@/config/auth';
import * as schema from '@/config/schema';
import { authDatabaseProvider, db } from '@/db';
import { runtimeEnv } from '@/runtime';

const authAwarePublicPaths = new Set(['/']);

export const onRequest = defineMiddleware(async (context, next) => {
  const requestURL = new URL(context.request.url);
  const routePath = `${requestURL.pathname}${requestURL.search}`;
  const isAdminPath = isAdminRoute(authConfig, routePath);
  const isProtectedPath =
    isAdminPath || isProtectedRoute(authConfig, routePath);

  context.locals.user = null;
  context.locals.session = null;
  context.locals.isAuthenticated = false;

  let sessionHeaders: Headers | undefined;
  async function withSessionCookies(response: Response | Promise<Response>) {
    const result = await response;
    // Server-side session refreshes must also renew the browser's cookie.
    for (const cookie of sessionHeaders?.getSetCookie() ?? []) {
      result.headers.append('set-cookie', cookie);
    }
    return result;
  }

  let sessionPromise: ReturnType<App.Locals['loadAuthSession']> | undefined;
  context.locals.loadAuthSession = () => {
    sessionPromise ??= (async () => {
      const auth = createAuthFromEnv({
        runtimeEnv,
        request: context.request,
        database: db,
        schema,
        authConfig,
        extendOptions: extendAuthOptions,
        drizzle: {
          provider: authDatabaseProvider,
        },
      });
      const { response: session, headers } = await auth.api.getSession({
        headers: context.request.headers,
        query: isAdminPath ? { disableCookieCache: true } : undefined,
        returnHeaders: true,
      });
      sessionHeaders = headers;

      context.locals.user = session?.user ?? null;
      context.locals.session = session?.session ?? null;
      context.locals.isAuthenticated = Boolean(session);

      return session;
    })();

    return sessionPromise;
  };

  if (isAuthApiRoute(authConfig, routePath)) {
    return withSessionCookies(next());
  }

  // Cookie presence is only a cheap gate; protected routes validate below.
  const hasCandidateSession = getSessionCookie(context.request) !== null;

  if (!hasCandidateSession && !isProtectedPath) {
    return withSessionCookies(next());
  }

  if (
    hasCandidateSession &&
    !isProtectedPath &&
    !authAwarePublicPaths.has(requestURL.pathname)
  ) {
    return withSessionCookies(next());
  }

  if (hasCandidateSession) {
    await context.locals.loadAuthSession();
  }

  const access = resolveRouteAccess(authConfig, routePath, {
    isAuthenticated: context.locals.isAuthenticated,
    user: context.locals.user,
  });

  if (access.type === 'allow') {
    return withSessionCookies(next());
  }

  if (access.type === 'forbidden') {
    return withSessionCookies(new Response('Forbidden', { status: 403 }));
  }

  return withSessionCookies(context.redirect(access.location));
});
