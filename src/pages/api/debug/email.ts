import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { sendEmail } from '@/email/send';
import { jsonFailure, jsonSuccess } from '@/lib/http/json';

// export const GET: APIRoute = async () => {
//   try {
//     const result = await sendEmail(env, {
//       to: 'me@example.com',
//       from: { email: 'noreply@resend.example.net', name: 'VK' },
//       subject: 'VK email verification test',
//       html: '<p>This is a manual VK email verification message.</p>',
//       text: 'This is a manual VK email verification message.',
//     });

//     return jsonSuccess({
//       provider: result.provider,
//       id: result.id,
//     });
//   } catch (error) {
//     return jsonFailure('Email send failed', {
//       status: 500,
//       issues: {
//         message:
//           error instanceof Error ? error.message : 'Unknown email send failure',
//       },
//     });
//   }
// };


export const GET: APIRoute = async () => {
  return jsonSuccess({
    message: 'No email for you (enable sendEmail demo before testing)',
  });
};