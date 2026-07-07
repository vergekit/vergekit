import {
  defineAuthConfig,
  type AuthPermissionRequest,
  type AuthRole,
} from '@vergekit/core/auth';

export const authConfig = defineAuthConfig({
  routes: {
    authApiPrefix: '/api/auth',
    loginPath: '/login',
    protectedExactPaths: ['/dashboard'],
    protectedPrefixes: [],
    adminExactPaths: ['/admin'],
    adminPrefixes: ['/admin/'],
    adminPermission: { app: ['administer'] },
  },
  roles: {
    roles: ['admin', 'moderator', 'user', 'banned'],
    defaultRole: 'user',
    adminRoles: ['admin'],
    appStatements: ['access', 'moderate', 'administer'],
    roleAppPermissions: {
      admin: ['access', 'moderate', 'administer'],
      moderator: ['access', 'moderate'],
      user: ['access'],
      banned: [],
    },
    bannedSessionError: {
      code: 'BANNED_USER',
      message:
        'Your account has been suspended. Please contact support if you believe this is an error.',
    },
  },
  browser: {
    defaultErrorMessage:
      "We couldn't complete that request. Check the fields and try again.",
  },
});

export type AppRole = AuthRole<typeof authConfig>;
export type AppPermissionRequest = AuthPermissionRequest<typeof authConfig>;
