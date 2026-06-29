import { describe, expect, it } from 'vitest';
import { appConfig } from '@/config/app';

describe('app config', () => {
  it('keeps starter identity and default app landing paths together', () => {
    expect(appConfig).toMatchObject({
      name: 'VK',
      displayName: 'Verge Kit',
      homePath: '/',
      defaultAuthenticatedPath: '/dashboard',
    });
  });
});
