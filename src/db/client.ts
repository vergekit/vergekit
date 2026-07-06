import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/config/schema';

export type AppDatabase = ReturnType<typeof createD1Database>;

export function createD1Database(binding: D1Database) {
  return drizzle(binding, { schema });
}
