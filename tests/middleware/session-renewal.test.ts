import { afterEach, describe, expect, it, vi } from 'vitest';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { extendAuthOptions } from '@/config/auth-options';

const { createAuthFromEnvMock } = vi.hoisted(() => ({
  createAuthFromEnvMock: vi.fn(),
}));

vi.mock('@/db', () => ({
  authDatabaseProvider: 'sqlite',
  db: {},
}));
vi.mock('@/runtime', () => ({ runtimeEnv: {} }));
vi.mock('@vergekit/core/auth', async () => ({
  ...await vi.importActual<typeof import('@vergekit/core/auth')>('@vergekit/core/auth'),
  createAuthFromEnv: createAuthFromEnvMock,
}));

import { onRequest } from '@/middleware';

describe('session renewal through page requests', () => {
  afterEach(() => vi.useRealTimers());

  it('remembers email sign-ins when rememberMe is selected', async () => {
    const auth = betterAuth(extendAuthOptions({
      database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
      emailAndPassword: { enabled: true },
    }));
    const credentials = { email: 'user@example.com', password: 'test-password-123' };
    await auth.api.signUpEmail({ body: { ...credentials, name: 'Example User' } });

    const login = await auth.api.signInEmail({ body: { ...credentials, rememberMe: true }, returnHeaders: true });

    const cookie = login.headers.getSetCookie().find(value => value.includes('.session_token='));
    expect(cookie).toContain('Max-Age=31536000');
    expect(cookie).toContain('HttpOnly');
  });

  it('keeps an existing seven-day login alive past its original cookie expiry', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
    const database = memoryAdapter({ user: [], session: [], account: [], verification: [] });
    const options = {
      database,
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
      emailAndPassword: { enabled: true },
    };
    const oldAuth = betterAuth(options);
    const login = await oldAuth.api.signUpEmail({
      body: { email: 'user@example.com', name: 'Example User', password: 'test-password-123' },
      returnHeaders: true,
    });
    const originalCookie = login.headers.getSetCookie().find(cookie => cookie.includes('.session_token='));
    expect(originalCookie).toContain('Max-Age=604800');
    let cookie = originalCookie!.split(';')[0];
    let cookieExpiresAt = Date.now() + 604800 * 1000;
    createAuthFromEnvMock.mockReturnValue(betterAuth(extendAuthOptions(options)));

    async function visit() {
      const request = new Request('https://vk.example.com/dashboard', {
        headers: Date.now() < cookieExpiresAt ? { cookie } : {},
      });
      const context = {
        request,
        locals: {},
        redirect: (location: string) => new Response(null, { status: 302, headers: { location } }),
        rewrite: async () => new Response('forbidden', { status: 403 }),
      } as unknown as Parameters<typeof onRequest>[0];
      const response = await onRequest(context, async () => new Response('dashboard'));
      if (!(response instanceof Response)) throw new Error('Expected a page response');
      const renewed = response.headers.getSetCookie().find(value => value.includes('.session_token='));
      if (renewed) {
        cookie = renewed.split(';')[0];
        const maxAge = /Max-Age=(\d+)/i.exec(renewed);
        if (maxAge) cookieExpiresAt = Date.now() + Number(maxAge[1]) * 1000;
      }
      return response;
    }

    vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
    expect((await visit()).status).toBe(200);
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'));
    expect((await visit()).status).toBe(200);
    expect(cookieExpiresAt).toBeGreaterThan(new Date('2027-10-19T12:00:00Z').valueOf());
  });
});
