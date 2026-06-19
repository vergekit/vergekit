import {
  formatEmailAddress,
  formatEmailRecipients,
  type EmailProvider,
  type Fetcher,
  type SendEmailInput,
} from '../types';

export interface ResendEmailProviderOptions {
  apiKey: string;
  endpoint?: string;
  fetcher?: Fetcher;
}

interface ResendResponse {
  id?: string;
}

export function createResendEmailProvider({
  apiKey,
  endpoint = 'https://api.resend.com/emails',
  fetcher = fetch,
}: ResendEmailProviderOptions): EmailProvider {
  return {
    async send(input: SendEmailInput) {
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formatEmailRecipients(input.to),
          from: formatEmailAddress(input.from),
          subject: input.subject,
          html: input.html,
          text: input.text,
          reply_to: input.replyTo
            ? formatEmailAddress(input.replyTo)
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend email send failed: ${await response.text()}`);
      }

      const body = (await response.json()) as ResendResponse;

      return {
        provider: 'resend',
        id: body.id,
      };
    },
  };
}
