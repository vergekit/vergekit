import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClientPlugins } from '@/config/auth';

export const authClient = createAuthClient({
  plugins: createAuthClientPlugins({ adminClient }),
});
