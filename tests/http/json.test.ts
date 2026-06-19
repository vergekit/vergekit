import { describe, expect, it } from 'vitest';
import { jsonFailure, jsonSuccess } from '@/lib/http/json';

describe('standard JSON responses', () => {
  it('wraps successful payloads in a data object', async () => {
    const response = jsonSuccess({ ok: true });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { ok: true } });
  });

  it('wraps failures in an error object with optional issues', async () => {
    const response = jsonFailure('Invalid request body', {
      status: 422,
      issues: { fieldErrors: { email: ['Invalid email'] } },
    });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: 'Invalid request body',
      issues: { fieldErrors: { email: ['Invalid email'] } },
    });
  });
});
