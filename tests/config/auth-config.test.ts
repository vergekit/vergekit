import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createAuthServerPlugins,
  createAuthClientPlugins,
} from '@vergekit/core/auth';
import {
  authConfig,
} from '@/config/auth';
import {
  authEmailOptions,
  createAuthEmailSenderOptions,
  renderResetPasswordEmail,
  renderVerifyEmail,
} from '@/config/auth-email';

const projectRoot = new URL('../../', import.meta.url);

describe('auth config', () => {
  it('keeps middleware route policy as plain editable values', () => {
    expect(authConfig.routes).toMatchObject({
      authApiPrefix: '/api/auth',
      loginPath: '/login',
      protectedExactPaths: ['/dashboard'],
      protectedPrefixes: [],
      adminExactPaths: ['/admin'],
      adminPrefixes: ['/admin/'],
      adminPermission: { app: ['administer'] },
    });
    expect(authConfig.routes).not.toHaveProperty('signOutPath');
  });

  it('keeps app roles and app-level permissions as plain editable values', () => {
    expect(authConfig.roles.roles).toEqual([
      'admin',
      'moderator',
      'user',
      'banned',
    ]);
    expect(authConfig.roles.defaultRole).toBe('user');
    expect(authConfig.roles.adminRoles).toEqual(['admin']);
    expect(authConfig.roles.appStatements).toEqual([
      'access',
      'moderate',
      'administer',
    ]);
    expect(authConfig.roles.roleAppPermissions).toEqual({
      admin: ['access', 'moderate', 'administer'],
      moderator: ['access', 'moderate'],
      user: ['access'],
      banned: [],
    });
  });

  it('derives Better Auth plugin definitions from core auth helpers', () => {
    const serverPlugins = createAuthServerPlugins(authConfig);
    const clientPlugins = createAuthClientPlugins(authConfig);

    expect(serverPlugins.map((plugin) => plugin.id)).toContain('admin');
    expect(clientPlugins.map((plugin) => plugin.id)).toContain('admin-client');
  });

  it('keeps auth email behavior in auth-email config and browser fallback in auth config', () => {
    const emailSenderOptions = createAuthEmailSenderOptions({
      renderVerificationEmail: renderVerifyEmail,
      renderResetPasswordEmail,
    });

    expect(emailSenderOptions.fallbackFromName).toBe('VK');
    expect(emailSenderOptions.renderVerificationEmail).toBeTypeOf('function');
    expect(emailSenderOptions.renderResetPasswordEmail).toBeTypeOf('function');
    expect(authEmailOptions).toMatchObject({
      fallbackFromName: 'VK',
      renderVerificationEmail: expect.any(Function),
      renderResetPasswordEmail: expect.any(Function),
    });
    expect(authConfig.browser.defaultErrorMessage).toBe(
      "We couldn't complete that request. Check the fields and try again.",
    );
  });

  it('keeps foundational auth scaffolding out of the app src tree', () => {
    const source = readFileSync(
      new URL('src/config/auth.ts', projectRoot),
      'utf8',
    );

    expect(existsSync(new URL(['src', 'auth'].join('/'), projectRoot))).toBe(
      false,
    );
    expect(source).toContain("from '@vergekit/core/auth'");
    expect(source).not.toContain('react-email');
    expect(source).not.toContain('@/email/auth/');
    expect(source).not.toContain("import { admin as adminPlugin }");
    expect(source).not.toContain("import { adminClient }");
    expect(source).not.toContain(`from '@/${['auth', 'email'].join('/')}'`);
  });
});
