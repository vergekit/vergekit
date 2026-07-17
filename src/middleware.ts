import { defineMiddleware } from 'astro:middleware';
import { createAuthFromEnv, resolveRouteAccess } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';
import * as schema from '@/config/schema';
import { authDatabaseProvider, db } from '@/db';
import { runtimeEnv } from '@/runtime';

export const onRequest = defineMiddleware(async (context, next) => {
  const auth = createAuthFromEnv({
    runtimeEnv,
    request: context.request,
    database: db,
    schema,
    authConfig,
    drizzle: {
      provider: authDatabaseProvider,
    },
  });
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;
  context.locals.isAuthenticated = Boolean(session);

  const requestURL = new URL(context.request.url);
  const routePath = `${requestURL.pathname}${requestURL.search}`;
  const access = resolveRouteAccess(authConfig, routePath, {
    isAuthenticated: context.locals.isAuthenticated,
    user: context.locals.user,
  });

  if (access.type === 'allow') {
    return next();
  }

  if (access.type === 'forbidden') {
    return new Response('Forbidden', { status: 403 });
  }

  return context.redirect(access.location);
});
