import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/config/schema';
import { runtimeEnv } from '@/runtime';

export const authDatabaseProvider = 'sqlite' as const;

export function createD1Database(binding: D1Database) {
  return drizzle(binding, { schema });
}

export type AppDatabase = ReturnType<typeof createD1Database>;

export const db = createD1Database(runtimeEnv.DB);
