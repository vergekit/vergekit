
import type { APIRoute } from 'astro';
import { jsonSuccess } from '@vergekit/core/http';


// import { jsonFailure } from '@vergekit/core/http';
// import { sendEmail } from '@vergekit/core/email';
// import { render } from 'react-email';
// import * as React from 'react';
// import { appConfig } from '@/config/app';
// import DemoEmail from '@/email/demo';
// import { runtimeEnv } from '@/runtime';

// const debugRecipient = 'me@example.com';
// const debugFrom = { email: 'noreply@resend.example.net', name: appConfig.name };

// export const GET: APIRoute = async () => {
//   const subject = `${appConfig.name} React Email debug test`;
//   const component = React.createElement(DemoEmail, {
//     appName: appConfig.name,
//     recipient: debugRecipient,
//     provider: runtimeEnv.EMAIL_PROVIDER || 'unknown',
//   });

//   try {
//     const result = await sendEmail(runtimeEnv, {
//       to: debugRecipient,
//       from: debugFrom,
//       subject,
//       html: await render(component),
//       text: await render(component, { plainText: true }),
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
