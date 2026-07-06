# Future Hyperdrive Support

D1 remains the only supported runtime database. Hyperdrive production support is
still deferred, and the boilerplate does not ship PostgreSQL or MySQL adapters,
target parsing, or placeholder mutations.

This note preserves the implementation strategy for moving from D1-only support
to a future "D1 or Hyperdrive" database layer without keeping speculative code in
new applications.

## Current Runtime Boundary

- The Worker receives one D1 binding named `DB`.
- Runtime code creates the Drizzle client through `src/db/client.ts`.
- App routes, actions, middleware, and UI code should not import
  `drizzle-orm/d1` directly.
- `src/config/schema.ts` is the Drizzle schema entrypoint for the current D1
  schema.
- There is no database target selection runtime path today.

## Future Hyperdrive Support Checklist

Add Hyperdrive support as a real feature slice, not as placeholders in the
boilerplate. The slice should include:

- A stable database interface in `@vergekit/core` once both the D1 adapter and at
  least one Hyperdrive adapter use it.
- D1, PostgreSQL, and MySQL target names with explicit database target selection
  at the application boundary.
- Worker binding configuration for Hyperdrive, including local development
  behavior and deployed environment examples.
- Driver dependencies and adapter factories for the supported Hyperdrive
  engines.
- PostgreSQL and MySQL schema definitions plus migration workflows, rather than
  relying on the SQLite D1 migration directory.
- Tests that compile the same supported read helpers against D1 and each
  Hyperdrive target.
- Tests that prove unsupported targets fail with a clear error.
- Documentation for operational differences between D1 and Hyperdrive-backed
  databases.

## Portable query patterns

- Keep app-level database calls behind local helpers or a future core database
  interface.
- Prefer Drizzle query-builder reads using `select`, `from`, `where`, and
  parameterized predicates such as `eq`.
- Keep deterministic reads separate from writes. Hyperdrive can cache reads, but
  writes need explicit consistency decisions.
- Add dialect-specific helpers when a query needs SQL fragments, JSON operators,
  generated columns, full-text search, indexes, or other database-specific
  behavior.

## Mutation semantics

Do not enable writes for a Hyperdrive target until these differences are
specified and tested:

- Upserts, because SQLite, PostgreSQL, and MySQL expose different Drizzle APIs.
- Date serialization, because D1 commonly stores integer timestamps while
  PostgreSQL and MySQL can use native timestamp columns.
- Transaction behavior and retry policy.
- Error normalization for unique constraints, foreign keys, and connection
  failures.
- Read-after-write expectations when Hyperdrive caching is involved.

## Better Auth adapter

Before promoting Hyperdrive to a supported runtime target, decide how Better
Auth will select its database provider and schema:

- D1 should continue to use the SQLite Drizzle adapter path.
- PostgreSQL support needs a PostgreSQL Drizzle schema and Better Auth provider
  setting.
- MySQL support needs a MySQL Drizzle schema and Better Auth provider setting.
- Tests should initialize auth options for each supported target without opening
  real network connections.

## Deferred Work

- Hyperdrive production support is still deferred.
- No PostgreSQL or MySQL migrations are generated today.
- No real Hyperdrive binding is configured in `wrangler.jsonc`.
- No PostgreSQL or MySQL driver dependency is required by the current
  boilerplate.
- No database interface is exported from `@vergekit/core` until it has concrete
  D1 and Hyperdrive implementations.
