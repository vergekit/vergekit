import { describe, expect, it, vi } from 'vitest';
import {
  appSettingInputSchema,
  setAppSetting,
  updateAppSettingAction,
} from '@/actions/app-settings';
import { appSettings } from '@/db/schema';
import type { AppDatabase } from '@/db/client';

vi.mock('cloudflare:workers', () => ({
  env: {
    DB: {},
  },
}));

describe('app settings action convention', () => {
  it('defines a form input schema for the sample mutation', () => {
    const parsed = appSettingInputSchema.safeParse({
      key: 'site.title',
      value: 'VK',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects blank or unsafe setting keys', () => {
    expect(
      appSettingInputSchema.safeParse({ key: '', value: 'VK' }).success,
    ).toBe(false);
    expect(
      appSettingInputSchema.safeParse({ key: '../secret', value: 'VK' })
        .success,
    ).toBe(false);
  });

  it('registers the sample mutation as an Astro form action', () => {
    expect(updateAppSettingAction).toBeTypeOf('function');
    expect(updateAppSettingAction).toHaveProperty('orThrow');
  });

  it('upserts app settings through the D1 drizzle query surface', async () => {
    const now = new Date('2026-06-19T12:00:00.000Z');
    const captured: {
      table?: unknown;
      values?: unknown;
      conflict?: unknown;
    } = {};
    const db = {
      insert(table: unknown) {
        captured.table = table;

        return {
          values(values: unknown) {
            captured.values = values;

            return {
              async onConflictDoUpdate(conflict: unknown) {
                captured.conflict = conflict;
              },
            };
          },
        };
      },
    } as unknown as AppDatabase;

    const result = await setAppSetting(
      db,
      { key: 'site.title', value: 'VK' },
      () => now,
    );

    expect(result).toEqual({
      key: 'site.title',
      value: 'VK',
      updatedAt: '2026-06-19T12:00:00.000Z',
    });
    expect(captured.table).toBe(appSettings);
    expect(captured.values).toEqual({
      key: 'site.title',
      value: 'VK',
      createdAt: now,
      updatedAt: now,
    });
    expect(captured.conflict).toMatchObject({
      target: appSettings.key,
      set: {
        value: 'VK',
        updatedAt: now,
      },
    });
  });
});
