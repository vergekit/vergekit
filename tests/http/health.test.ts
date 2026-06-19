import { describe, expect, it } from 'vitest';
import { GET } from '@/pages/api/health';

describe('/api/health', () => {
  it('uses the standard success JSON shape', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        ok: true,
        service: 'vk',
      },
    });
  });
});
