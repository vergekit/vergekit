import { describe, expect, it, vi } from 'vitest';
import {
  buildAuthOptions,
  createAuth,
  createAuthFromEnv,
  resolveAuthBaseURL,
  resolveAuthSecret,
} from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';
import * as schema from '@/config/schema';
import type { AppDatabase } from '@/db';

vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
  },
}));

describe('Better Auth server config', () => {
  const database = {} as AppDatabase;

  it('enables email and password auth with explicit Workers-safe config inputs', () => {
    const options = buildAuthOptions({
      database,
      schema,
      authConfig,
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
    });

    expect(options.baseURL).toBe('https://vk.example.com');
    expect(options.secret).toBe('test-secret-with-at-least-32-characters');
    expect(options.emailAndPassword).toEqual({ enabled: true });
    expect(options.plugins?.map((plugin) => plugin.id)).toContain('admin');
  });

  it('creates a Better Auth handler and session API from the shared database seam', () => {
    const auth = createAuth({
      database,
      schema,
      authConfig,
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
    });

    expect(auth.handler).toBeTypeOf('function');
    expect(auth.api.getSession).toBeTypeOf('function');
  });

  it('uses the initialized app database when creating runtime auth', () => {
    const runtimeEnv = {
      get DB(): D1Database {
        throw new Error('createAuthFromEnv should not read runtimeEnv.DB');
      },
      BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters',
      BETTER_AUTH_URL: 'https://vk.example.com',
      EMAIL_PROVIDER: 'console',
    };

    const auth = createAuthFromEnv({
      runtimeEnv,
      request: new Request('https://vk.example.com/dashboard'),
      database,
      schema,
      authConfig,
    });

    expect(auth.handler).toBeTypeOf('function');
  });

  it('resolves auth base URL from an explicit binding or the current request', () => {
    expect(
      resolveAuthBaseURL(
        { BETTER_AUTH_URL: 'https://auth.example.com' },
        new Request('https://vk.example.com/dashboard'),
      ),
    ).toBe('https://auth.example.com');

    expect(
      resolveAuthBaseURL({}, new Request('https://vk.example.com/dashboard')),
    ).toBe('https://vk.example.com');
  });

  it('requires a Better Auth secret binding at runtime', () => {
    expect(resolveAuthSecret({ BETTER_AUTH_SECRET: 'configured-secret' })).toBe(
      'configured-secret',
    );
    expect(() => resolveAuthSecret({})).toThrow(
      'BETTER_AUTH_SECRET is required',
    );
  });

  it('blocks session creation for users assigned the banned app role', async () => {
    const options = buildAuthOptions({
      database,
      schema,
      authConfig,
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
    });
    const beforeSessionCreate = options.databaseHooks?.session?.create?.before;
    const findUserById = vi.fn(async () => ({
      id: 'user-1',
      name: 'Banned User',
      email: 'banned@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'banned',
      banned: false,
    }));

    expect(beforeSessionCreate).toBeTypeOf('function');
    await expect(
      beforeSessionCreate!(
        {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
          expiresAt: new Date(),
          token: 'session-token',
        },
        {
          context: {
            internalAdapter: {
              findUserById,
            },
          },
        } as unknown as Parameters<NonNullable<typeof beforeSessionCreate>>[1],
      ),
    ).rejects.toMatchObject({
      statusCode: 403,
      body: {
        code: 'BANNED_USER',
      },
    });
    expect(findUserById).toHaveBeenCalledWith('user-1');
  });
});
