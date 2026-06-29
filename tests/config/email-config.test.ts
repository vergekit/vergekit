import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

describe('email config', () => {
  it('does not keep email provider constants in source config', () => {
    expect(existsSync(new URL('src/config/email.ts', projectRoot))).toBe(false);
    expect(readFileSync(new URL('src/config/index.ts', projectRoot), 'utf8'))
      .not.toContain('emailConfig');
  });
});
