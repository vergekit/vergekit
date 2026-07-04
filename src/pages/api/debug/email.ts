import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { sendEmail } from '@vergekit/core/email';
import { jsonFailure, jsonSuccess, parseJsonRequest } from '@vergekit/core/http';
import { z } from 'zod';
import { appConfig } from '@/config/app';

const debugEmailSchema = z.object({
  to: z.email(),
});

export const GET: APIRoute = async () => {
  return jsonSuccess({
    message: 'No email for you (enable sendEmail demo before testing)',
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isAuthorizedDebugRequest(request, locals.isAuthenticated)) {
    return jsonFailure('Unauthorized', { status: 401 });
  }

  const parsed = await parseJsonRequest(request, debugEmailSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const from = env.EMAIL_FROM?.trim();

  if (!from) {
    return jsonFailure('EMAIL_FROM is required for debug email sends', {
      status: 500,
    });
  }

  const result = await sendEmail(env, {
    to: parsed.data.to,
    from,
    subject: `${appConfig.name} email verification test`,
    html: `<p>This is a manual ${appConfig.name} email verification message.</p>`,
    text: `This is a manual ${appConfig.name} email verification message.`,
    replyTo: env.EMAIL_REPLY_TO,
  });

  return jsonSuccess({
    provider: result.provider,
    id: result.id,
  });
};

function isAuthorizedDebugRequest(
  request: Request,
  isAuthenticated: boolean,
) {
  if (isAuthenticated) {
    return true;
  }

  const debugSecret = env.EMAIL_DEBUG_SECRET?.trim();

  return Boolean(
    debugSecret &&
      request.headers.get('x-email-debug-secret')?.trim() === debugSecret,
  );
}
