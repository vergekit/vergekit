import {
  formatEmailAddress,
  type EmailProvider,
  type EmailRecipient,
  type Fetcher,
  type SendEmailInput,
} from '../types';

export interface MailgunEmailProviderOptions {
  apiKey: string;
  domain: string;
  endpointBase?: string;
  fetcher?: Fetcher;
}

interface MailgunResponse {
  id?: string;
}

export function createMailgunEmailProvider({
  apiKey,
  domain,
  endpointBase = 'https://api.mailgun.net/v3',
  fetcher = fetch,
}: MailgunEmailProviderOptions): EmailProvider {
  return {
    async send(input: SendEmailInput) {
      const body = new URLSearchParams();
      appendRecipients(body, 'to', input.to);
      body.set('from', formatEmailAddress(input.from));
      body.set('subject', input.subject);
      body.set('html', input.html);
      body.set('text', input.text);

      if (input.replyTo) {
        body.set('h:Reply-To', formatEmailAddress(input.replyTo));
      }

      const response = await fetcher(`${endpointBase}/${domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Mailgun email send failed: ${await response.text()}`);
      }

      const responseBody = (await response.json()) as MailgunResponse;

      return {
        provider: 'mailgun',
        id: responseBody.id,
      };
    },
  };
}

function appendRecipients(
  body: URLSearchParams,
  field: string,
  recipients: EmailRecipient | EmailRecipient[],
) {
  const values = Array.isArray(recipients) ? recipients : [recipients];

  for (const recipient of values) {
    body.append(field, formatEmailAddress(recipient));
  }
}
