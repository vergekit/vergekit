import { z } from 'zod';
import { appSettings } from '@/config/schema';
import type { AppDatabase } from '@/db/client';

export const appSettingInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9][a-z0-9._-]*$/),
  value: z.string().max(4096),
});

export type AppSettingInput = z.infer<typeof appSettingInputSchema>;

export interface AppSettingResult {
  key: string;
  value: string;
  updatedAt: string;
}

export async function setAppSetting(
  database: AppDatabase,
  input: AppSettingInput,
  now: () => Date = () => new Date(),
): Promise<AppSettingResult> {
  const timestamp = now();

  await database
    .insert(appSettings)
    .values({
      key: input.key,
      value: input.value,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: input.value,
        updatedAt: timestamp,
      },
    });

  return {
    key: input.key,
    value: input.value,
    updatedAt: timestamp.toISOString(),
  };
}
