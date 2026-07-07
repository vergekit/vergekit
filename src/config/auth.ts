import type { BetterAuthOptions } from 'better-auth';
import type { admin as createAdminPlugin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
} from 'better-auth/plugins/admin/access';
import type { adminClient as createAdminClient } from 'better-auth/client/plugins';
import type { CreateAuthEmailSenderFromEnvOptions } from '@vergekit/core/email';
import { appConfig } from '@/config/app';

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

export const APP_ROLES = authRoleConfig.roles;
export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_APP_ROLE = authRoleConfig.defaultRole satisfies AppRole;
export const ADMIN_APP_ROLES =
  authRoleConfig.adminRoles satisfies readonly AppRole[];

export const accessStatements = {
  ...defaultStatements,
  app: authRoleConfig.appStatements,
} as const;

export const accessControl = /* @__PURE__ */ createAccessControl(
  accessStatements,
);

const emptyAdminPermissions = {
  user: [],
  session: [],
} as const;

export const adminRole = /* @__PURE__ */ accessControl.newRole({
  ...adminAc.statements,
  app: authRoleConfig.roleAppPermissions.admin,
});

export const moderatorRole = /* @__PURE__ */ accessControl.newRole({
  ...emptyAdminPermissions,
  app: authRoleConfig.roleAppPermissions.moderator,
});

export const userRole = /* @__PURE__ */ accessControl.newRole({
  ...emptyAdminPermissions,
  app: authRoleConfig.roleAppPermissions.user,
});

export const bannedRole = /* @__PURE__ */ accessControl.newRole({
  ...emptyAdminPermissions,
  app: authRoleConfig.roleAppPermissions.banned,
});

export const authRoles = {
  admin: adminRole,
  moderator: moderatorRole,
  user: userRole,
  banned: bannedRole,
} as const;

export type AppPermissionRequest = Parameters<typeof adminRole.authorize>[0];

export interface CreateAuthServerPluginsOptions {
  adminPlugin: typeof createAdminPlugin;
}

export function createAuthServerPlugins({
  adminPlugin,
}: CreateAuthServerPluginsOptions): NonNullable<
  BetterAuthOptions['plugins']
> {
  return [
    adminPlugin({
      defaultRole: DEFAULT_APP_ROLE,
      adminRoles: [...ADMIN_APP_ROLES],
      ac: accessControl,
      roles: authRoles,
    }),
  ];
}

export interface CreateAuthClientPluginsOptions {
  adminClient: typeof createAdminClient;
}

export function createAuthClientPlugins({
  adminClient,
}: CreateAuthClientPluginsOptions) {
  return [
    adminClient({
      ac: accessControl,
      roles: authRoles,
    }),
  ];
}

export const authBrowserConfig = {
  defaultErrorMessage:
    "We couldn't complete that request. Check the fields and try again.",
} as const;

export function createAuthEmailSenderOptions({
  renderVerificationEmail,
  renderResetPasswordEmail,
}: Pick<
  CreateAuthEmailSenderFromEnvOptions,
  'renderVerificationEmail' | 'renderResetPasswordEmail'
>): Pick<
  CreateAuthEmailSenderFromEnvOptions,
  'fallbackFromName' | 'renderVerificationEmail' | 'renderResetPasswordEmail'
> {
  return {
    fallbackFromName: appConfig.name,
    renderVerificationEmail,
    renderResetPasswordEmail,
  };
}
