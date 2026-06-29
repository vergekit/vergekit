import { describe, expect, it } from 'vitest';
import { authRoleConfig, authRouteConfig } from '@/config/auth';

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
});
