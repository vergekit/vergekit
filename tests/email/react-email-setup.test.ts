import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('React Email template setup', () => {
  it('keeps src/email/auth limited to templates', () => {
    expect(existsSync(`${root}src/email/auth/verify-email.tsx`)).toBe(true);
    expect(existsSync(`${root}src/email/auth/reset-password.tsx`)).toBe(true);
    expect(
      existsSync(`${root}${['src', 'email', 'auth', 'render.ts'].join('/')}`),
    ).toBe(false);
    expect(existsSync(`${root}src/email/verify-email.tsx`)).toBe(false);
    expect(existsSync(`${root}src/email/reset-password.tsx`)).toBe(false);
    expect(existsSync(`${root}src/email/demo.tsx`)).toBe(true);
    expect(existsSync(`${root}src/email/index.ts`)).toBe(false);
    expect(existsSync(`${root}${['src', 'auth'].join('/')}`)).toBe(false);
    expect(existsSync(`${root}src/config/auth-email.ts`)).toBe(true);
    expect(existsSync(`${root}src/email/templates/verify-email.astro`)).toBe(
      false,
    );
    expect(existsSync(`${root}src/email/templates/reset-password.astro`)).toBe(
      false,
    );
  });

  it('uses React Email packages instead of Backstro', () => {
    const packageJson = JSON.parse(
      readFileSync(`${root}package.json`, 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    expect(packageJson.dependencies).not.toHaveProperty('@backstro/email');
    expect(packageJson.dependencies).not.toHaveProperty(
      '@react-email/components',
    );
    expect(packageJson.dependencies).not.toHaveProperty('@react-email/render');
    expect(packageJson.dependencies).toHaveProperty('react-email');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-dom');
    expect(packageJson.scripts?.email).toBe('email dev --dir src/email');
  });
});
