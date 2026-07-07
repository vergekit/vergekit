import { describe, expect, it } from 'vitest';
import { resolveRouteAccess } from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';

describe('resolveRouteAccess', () => {
  it('allows public paths without a session', () => {
    expect(resolveRouteAccess(authConfig, '/', false)).toEqual({
      type: 'allow',
    });
    expect(resolveRouteAccess(authConfig, '/about', false)).toEqual({
      type: 'allow',
    });
    expect(resolveRouteAccess(authConfig, '/api/auth/sign-in', false)).toEqual({
      type: 'allow',
    });
    expect(resolveRouteAccess(authConfig, '/api/health', false)).toEqual({
      type: 'allow',
    });
  });

  it('allows protected paths with a session', () => {
    expect(resolveRouteAccess(authConfig, '/dashboard', true)).toEqual({
      type: 'allow',
    });
  });

  it('blocks banned users from authenticated app routes', () => {
    expect(
      resolveRouteAccess(authConfig, '/dashboard', {
        isAuthenticated: true,
        user: { role: 'banned' },
      }),
    ).toEqual({ type: 'forbidden' });
  });

  it('requires admin app permission for admin routes', () => {
    expect(resolveRouteAccess(authConfig, '/admin', false)).toEqual({
      type: 'redirect',
      location: '/login?redirectTo=%2Fadmin',
    });

    expect(
      resolveRouteAccess(authConfig, '/admin/users', {
        isAuthenticated: true,
        user: { role: 'user' },
      }),
    ).toEqual({ type: 'forbidden' });

    expect(
      resolveRouteAccess(authConfig, '/admin/users', {
        isAuthenticated: true,
        user: { role: 'admin' },
      }),
    ).toEqual({ type: 'allow' });
  });

  it('redirects unauthenticated page requests to login', () => {
    expect(resolveRouteAccess(authConfig, '/dashboard', false)).toEqual({
      type: 'redirect',
      location: '/login?redirectTo=%2Fdashboard',
    });
    expect(
      resolveRouteAccess(authConfig, '/dashboard?tab=billing', false),
    ).toEqual({
      type: 'redirect',
      location: '/login?redirectTo=%2Fdashboard%3Ftab%3Dbilling',
    });
  });

  it('allows API routes without a session', () => {
    expect(resolveRouteAccess(authConfig, '/api/private', false)).toEqual({
      type: 'allow',
    });
  });
});
