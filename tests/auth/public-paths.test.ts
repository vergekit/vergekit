import { describe, expect, it } from 'vitest';
import {
  createSignOutAuthRequest,
  getAuthApiPrefix,
  getLoginRedirectPath,
  getLoginPath,
  getSignOutPath,
  isAuthApiRoute,
  isProtectedRoute,
  resolveSignOutRedirectPath,
  shouldRedirectSignOutRequest,
} from '@vergekit/core/auth';
import { authConfig } from '@/config/auth';

describe('auth protected route policy', () => {
  it('keeps the Better Auth API route surface public', () => {
    expect(getAuthApiPrefix(authConfig)).toBe('/api/auth');
    expect(isAuthApiRoute(authConfig, '/api/auth')).toBe(true);
    expect(isAuthApiRoute(authConfig, '/api/auth/sign-in')).toBe(true);
    expect(isAuthApiRoute(authConfig, '/api/auth/session')).toBe(true);
    expect(
      isAuthApiRoute(authConfig, '/api/auth/callback/google?code=abc'),
    ).toBe(true);
  });

  it('treats pages as public by default', () => {
    expect(isProtectedRoute(authConfig, '/')).toBe(false);
    expect(isProtectedRoute(authConfig, '/about')).toBe(false);
    expect(isProtectedRoute(authConfig, '/_astro/client.js')).toBe(false);
    expect(isProtectedRoute(authConfig, '/favicon.svg')).toBe(false);
    expect(isProtectedRoute(authConfig, '/login')).toBe(false);
    expect(isProtectedRoute(authConfig, '/register')).toBe(false);
    expect(isProtectedRoute(authConfig, '/auth/forgot-password')).toBe(false);
    expect(
      isProtectedRoute(authConfig, '/login?redirectTo=%2Fdashboard'),
    ).toBe(false);
  });

  it('requires auth for explicitly protected pages', () => {
    expect(isProtectedRoute(authConfig, '/dashboard')).toBe(true);
    expect(isProtectedRoute(authConfig, '/settings/profile')).toBe(false);
  });

  it('treats API routes as public by default', () => {
    expect(isProtectedRoute(authConfig, '/api/auth/sign-in')).toBe(false);
    expect(isProtectedRoute(authConfig, '/api/health')).toBe(false);
    expect(isProtectedRoute(authConfig, '/api/debug/email')).toBe(false);
    expect(isProtectedRoute(authConfig, '/api/private')).toBe(false);
  });

  it('builds a login redirect with the original destination preserved', () => {
    expect(getLoginPath(authConfig)).toBe('/login');
    expect(
      getLoginRedirectPath(authConfig, '/dashboard?tab=billing'),
    ).toBe(
      '/login?redirectTo=%2Fdashboard%3Ftab%3Dbilling',
    );
  });

  it('redirects native sign-out form posts while preserving JSON API behavior', () => {
    expect(getSignOutPath(authConfig)).toBe('/api/auth/sign-out');
    expect(
      shouldRedirectSignOutRequest(
        authConfig,
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: { accept: 'text/html' },
        }),
      ),
    ).toBe(true);
    expect(
      shouldRedirectSignOutRequest(
        authConfig,
        new Request('http://127.0.0.1:4321/api/auth/sign-out', {
          method: 'POST',
          headers: { accept: 'application/json' },
        }),
      ),
    ).toBe(false);
  });

  it('strips form content before forwarding native sign-out posts to Better Auth', () => {
    const request = new Request('http://localhost:4321/api/auth/sign-out', {
      method: 'POST',
      headers: {
        accept: 'text/html',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'http://localhost:4321',
      },
      body: new URLSearchParams({ redirectTo: '/' }),
    });

    const authRequest = createSignOutAuthRequest(authConfig, request);

    expect(authRequest.method).toBe('POST');
    expect(authRequest.url).toBe('http://localhost:4321/api/auth/sign-out');
    expect(authRequest.headers.get('origin')).toBe('http://localhost:4321');
    expect(authRequest.headers.get('content-type')).toBeNull();
  });

  it('resolves safe sign-out redirects with / as the default', async () => {
    await expect(
      resolveSignOutRedirectPath(
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: {
            accept: 'text/html',
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ redirectTo: '/dashboard?tab=home' }),
        }),
      ),
    ).resolves.toBe('/dashboard?tab=home');

    await expect(
      resolveSignOutRedirectPath(
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: {
            accept: 'text/html',
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ redirectTo: 'https://evil.example' }),
        }),
      ),
    ).resolves.toBe('/');

    await expect(
      resolveSignOutRedirectPath(
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: { accept: 'text/html' },
        }),
      ),
    ).resolves.toBe('/');
  });

  it('rejects absolute sign-out redirects', async () => {
    await expect(
      resolveSignOutRedirectPath(
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: {
            accept: 'text/html',
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            redirectTo: 'http://localhost:4321/dashboard',
          }),
        }),
      ),
    ).resolves.toBe('/');
  });
});
