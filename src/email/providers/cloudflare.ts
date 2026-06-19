import type { EmailProvider, EmailRecipient, SendEmailInput } from '../types';

export type CloudflareEmailBinding = Pick<SendEmail, 'send'>;

export function createCloudflareEmailProvider(
  binding: CloudflareEmailBinding,
): EmailProvider {
  return {
    async send(input: SendEmailInput) {
      const result = await binding.send({
        to: toCloudflareRecipients(input.to),
        from: toCloudflareAddress(input.from),
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo ? toCloudflareAddress(input.replyTo) : undefined,
      });

      return {
        provider: 'cloudflare',
        id: result.messageId,
      };
    },
  };
}

function toCloudflareRecipients(recipients: EmailRecipient | EmailRecipient[]) {
  if (Array.isArray(recipients)) {
    return recipients.map(toCloudflareAddress);
  }

  return toCloudflareAddress(recipients);
}

function toCloudflareAddress(address: EmailRecipient): string | EmailAddress {
  if (typeof address === 'string') {
    return address;
  }

  if (!address.name?.trim()) {
    return address.email;
  }

  return {
    email: address.email,
    name: address.name,
  };
}
