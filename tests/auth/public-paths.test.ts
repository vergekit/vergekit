import { describe, expect, it } from 'vitest';
import {
  AUTH_API_PREFIX,
  LOGIN_PATH,
  SIGN_OUT_PATH,
  createSignOutAuthRequest,
  getLoginRedirectPath,
  isAuthApiRoute,
  isProtectedRoute,
  resolveSignOutRedirectPath,
  shouldRedirectSignOutRequest,
} from '@/auth/routes';

describe('auth protected route policy', () => {
  it('keeps the Better Auth API route surface public', () => {
    expect(AUTH_API_PREFIX).toBe('/api/auth');
    expect(isAuthApiRoute('/api/auth')).toBe(true);
    expect(isAuthApiRoute('/api/auth/sign-in')).toBe(true);
    expect(isAuthApiRoute('/api/auth/session')).toBe(true);
    expect(isAuthApiRoute('/api/auth/callback/google?code=abc')).toBe(true);
  });

  it('treats pages as public by default', () => {
    expect(isProtectedRoute('/')).toBe(false);
    expect(isProtectedRoute('/about')).toBe(false);
    expect(isProtectedRoute('/_astro/client.js')).toBe(false);
    expect(isProtectedRoute('/favicon.svg')).toBe(false);
    expect(isProtectedRoute('/login')).toBe(false);
    expect(isProtectedRoute('/register')).toBe(false);
    expect(isProtectedRoute('/auth/forgot-password')).toBe(false);
    expect(isProtectedRoute('/login?redirectTo=%2Fdashboard')).toBe(false);
  });

  it('requires auth for explicitly protected pages', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true);
    expect(isProtectedRoute('/settings/profile')).toBe(false);
  });

  it('treats API routes as public by default', () => {
    expect(isProtectedRoute('/api/auth/sign-in')).toBe(false);
    expect(isProtectedRoute('/api/health')).toBe(false);
    expect(isProtectedRoute('/api/debug/email')).toBe(false);
    expect(isProtectedRoute('/api/private')).toBe(false);
  });

  it('builds a login redirect with the original destination preserved', () => {
    expect(LOGIN_PATH).toBe('/login');
    expect(getLoginRedirectPath('/dashboard?tab=billing')).toBe(
      '/login?redirectTo=%2Fdashboard%3Ftab%3Dbilling',
    );
  });

  it('redirects native sign-out form posts while preserving JSON API behavior', () => {
    expect(SIGN_OUT_PATH).toBe('/api/auth/sign-out');
    expect(
      shouldRedirectSignOutRequest(
        new Request('http://localhost:4321/api/auth/sign-out', {
          method: 'POST',
          headers: { accept: 'text/html' },
        }),
      ),
    ).toBe(true);
    expect(
      shouldRedirectSignOutRequest(
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

    const authRequest = createSignOutAuthRequest(request);

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
