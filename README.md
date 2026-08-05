<img src="https://raw.githubusercontent.com/vergekit/vergekit/refs/heads/main/public/favicon.svg" alt="Verge Kit logo" width="96">

# Verge Kit


[Verge Kit](https://vergekit.com) is a solid foundation for building web apps with [Astro](https://astro.build) and the [Cloudflare Workers](https://workers.dev) ecosystem.

It's a pre-wired stack of dependencies and minimal boilerplate designed to help LLMs produce reliable and understandable applications.

***Start new apps with low effort and high confidence!***



## The Stack

- [Astro](https://astro.build) - SSR with strict
  [TypeScript](https://www.typescriptlang.org) and [Cloudflare Workers](https://workers.dev) adapter
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite database
- [Drizzle](https://orm.drizzle.team) - ORM, schema, migrations (w/ [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview))
- [Better Auth](https://www.better-auth.com) w/ [admin plugin](https://www.better-auth.com/docs/plugins/admin)
- [Tailwind](https://tailwindcss.com) - CSS utility classes
- [bejamas/ui](https://ui.bejamas.com) components (based on [shadcn/ui](https://ui.shadcn.com/))
- [Lucide](https://lucide.dev/icons/) icons
- [astro-favicons](https://github.com/ACP-CODE/astro-favicons) - simplified favicon generation
- [React Email](https://react.email/) components and templates
- [VK Core](https://github.com/vergekit/core) utilites & runtime helpers
- [Zod](https://zod.dev/) schema validation
- [Vitest](https://vitest.dev), [happy-dom](https://github.com/capricorn86/happy-dom), [oxlint](https://oxc.rs/docs/guide/usage/linter.html), and integrated npm verification scripts




## The Boilerplate

- Lazy auth middleware with typed, request-scoped `Astro.locals`
- Basic authentication flows with requisite email notifications
- Public-by-default route authorization with opt-in protected pages and APIs
- CSRF origin checks through [Astro config](https://docs.astro.build/en/guides/security/)
- Custom 404 and 500 error pages
- Drizzle schema, migrations, and typed database client for the default D1 preset
- Configurable user roles and permissions for `admin`, `moderator`, `user`, and `banned`
- Transactional email providers for console output,
  [Resend](https://resend.com), [Mailgun](https://www.mailgun.com),
  and [Cloudflare Email](https://developers.cloudflare.com/email-service/)
- Verification and helper scripts exposed through npm scripts



## Getting Started

Install the latest version:
```bash
npm create vergekit@latest
```

See [the docs](https://vergekit.com/installation/) for manual installation instructions.

For local auth flows with real email delivery, configure the email provider by adding a shared non-secret provider configuration in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "EMAIL_PROVIDER": "resend",
    "EMAIL_FROM": "VK <noreply@example.com>",
  },
}
```

and put local provider secrets in `.dev.vars`:

```bash
RESEND_API_KEY=your-api-key
```

Start the app:
```bash
npm run dev
```





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
