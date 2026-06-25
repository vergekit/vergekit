# Installation

## Requirements

- Node.js.
- npm.
- OpenSSL for local secret generation.
- Wrangler through the project dependency.
- A Cloudflare account for remote D1 and deployment.

## Install

Install dependencies:

```bash
npm install
```

Create local runtime variables:

```bash
cp .dev.vars.example .dev.vars
```

Generate a Better Auth secret:

```bash
openssl rand -base64 32
```

Add it to `.dev.vars`:

```bash
BETTER_AUTH_SECRET=your-generated-secret
```

Paste-free option:

```bash
secret="$(openssl rand -base64 32)" && awk -v secret="$secret" 'BEGIN { done = 0 } /^BETTER_AUTH_SECRET=/ { print "BETTER_AUTH_SECRET=" secret; done = 1; next } { print } END { if (!done) print "BETTER_AUTH_SECRET=" secret }' .dev.vars > .dev.vars.tmp && mv .dev.vars.tmp .dev.vars
```

Check the base URL:

```bash
BETTER_AUTH_URL=http://localhost:4321
```

## Email

The default local email provider is `console`.

Use it for local setup when you only need links printed to the terminal:

```bash
EMAIL_PROVIDER=console
```

For full auth behavior with delivered verification and reset emails, configure a
real provider before testing auth:

```bash
EMAIL_PROVIDER=resend
EMAIL_FROM="VK <noreply@example.com>"
RESEND_API_KEY=your-api-key
```

Mailgun uses:

```bash
EMAIL_PROVIDER=mailgun
EMAIL_FROM="VK <noreply@example.com>"
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=mg.example.com
```

Cloudflare Email uses the `EMAIL` binding from `wrangler.jsonc`.

## Database

Apply local D1 migrations:

```bash
npm run db:migrate:local
```

Regenerate migrations after schema changes:

```bash
npm run db:generate
```

## Run

Start the dev server:

```bash
npm run dev
```

Run the full local check:

```bash
npm run verify
```

`npm run verify` runs type checks, linting, format checks, tests, and the
production build.
