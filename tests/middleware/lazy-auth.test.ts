import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createAuthFromEnvMock, getSessionMock, runtimeEnvFixture } = vi.hoisted(() => {
  const getSession = vi.fn(async (): Promise<unknown> => null);

  return {
    getSessionMock: getSession,
    createAuthFromEnvMock: vi.fn(() => ({
      api: { getSession },
    })),
    runtimeEnvFixture: {
      BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters',
      BETTER_AUTH_URL: 'https://vk.example.com',
    },
  };
});

vi.mock('@/db', () => ({
  authDatabaseProvider: 'sqlite',
  db: {},
}));

vi.mock('@/runtime', () => ({
  runtimeEnv: runtimeEnvFixture,
}));

vi.mock('@vergekit/core/auth', async () => {
  const actual = await vi.importActual<typeof import('@vergekit/core/auth')>(
    '@vergekit/core/auth',
  );

  return {
    ...actual,
    createAuthFromEnv: createAuthFromEnvMock,
  };
});

import { onRequest } from '@/middleware';

const validSession = {
  user: {
    id: 'user-1',
    name: 'Example User',
    email: 'user@example.com',
    emailVerified: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    role: 'user',
  },
  session: {
    id: 'session-1',
    userId: 'user-1',
    token: 'session-token',
    expiresAt: new Date('2027-01-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ipAddress: null,
    userAgent: null,
  },
};

function createRequestContext(path: string, withSessionCookie = false) {
  const request = new Request(`https://vk.example.com${path}`, {
    headers: withSessionCookie
      ? { cookie: 'better-auth.session_token=candidate' }
      : undefined,
  });
  const locals = {} as App.Locals;
  const redirect = vi.fn(
    (location: string) =>
      new Response(null, {
        status: 302,
        headers: { location },
      }),
  );
  const next = vi.fn(async () => new Response('next'));
  const context = {
    request,
    locals,
    redirect,
  } as unknown as Parameters<typeof onRequest>[0];

  return { context, locals, next, redirect };
}

describe('lazy auth middleware', () => {
  beforeEach(() => {
    createAuthFromEnvMock.mockClear();
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue(null);
  });

  it('keeps anonymous public requests entirely outside Better Auth', async () => {
    const { context, locals, next } = createRequestContext('/about');

    await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect(createAuthFromEnvMock).not.toHaveBeenCalled();
    expect(getSessionMock).not.toHaveBeenCalled();
    expect(locals).toMatchObject({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  });

  it('lets the Better Auth handler own auth API requests', async () => {
    const { context, next } = createRequestContext(
      '/api/auth/get-session',
      true,
    );

    await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect(createAuthFromEnvMock).not.toHaveBeenCalled();
    expect(getSessionMock).not.toHaveBeenCalled();
  });

  it('redirects protected requests without a cookie before initializing auth', async () => {
    const { context, next, redirect } = createRequestContext(
      '/dashboard?tab=billing',
    );

    await onRequest(context, next);

    expect(next).not.toHaveBeenCalled();
    expect(createAuthFromEnvMock).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/login?redirectTo=%2Fdashboard%3Ftab%3Dbilling',
    );
  });

  it('ignores session cookies on public routes that do not need auth state', async () => {
    const { context, locals, next } = createRequestContext('/about', true);

    await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect(createAuthFromEnvMock).not.toHaveBeenCalled();
    expect(locals.isAuthenticated).toBe(false);
  });

  it('never treats cookie presence as authenticated access', async () => {
    const { context, next, redirect } = createRequestContext(
      '/dashboard',
      true,
    );

    await onRequest(context, next);

    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/login?redirectTo=%2Fdashboard',
    );
  });

  it('validates protected routes and memoizes the result for route code', async () => {
    getSessionMock.mockResolvedValue(validSession);
    const { context, locals, next } = createRequestContext('/dashboard', true);

    await onRequest(context, next);
    const routeSession = await locals.loadAuthSession();

    expect(next).toHaveBeenCalledOnce();
    expect(createAuthFromEnvMock).toHaveBeenCalledOnce();
    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(routeSession).toBe(validSession);
    expect(locals).toMatchObject({
      user: validSession.user,
      session: validSession.session,
      isAuthenticated: true,
    });
  });

  it('hydrates only explicitly auth-aware public pages', async () => {
    getSessionMock.mockResolvedValue(validSession);
    const { context, locals, next } = createRequestContext('/', true);

    await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(locals.isAuthenticated).toBe(true);
  });

  it('forces authoritative session checks for admin routes', async () => {
    getSessionMock.mockResolvedValue(validSession);
    const { context, next } = createRequestContext('/admin', true);

    const response = await onRequest(context, next);

    expect(response).toBeInstanceOf(Response);
    if (!(response instanceof Response)) {
      throw new TypeError('Expected middleware to return a response');
    }

    expect(response.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
    expect(getSessionMock).toHaveBeenCalledWith({
      headers: context.request.headers,
      query: { disableCookieCache: true },
    });
  });
});
