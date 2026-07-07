import type { User } from 'better-auth';
import {
  APP_ROLES,
  DEFAULT_APP_ROLE,
  authRoles,
  type AppPermissionRequest,
  type AppRole,
} from '@/config/auth';

export {
  ADMIN_APP_ROLES,
  APP_ROLES,
  DEFAULT_APP_ROLE,
  accessControl,
  accessStatements,
  authRoles,
} from '@/config/auth';
export type { AppPermissionRequest, AppRole } from '@/config/auth';

export interface AppUserFields {
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

export type AppUser = User & AppUserFields;

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function getAppRolesForUser(
  user: AppUserFields | null | undefined,
): AppRole[] {
  const storedRole = user?.role?.trim() || DEFAULT_APP_ROLE;
  const roles = storedRole
    .split(',')
    .map((role) => role.trim())
    .filter(isAppRole);

  return roles.length ? roles : [DEFAULT_APP_ROLE];
}

export function isAppBannedUser(user: AppUserFields | null | undefined) {
  return Boolean(user?.banned) || getAppRolesForUser(user).includes('banned');
}

export function userHasAppPermission(
  user: AppUserFields | null | undefined,
  permissions: AppPermissionRequest,
) {
  if (!user || isAppBannedUser(user)) {
    return false;
  }

  return getAppRolesForUser(user).some((role) => {
    return authRoles[role].authorize(permissions).success;
  });
}
