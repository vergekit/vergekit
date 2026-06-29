export const authRouteConfig = {
  authApiPrefix: '/api/auth',
  loginPath: '/login',
  protectedExactPaths: ['/dashboard'],
  protectedPrefixes: [],
  adminExactPaths: ['/admin'],
  adminPrefixes: ['/admin/'],
  adminPermission: { app: ['administer'] },
} as const;

export const authRoleConfig = {
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
} as const;
