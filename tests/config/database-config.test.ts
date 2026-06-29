import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

describe('database config', () => {
  it('does not keep database target constants in source config', () => {
    expect(existsSync(new URL('src/config/database.ts', projectRoot))).toBe(
      false,
    );
    expect(readFileSync(new URL('src/config/index.ts', projectRoot), 'utf8'))
      .not.toContain('databaseConfig');
  });
});
