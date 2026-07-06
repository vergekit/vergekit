import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SendEmailInput } from '@vergekit/core/email';

const { runtimeEnv, send } = vi.hoisted(() => {
  const send = vi.fn<(input: SendEmailInput) => Promise<{ messageId: string }>>(
    async () => ({ messageId: 'debug-1' }),
  );

  return {
    runtimeEnv: {
      EMAIL_PROVIDER: 'cloudflare',
      EMAIL: { send },
    },
    send,
  };
});

vi.mock('cloudflare:workers', () => ({
  env: runtimeEnv,
}));

import { GET } from '@/pages/api/debug/email';

describe('/api/debug/email', () => {
  beforeEach(() => {
    send.mockClear();
  });

  it('sends a rendered React Email diagnostic template through the configured mailer', async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        provider: 'cloudflare',
        id: 'debug-1',
      },
    });
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith({
      to: 'me@example.com',
      from: { email: 'noreply@resend.example.net', name: 'VK' },
      subject: 'VK React Email debug test',
      html: expect.stringContaining('React Email diagnostic'),
      text: expect.stringContaining('React Email diagnostic'),
    });

    const message = send.mock.calls[0]![0];

    expect(message?.html).toContain('x-apple-disable-message-reformatting');
    expect(message?.html).toContain('data-skip-in-text="true"');
    expect(message?.html).toContain('<table');
    expect(message?.html).toContain('Template source');
    expect(message?.text).toContain('src/email/demo.tsx');
    expect(message?.text).toContain('React Email components');
  });
});
