import { describe, expect, it } from 'vitest';
import { createAuth } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';
import { extendAuthOptions } from '@/config/auth-options';
import * as schema from '@/config/schema';
import type { AppDatabase } from '@/db';

describe('app session policy', () => {
  it('uses one-year sessions and cookies with daily renewal', async () => {
    const auth = createAuth({
      database: {} as AppDatabase,
      schema,
      authConfig,
      baseURL: 'https://vk.example.com',
      secret: 'test-secret-with-at-least-32-characters',
      extendOptions: extendAuthOptions,
    });
    const context = await auth.$context;

    expect(context.sessionConfig.expiresIn).toBe(31_536_000);
    expect(context.sessionConfig.updateAge).toBe(86_400);
    expect(context.authCookies.sessionToken.attributes.maxAge).toBe(31_536_000);
  });
});
