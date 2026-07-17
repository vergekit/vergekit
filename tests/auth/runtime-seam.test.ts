import { describe, expect, it, vi } from 'vitest';

const { createAuthFromEnvMock, resolveRouteAccessMock } = vi.hoisted(() => ({
  createAuthFromEnvMock: vi.fn(() => ({
    api: {
      getSession: vi.fn(async () => null),
    },
    handler: vi.fn(async () => new Response('auth response')),
  })),
  resolveRouteAccessMock: vi.fn(() => ({ type: 'allow' as const })),
}));

vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
    BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters',
  },
}));

vi.mock('@vergekit/core/auth', async () => {
  const actual = await vi.importActual<typeof import('@vergekit/core/auth')>(
    '@vergekit/core/auth',
  );

  return {
    ...actual,
    createAuthFromEnv: createAuthFromEnvMock,
    resolveRouteAccess: resolveRouteAccessMock,
  };
});

import { ALL } from '@/pages/api/auth/[...all]';
import { onRequest } from '@/middleware';
import { runtimeEnv } from '@/runtime';

describe('shared auth runtime seam', () => {
  it('passes the runtime environment and database provider from middleware', async () => {
    const request = new Request('https://vk.example.com/dashboard');
    const context = {
      request,
      locals: {
        user: null,
        session: null,
        isAuthenticated: false,
      },
      redirect: vi.fn(),
    } as unknown as Parameters<typeof onRequest>[0];
    const next = vi.fn(async () => new Response('next'));

    await onRequest(context, next);

    expect(createAuthFromEnvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimeEnv,
        request,
        drizzle: {
          provider: 'sqlite',
        },
      }),
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it('passes the runtime environment and database provider from the auth endpoint', async () => {
    createAuthFromEnvMock.mockClear();
    const request = new Request('https://vk.example.com/api/auth/session');

    await ALL({ request } as Parameters<typeof ALL>[0]);

    expect(createAuthFromEnvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimeEnv,
        request,
        drizzle: {
          provider: 'sqlite',
        },
      }),
    );
  });
});
