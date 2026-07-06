import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { user } from '@/config/schema';
import { createD1Database } from '@/db/client';

describe('createD1Database', () => {
  it('creates a D1 drizzle client with the auth schema query surface', () => {
    const db = createD1Database({} as Parameters<typeof createD1Database>[0]);

    const query = db
      .select()
      .from(user)
      .where(eq(user.email, 'ada@example.com'))
      .toSQL();

    expect(query.sql).toContain('user');
    expect(query.params).toEqual(['ada@example.com']);
  });
});
