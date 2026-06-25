# Core Concepts

## Use The Stack

VK prefers the framework and platform tools already in the project.

Use Astro pages, API routes, Actions, middleware, and config before adding a new
local abstraction. Add helpers only when they remove repeated code or protect a
real boundary.

## D1 First

D1 is the supported runtime database.

Use the local `src/db` modules from app code. Do not import `drizzle-orm/d1`
directly in routes, pages, actions, or components.

This keeps future Hyperdrive PostgreSQL or MySQL work isolated to the database
adapter layer.

## Server First

Keep auth, database writes, email, and validation on the server.

Use client JavaScript only where it improves a specific interaction.

## Validate At The Boundary

Use Zod for request bodies, form input, and action input.

Keep validation close to the route or action that receives external data.

## Middleware Owns Auth State

Middleware creates the Better Auth instance, reads the session, and writes:

- `Astro.locals.user`
- `Astro.locals.session`
- `Astro.locals.isAuthenticated`

Pages and routes should read from locals instead of reimplementing session
lookup.

## Email Is A Provider

Auth email is rendered once and sent through a provider.

Local development can use `console`. Workers deployments should use Cloudflare
Email, Resend, Mailgun, or another fetch/binding-based provider.

## Keep The Boilerplate Small

VK does not include uploads, media processing, admin screens, RBAC, analytics, or
a CLI yet.

Add those when an application needs them.
