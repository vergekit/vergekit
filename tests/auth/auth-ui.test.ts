import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

function readProjectFile(path: string) {
  return readFileSync(new URL(path, projectRoot), 'utf8');
}

describe('minimal auth UI contract', () => {
  const requiredFiles = [
    'src/components/ui/button/Button.astro',
    'src/components/ui/button/index.ts',
    'src/components/ui/input/Input.astro',
    'src/components/ui/input/index.ts',
    'src/components/ui/field/Field.astro',
    'src/components/ui/field/FieldLabel.astro',
    'src/components/ui/field/index.ts',
    'src/components/ui/label/Label.astro',
    'src/components/ui/separator/Separator.astro',
    'src/lib/utils.ts',
    'src/components/auth/AuthShell.astro',
    'src/pages/login.astro',
    'src/pages/register.astro',
    'src/pages/auth/forgot-password.astro',
    'src/pages/auth/reset-password.astro',
    'src/pages/auth/verify-email.astro',
    'src/pages/dashboard.astro',
    'src/pages/404.astro',
    'src/pages/500.astro',
  ];

  it.each(requiredFiles)('creates %s', (path) => {
    expect(existsSync(new URL(path, projectRoot))).toBe(true);
  });

  it('uses stock Bejamas components and imports in auth UI', () => {
    const buttonSource = readProjectFile('src/components/ui/button/Button.astro');
    const inputSource = readProjectFile('src/components/ui/input/Input.astro');
    const fieldSource = readProjectFile('src/components/ui/field/Field.astro');
    const fieldIndexSource = readProjectFile('src/components/ui/field/index.ts');

    expect(buttonSource).toContain('buttonVariants');
    expect(buttonSource).toContain('data-slot="button"');
    expect(buttonSource).toContain('from "@/lib/utils"');
    expect(inputSource).toContain('inputVariants');
    expect(inputSource).toContain('data-slot={props["data-slot"] ?? "input"}');
    expect(inputSource).toContain('from "@/lib/utils"');
    expect(fieldSource).toContain('fieldVariants');
    expect(fieldSource).toContain('data-slot="field"');
    expect(fieldSource).toContain('from "@/lib/utils"');
    expect(fieldIndexSource).toContain(
      'export { default as FieldLabel } from "./FieldLabel.astro"',
    );

    const buttonPages = [
      'src/pages/index.astro',
      'src/pages/dashboard.astro',
      'src/pages/login.astro',
      'src/pages/register.astro',
      'src/pages/auth/forgot-password.astro',
      'src/pages/auth/reset-password.astro',
      'src/pages/auth/verify-email.astro',
    ];
    const inputPages = [
      'src/pages/login.astro',
      'src/pages/register.astro',
      'src/pages/auth/forgot-password.astro',
      'src/pages/auth/reset-password.astro',
      'src/pages/auth/verify-email.astro',
    ];

    for (const page of buttonPages) {
      const source = readProjectFile(page);

      expect(source).toContain('@/components/ui/button');
      expect(source).not.toContain('@/components/ui/form/Button.astro');
    }

    for (const page of inputPages) {
      const source = readProjectFile(page);

      expect(source).toContain('@/components/ui/input');
      expect(source).toContain('@/components/ui/field');
      expect(source).not.toContain('@/components/ui/form/Input.astro');
    }
  });

  it('uses the local Bejamas class-name utility', () => {
    const componentsConfig = readProjectFile('components.json');
    const utilsSource = readProjectFile('src/lib/utils.ts');

    expect(componentsConfig).toContain('"utils": "@/lib/utils"');
    expect(utilsSource).toContain('export function cn');
    expect(utilsSource).toContain('twMerge(clsx(inputs))');
  });

  it('wires auth forms to the mounted Better Auth endpoints', () => {
    const formContracts = [
      {
        file: 'src/pages/login.astro',
        action: '/api/auth/sign-in/email',
        fieldNames: ['email', 'password', 'callbackURL'],
      },
      {
        file: 'src/pages/register.astro',
        action: '/api/auth/sign-up/email',
        fieldNames: ['name', 'email', 'password', 'callbackURL'],
      },
      {
        file: 'src/pages/auth/forgot-password.astro',
        action: '/api/auth/request-password-reset',
        fieldNames: ['email', 'redirectTo'],
      },
      {
        file: 'src/pages/auth/reset-password.astro',
        action: '/api/auth/reset-password',
        fieldNames: ['newPassword', 'token'],
      },
      {
        file: 'src/pages/auth/verify-email.astro',
        action: '/api/auth/send-verification-email',
        fieldNames: ['email', 'callbackURL'],
      },
    ];

    for (const contract of formContracts) {
      const source = readProjectFile(contract.file);

      expect(source).toContain(`action="${contract.action}"`);
      expect(source).toContain('method="post"');

      for (const fieldName of contract.fieldNames) {
        expect(source).toContain(`name="${fieldName}"`);
      }
    }
  });

  it('links the app bootstrap page to the login and registration screens', () => {
    const source = readProjectFile('src/pages/index.astro');

    expect(source).toContain('@/config/auth');
    expect(source).toContain('href={authConfig.routes.loginPath}');
    expect(source).toContain('href="/register"');
  });

  it('gates the dashboard link on the authenticated homepage state', () => {
    const source = readProjectFile('src/pages/index.astro');

    expect(source).toContain('Astro.locals.isAuthenticated');
    expect(source).toContain('@/config/app');
    expect(source).toContain('href={appConfig.defaultAuthenticatedPath}');
  });

  it('marks email auth forms for client-side redirect and inline errors', () => {
    const formContracts = [
      {
        file: 'src/pages/login.astro',
        id: 'login-error',
      },
      {
        file: 'src/pages/register.astro',
        id: 'register-error',
      },
    ];

    for (const contract of formContracts) {
      const source = readProjectFile(contract.file);

      expect(source).toContain('data-auth-form');
      expect(source).toContain(`data-auth-error="${contract.id}"`);
      expect(source).toContain(`id="${contract.id}"`);
      expect(source).toContain('aria-live="polite"');
      expect(source).toContain(
        "import { mountAuthForms } from '@vergekit/core/auth'",
      );
      expect(source).toContain('authConfig');
      expect(source).toContain('appConfig.defaultAuthenticatedPath');
    }
  });

  it('renders the dashboard from auth locals with a server-first sign out form', () => {
    const source = readProjectFile('src/pages/dashboard.astro');

    expect(source).toContain('Astro.locals.user');
    expect(source).toContain('Astro.locals.session');
    expect(source).toContain('action="/api/auth/sign-out"');
    expect(source).toContain('method="post"');
    expect(source).toContain('name="redirectTo"');
    expect(source).toContain('value={appConfig.homePath}');
  });

  it('provides standalone error pages for missing routes and server failures', () => {
    const notFoundSource = readProjectFile('src/pages/404.astro');
    const serverErrorSource = readProjectFile('src/pages/500.astro');

    expect(notFoundSource).toContain('<title>404 - NOT FOUND</title>');
    expect(notFoundSource).toContain('This page could not be found.');
    expect(notFoundSource).toContain('font-family: -apple-system');

    expect(serverErrorSource).toContain('<title>500 - SERVER ERROR</title>');
    expect(serverErrorSource).toContain(
      'An error occurred on the server.',
    );
    expect(serverErrorSource).toContain('interface Props');
  });
});
