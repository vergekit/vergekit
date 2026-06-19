import type {
  SendMailOptions,
  Transporter,
  TransportOptions,
} from 'nodemailer';
import {
  formatEmailAddress,
  formatEmailRecipients,
  type EmailProvider,
  type SendEmailInput,
} from '../types';

export interface NodeSmtpEmailProviderOptions {
  transport?: Pick<Transporter, 'sendMail'>;
  transportOptions?: TransportOptions;
}

export async function createNodeSmtpEmailProvider({
  transport,
  transportOptions,
}: NodeSmtpEmailProviderOptions = {}): Promise<EmailProvider> {
  const smtpTransport =
    transport ?? (await createNodemailerTransport(transportOptions));

  return {
    async send(input: SendEmailInput) {
      const message: SendMailOptions = {
        to: formatEmailRecipients(input.to),
        from: formatEmailAddress(input.from),
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo ? formatEmailAddress(input.replyTo) : undefined,
      };
      const result = await smtpTransport.sendMail(message);

      return {
        provider: 'smtp-node',
        id: result.messageId,
      };
    },
  };
}

async function createNodemailerTransport(transportOptions?: TransportOptions) {
  const nodemailer = await import('nodemailer');

  return nodemailer.createTransport(transportOptions);
}
