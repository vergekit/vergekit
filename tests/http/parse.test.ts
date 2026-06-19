import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseJsonRequest, parseWithSchema } from '@/lib/http/parse';

const profileSchema = z.object({
  email: z.email(),
  displayName: z.string().trim().min(1),
});

describe('Zod API boundary parsing', () => {
  it('returns typed data for valid input without throwing', () => {
    const result = parseWithSchema(profileSchema, {
      email: 'ada@example.com',
      displayName: ' Ada ',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        email: 'ada@example.com',
        displayName: 'Ada',
      },
    });
  });

  it('returns a standard failure for invalid input without throwing', () => {
    const result = parseWithSchema(profileSchema, {
      email: 'not-an-email',
      displayName: '',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect(result.issues).toMatchObject({
        fieldErrors: {
          email: expect.any(Array),
          displayName: expect.any(Array),
        },
      });
    }
  });

  it('parses JSON request bodies through safeParse', async () => {
    const request = new Request('https://vk.example.com/api/profile', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ada@example.com',
        displayName: 'Ada',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await parseJsonRequest(request, profileSchema);

    expect(result).toEqual({
      ok: true,
      data: {
        email: 'ada@example.com',
        displayName: 'Ada',
      },
    });
  });

  it('returns a standard failure for malformed JSON', async () => {
    const request = new Request('https://vk.example.com/api/profile', {
      method: 'POST',
      body: '{',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await parseJsonRequest(request, profileSchema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({
        error: 'Invalid JSON request body',
      });
    }
  });
});
