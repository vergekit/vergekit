# Deployment

VK deploys as an Astro server app on Cloudflare Workers.

## 1. Create D1

Create the remote database:

```bash
npx wrangler d1 create vk
```

Copy the returned `database_id` into `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "vk",
      "database_id": "your-d1-database-id",
      "migrations_dir": "drizzle/d1",
    },
  ],
}
```

## 2. Set Secrets

Generate a stable Better Auth secret:

```bash
openssl rand -base64 32
```

Set it in Cloudflare:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
```

Set the public auth URL for the deployed app. Use your production origin:

```bash
npx wrangler secret put BETTER_AUTH_URL
```

## 3. Configure Email

Set `EMAIL_PROVIDER` in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "EMAIL_PROVIDER": "resend",
  },
}
```

Set provider secrets:

```bash
npx wrangler secret put RESEND_API_KEY
```

For Mailgun:

```bash
npx wrangler secret put MAILGUN_API_KEY
npx wrangler secret put MAILGUN_DOMAIN
```

For Cloudflare Email, configure the `EMAIL` binding and verified sending domain
in Cloudflare.

## 4. Migrate

Apply remote D1 migrations:

```bash
npm run db:migrate:remote
```

## 5. Verify

Run the full local verification suite:

```bash
npm run verify
```

## 6. Deploy

Build and deploy with Wrangler:

```bash
npm run build
npx wrangler deploy
```

Use your normal Cloudflare project workflow if deployment is handled by CI.
