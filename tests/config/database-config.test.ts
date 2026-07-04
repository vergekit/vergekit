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
    expect(existsSync(new URL('src/db/schema', projectRoot))).toBe(false);
    expect((drizzleConfig as { schema?: string }).schema).toBe(
      './src/config/schema.ts',
    );

    const schema = await import('@/config/schema');

    expect(Object.keys(schema).sort()).toEqual([
      'account',
      'appSettings',
      'session',
      'user',
      'verification',
    ]);
  });
});
