import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import drizzleConfig from '../../drizzle.config';

const projectRoot = new URL('../../', import.meta.url);

describe('database config', () => {
  it('does not keep database target constants in source config', () => {
    expect(existsSync(new URL('src/config/database.ts', projectRoot))).toBe(
      false,
    );
    expect(readFileSync(new URL('src/config/index.ts', projectRoot), 'utf8'))
      .not.toContain('databaseConfig');
  });

  it('uses the single config schema file for D1 schema definitions', async () => {
    expect(existsSync(new URL('src/config/schema.ts', projectRoot))).toBe(true);
    expect(existsSync(new URL('src/db.ts', projectRoot))).toBe(true);
    expect(existsSync(new URL('src/db', projectRoot))).toBe(false);
    expect(existsSync(new URL('src/db/schema', projectRoot))).toBe(false);
    expect((drizzleConfig as { schema?: string }).schema).toBe(
      './src/config/schema.ts',
    );

    const schema = await import('@/config/schema');

    expect(Object.keys(schema).sort()).toEqual([
      'account',
      'session',
      'user',
      'verification',
    ]);
  });

  it('does not ship app settings proof tables or database target placeholders', () => {
    const migration = readFileSync(
      new URL('migrations/0000_vk_init.sql', projectRoot),
      'utf8',
    );

    expect(migration).not.toContain('app_settings');
    expect(existsSync(new URL('src/db/hyperdrive', projectRoot))).toBe(false);
    expect(existsSync(new URL('src/db/queries', projectRoot))).toBe(false);
    expect(existsSync(new URL('src/db/mutations', projectRoot))).toBe(false);
    expect(existsSync(new URL('src/db/target.ts', projectRoot))).toBe(false);
  });
});
