import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

async function readProjectFile(path: string) {
  return readFile(new URL(path, projectRoot), 'utf8');
}

describe('future Hyperdrive documentation contract', () => {
  it('documents the future Hyperdrive support checklist without shipping adapter placeholders', async () => {
    const proof = await readProjectFile('docs/setup/hyperdrive-proof.md');

    expect(proof).toContain('D1 remains the only supported runtime database');
    expect(proof).toContain('Future Hyperdrive Support Checklist');
    expect(proof).toContain('@vergekit/core');
    expect(proof).toContain('database target selection');
    expect(proof).toContain('binding configuration');
    expect(proof).toContain('PostgreSQL');
    expect(proof).toContain('MySQL');
    expect(proof).toContain('Portable query patterns');
    expect(proof).toContain('Mutation semantics');
    expect(proof).toContain('Better Auth adapter');
    expect(proof).toContain('Hyperdrive production support is still deferred');
    expect(proof).not.toContain('proof modules under `src/db/hyperdrive`');
    expect(proof).not.toContain('app_settings');

    expect(existsSync(new URL('src/db/hyperdrive', projectRoot))).toBe(false);
  });
});
