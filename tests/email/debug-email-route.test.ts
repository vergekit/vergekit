import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runtimeEnv, send } = vi.hoisted(() => {
  const send = vi.fn(async () => ({ messageId: 'debug-1' }));

  return {
    runtimeEnv: {
      EMAIL_PROVIDER: 'cloudflare',
      EMAIL_FROM: 'VK <noreply@example.com>',
      EMAIL: { send },
      EMAIL_DEBUG_SECRET: undefined as string | undefined,
    },
    send,
  };
});

vi.mock('cloudflare:workers', () => ({
  env: runtimeEnv,
}));

import { POST } from '@/pages/api/debug/email';

describe('/api/debug/email', () => {
  beforeEach(() => {
    send.mockClear();
    runtimeEnv.EMAIL_DEBUG_SECRET = undefined;
  });

  it('sends a diagnostic message through the configured mailer', async () => {
    const response = await postDebugEmail({
      to: 'ada@example.com',
      authenticated: true,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        provider: 'cloudflare',
        id: 'debug-1',
      },
    });
    expect(send).toHaveBeenCalledWith({
      to: 'ada@example.com',
      from: 'VK <noreply@example.com>',
      subject: 'VK email verification test',
      html: '<p>This is a manual VK email verification message.</p>',
      text: 'This is a manual VK email verification message.',
      replyTo: undefined,
    });
  });

  it('allows a configured debug secret for manual curl verification', async () => {
    runtimeEnv.EMAIL_DEBUG_SECRET = 'debug-secret';

    const response = await postDebugEmail({
      to: 'ada@example.com',
      headers: { 'x-email-debug-secret': 'debug-secret' },
    });

    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
  });

  it('rejects unauthenticated requests without a matching debug secret', async () => {
    const response = await postDebugEmail({
      to: 'ada@example.com',
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: 'Unauthorized',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects invalid recipient addresses without sending', async () => {
    const response = await postDebugEmail({
      to: 'not-an-email',
      authenticated: true,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: 'Invalid request body',
      issues: {
        fieldErrors: {
          to: expect.any(Array),
        },
      },
    });
    expect(send).not.toHaveBeenCalled();
  });
});

function postDebugEmail({
  to,
  authenticated = false,
  headers = {},
}: {
  to: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
}) {
  return POST({
    request: new Request('https://vk.example.com/api/debug/email', {
      method: 'POST',
      body: JSON.stringify({ to }),
      headers: { 'Content-Type': 'application/json', ...headers },
    }),
    locals: { isAuthenticated: authenticated },
  } as Parameters<typeof POST>[0]);
}
