import { describe, expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
  },
}));

import { env } from 'cloudflare:workers';
import { authDatabaseProvider, createD1Database, db } from '@/db';
import { runtimeEnv } from '@/runtime';

describe('db runtime export', () => {
  it('exposes the Cloudflare environment through the shared runtime seam', () => {
    expect(runtimeEnv).toBe(env);
  });

  it('exports the Better Auth SQLite provider for the D1 target', () => {
    expect(authDatabaseProvider).toBe('sqlite');
  });

  it('exports an initialized drizzle client from @/db', () => {
    expect(db).toBeDefined();
    expect(db.select).toBeTypeOf('function');
  });

  it('keeps createD1Database available for custom bindings', () => {
    const customDb = createD1Database(
      {} as Parameters<typeof createD1Database>[0],
    );

    expect(customDb).toBeDefined();
    expect(customDb.select).toBeTypeOf('function');
  });
});
