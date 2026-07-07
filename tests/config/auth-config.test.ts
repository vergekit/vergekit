import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { adminClient } from 'better-auth/client/plugins';
import { admin as adminPlugin } from 'better-auth/plugins';
import {
  authBrowserConfig,
  authRoleConfig,
  authRouteConfig,
  createAuthClientPlugins,
  createAuthEmailSenderOptions,
  createAuthServerPlugins,
} from '@/config/auth';
import { renderResetPasswordEmail, renderVerifyEmail } from '@/auth/email';

const projectRoot = new URL('../../', import.meta.url);

describe('auth config', () => {
  it('keeps middleware route policy as plain editable values', () => {
    expect(authRouteConfig).toMatchObject({
      authApiPrefix: '/api/auth',
      loginPath: '/login',
      protectedExactPaths: ['/dashboard'],
      protectedPrefixes: [],
      adminExactPaths: ['/admin'],
      adminPrefixes: ['/admin/'],
      adminPermission: { app: ['administer'] },
    });
    expect(authRouteConfig).not.toHaveProperty('signOutPath');
  });

  it('keeps app roles and app-level permissions as plain editable values', () => {
    expect(authRoleConfig.roles).toEqual([
      'admin',
      'moderator',
      'user',
      'banned',
    ]);
    expect(authRoleConfig.defaultRole).toBe('user');
    expect(authRoleConfig.adminRoles).toEqual(['admin']);
    expect(authRoleConfig.appStatements).toEqual([
      'access',
      'moderate',
      'administer',
    ]);
    expect(authRoleConfig.roleAppPermissions).toEqual({
      admin: ['access', 'moderate', 'administer'],
      moderator: ['access', 'moderate'],
      user: ['access'],
      banned: [],
    });
  });

  it('keeps Better Auth plugin definitions in app auth config', () => {
    const serverPlugins = createAuthServerPlugins({ adminPlugin });
    const clientPlugins = createAuthClientPlugins({ adminClient });

    expect(serverPlugins.map((plugin) => plugin.id)).toContain('admin');
    expect(clientPlugins.map((plugin) => plugin.id)).toContain('admin-client');
  });

  it('keeps auth email and browser fallback behavior in app auth config', () => {
    const emailSenderOptions = createAuthEmailSenderOptions({
      renderVerificationEmail: renderVerifyEmail,
      renderResetPasswordEmail,
    });

    expect(emailSenderOptions.fallbackFromName).toBe('VK');
    expect(emailSenderOptions.renderVerificationEmail).toBeTypeOf('function');
    expect(emailSenderOptions.renderResetPasswordEmail).toBeTypeOf('function');
    expect(authBrowserConfig.defaultErrorMessage).toBe(
      "We couldn't complete that request. Check the fields and try again.",
    );
  });

  it('keeps server and email factories out of config module load', () => {
    const source = readFileSync(
      new URL('src/config/auth.ts', projectRoot),
      'utf8',
    );

    expect(source).not.toContain("import { admin as adminPlugin }");
    expect(source).not.toContain("import { adminClient }");
    expect(source).not.toContain("from '@/auth/email'");
  });
});
