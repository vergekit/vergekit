import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
  createSignOutAuthRequest,
  createAuthFromEnv,
  resolveSignOutRedirectPath,
  shouldRedirectSignOutRequest,
} from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';
import { authEmailOptions } from '@/config/auth-email';
import * as schema from '@/config/schema';
import { db } from '@/db';

export const ALL: APIRoute = async ({ request }) => {
  const shouldRedirectSignOut = shouldRedirectSignOutRequest(
    authConfig,
    request,
  );
  const authRequest = createSignOutAuthRequest(authConfig, request);
  const authResponse = await createAuthFromEnv({
    runtimeEnv: env,
    request: authRequest,
    database: db,
    schema,
    authConfig,
    authEmailOptions,
  }).handler(authRequest);

  if (!authResponse.ok || !shouldRedirectSignOut) {
    return authResponse;
  }

  const headers = new Headers(authResponse.headers);
  headers.delete('content-length');
  headers.delete('content-type');
  headers.delete('set-cookie');

  for (const cookie of authResponse.headers.getSetCookie()) {
    headers.append('set-cookie', cookie);
  }

  headers.set('location', await resolveSignOutRedirectPath(request));

  return new Response(null, {
    status: 303,
    headers,
  });
};
