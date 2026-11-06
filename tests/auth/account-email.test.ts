import { describe, expect, it, vi } from 'vitest';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { createAuth } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';
import { extendAuthOptions } from '@/config/auth-options';
import * as schema from '@/config/schema';

describe('shared account email policy', () => {
  it('changes an authenticated user’s address through the installed core handler without mail or a password prompt', async () => {
    const sendVerificationEmail = vi.fn();
    const baseURL = 'https://vk.example.com';
    const auth = createAuth({
      database: {}, schema, authConfig, baseURL,
      secret: 'test-secret-with-at-least-32-characters',
      extendOptions: options => extendAuthOptions({
        ...options,
        advanced: { disableOriginCheck: false },
        database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
        emailVerification: { ...options.emailVerification, sendVerificationEmail },
      }),
    });
    const password = 'test-password-123';
    const signup = await auth.api.signUpEmail({ body: { name: 'Example', email: 'old@example.com', password } });
    const context = await auth.$context;
    await context.internalAdapter.updateUser(signup.user.id, { emailVerified: true });
    const login = await auth.api.signInEmail({ body: { email: 'old@example.com', password }, returnHeaders: true });
    const cookie = login.headers.getSetCookie().find(value => value.includes('.session_token='))!.split(';')[0];
    sendVerificationEmail.mockClear();
    const response = await auth.handler(new Request(`${baseURL}/api/auth/change-email-direct`, {
      method: 'POST', headers: { cookie, origin: baseURL, 'content-type': 'application/json' },
      body: JSON.stringify({ newEmail: ' NEW@example.com ' }),
    }));
    expect(response.status).toBe(200);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect((await auth.api.getSession({ headers: new Headers({ cookie }) }))?.user.email).toBe('new@example.com');
    await expect(auth.api.signInEmail({ body: { email: 'new@example.com', password } })).resolves.toHaveProperty('token');
    expect(authConfig.routes.protectedExactPaths).toContain('/account');
  });
});
