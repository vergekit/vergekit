import { describe, expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
  },
}));

import { db } from '@/db';
import { createD1Database } from '@/db';

describe('db runtime export', () => {
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
