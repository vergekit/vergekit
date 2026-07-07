import { describe, expect, it } from 'vitest';
import {
  getAppRolesForUser,
  isAppBannedUser,
  userHasAppPermission,
} from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';

describe('app auth permissions', () => {
  it('ships the starter roles expected by the boilerplate', () => {
    expect(authConfig.roles.roles).toEqual([
      'admin',
      'moderator',
      'user',
      'banned',
    ]);
    expect(authConfig.roles.defaultRole).toBe('user');
    expect(authConfig.roles.adminRoles).toEqual(['admin']);
  });

  it('normalizes stored Better Auth role strings', () => {
    expect(getAppRolesForUser(authConfig, { role: 'admin,moderator' })).toEqual([
      'admin',
      'moderator',
    ]);
    expect(getAppRolesForUser(authConfig, { role: 'unknown' })).toEqual([
      'user',
    ]);
    expect(getAppRolesForUser(authConfig, {})).toEqual(['user']);
  });

  it('grants app permissions by role without giving moderators admin user powers', () => {
    expect(
      userHasAppPermission(authConfig, { role: 'admin' }, {
        app: ['administer'],
      }),
    ).toBe(true);
    expect(
      userHasAppPermission(authConfig, { role: 'moderator' }, {
        app: ['moderate'],
      }),
    ).toBe(true);
    expect(
      userHasAppPermission(authConfig, { role: 'moderator' }, {
        user: ['list'],
      }),
    ).toBe(false);
    expect(
      userHasAppPermission(authConfig, { role: 'user' }, { app: ['access'] }),
    ).toBe(true);
  });

  it('treats Better Auth bans and the banned role as no-access states', () => {
    expect(isAppBannedUser(authConfig, { role: 'banned' })).toBe(true);
    expect(isAppBannedUser(authConfig, { role: 'user', banned: true })).toBe(
      true,
    );
    expect(
      userHasAppPermission(authConfig, { role: 'banned' }, {
        app: ['access'],
      }),
    ).toBe(false);
    expect(
      userHasAppPermission(authConfig, { role: 'admin', banned: true }, {
        app: ['administer'],
      }),
    ).toBe(false);
  });
});
