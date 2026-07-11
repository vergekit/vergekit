# Verge Kit


[Verge Kit](https://vergekit.com) is a solid foundation for building web apps with [Astro](https://astro.build) and the [Cloudflare Workers](https://workers.dev) ecosystem.

It's a pre-wired stack of dependencies and minimal boilerplate designed to help LLMs produce reliable and understandable applications.

Start new apps with low effort and high confidence.



## The Stack

- [Astro](https://astro.build) - SSR with strict
  [TypeScript](https://www.typescriptlang.org) and [Cloudflare Workers](https://workers.dev) adapter
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com) w/ [admin plugin](https://www.better-auth.com/docs/plugins/admin)
- [Tailwind CSS](https://tailwindcss.com)
- [bejamas/ui](https://ui.bejamas.com) components (based on [shadcn/ui](https://ui.shadcn.com/))
- [Lucide Astro](https://lucide.dev/guide/astro) icons
- [React Email](https://react.email/) components and templates
- [Vitest](https://vitest.dev), [happy-dom](https://github.com/capricorn86/happy-dom), [oxlint](https://oxc.rs/docs/guide/usage/linter.html)




## Boilerplate

- Middleware that loads auth state into typed `Astro.locals`
- Public-by-default route authorization with opt-in protected pages and APIs
- CSRF origin checks through [Astro config](https://docs.astro.build/en/guides/security/)
- Custom 404 and 500 error pages
- D1-backed Drizzle schema, migrations, and typed database client
- Basic authentication flows (register, login, logout, email verification, forgot password, and reset password) with requisite email notifications
- Configurable user roles and permissions for `admin`, `moderator`, `user`, and `banned`
- Transactional email providers for console output,
  [Resend](https://resend.com), [Mailgun](https://www.mailgun.com),
  and [Cloudflare Email](https://developers.cloudflare.com/email-service/)
- Verification and helper scripts exposed through npm scripts



## Getting Started

Install the latest version:
```bash
npm create vergekit@latest my-app
```

Install dependencies:

```bash
cd my-app
npm install
```

Create local runtime secrets. For first-time setup, this copies the template and
writes a fresh Better Auth secret:

```bash
cp .dev.vars.example .dev.vars && secret="$(openssl rand -base64 32)" && awk -v secret="$secret" 'BEGIN { done = 0 } /^BETTER_AUTH_SECRET=/ { print "BETTER_AUTH_SECRET=" secret; done = 1; next } { print } END { if (!done) print "BETTER_AUTH_SECRET=" secret }' .dev.vars > .dev.vars.tmp && mv .dev.vars.tmp .dev.vars
```

Manual installation instructions: https://vergekit.com/docs/installation/

Apply local D1 migrations:

```bash
npm run db:migrate:local
```

Inspect the local schema and data with Drizzle Studio:

```bash
npm run db:studio
```

Optionally create a verified local user with the `admin` role after migrations:

```bash
npm run init:admin
```

Configure the email provider before testing registration, verification, or password reset. Put shared non-secret provider configuration in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "EMAIL_PROVIDER": "resend",
    "EMAIL_FROM": "VK <noreply@example.com>",
  },
}
```

For local auth flows with real email delivery, put local provider secrets in `.dev.vars`:

```bash
RESEND_API_KEY=your-api-key
```

Start the app:
```bash
npm run dev
```





## Documentation

Setup and operational guides are available in [`docs/setup`](docs/setup),
including configuration, D1, authentication routes, email, and deployment. The
hosted documentation is available at [vergekit.com/docs](https://vergekit.com/docs/).

## Support

Verge Kit is maintained as a technical starting point rather than a managed
application support service. If you find a reproducible defect in the
boilerplate, please [open an issue](https://github.com/vergekit/vergekit/issues)
with the Verge Kit version, runtime environment, reproduction steps, and the
expected and actual behavior. Debugging application-specific changes and
providing implementation consulting are outside the project's support scope.

## Contributing

The project is not currently accepting external feature contributions or pull
requests. This keeps the reference stack focused and its implementation
decisions consistent. Clear bug reports are welcome through the issue tracker.

## License

Verge Kit is available under the [MIT License](https://opensource.org/license/mit).

