import { render, renderText } from '@backstro/email/render';
import type {
  AuthEmailTemplateInput,
  CreateAuthEmailSenderFromEnvOptions,
  RenderedAuthEmail,
} from '@vergekit/core/email';
import { appConfig } from '@/config/app';
import ResetPasswordEmail from './templates/reset-password.astro';
import VerifyEmail from './templates/verify-email.astro';

export interface RenderAppAuthEmailInput extends AuthEmailTemplateInput {
  appName?: string;
}

export function createAuthEmailSenderOptions(): Pick<
  CreateAuthEmailSenderFromEnvOptions,
  'fallbackFromName' | 'renderVerificationEmail' | 'renderResetPasswordEmail'
> {
  return {
    fallbackFromName: appConfig.name,
    renderVerificationEmail: renderVerifyEmail,
    renderResetPasswordEmail: renderResetPasswordEmail,
  };
}

export async function renderVerifyEmail({
  appName = appConfig.name,
  name,
  url,
}: RenderAppAuthEmailInput): Promise<RenderedAuthEmail> {
  const props = { appName, name, verificationUrl: url };

  return {
    subject: `Verify your ${appName} email`,
    html: await render(VerifyEmail, props),
    text: await renderText(VerifyEmail, props),
  };
}

export async function renderResetPasswordEmail({
  appName = appConfig.name,
  name,
  url,
}: RenderAppAuthEmailInput): Promise<RenderedAuthEmail> {
  const props = { appName, name, resetUrl: url };

  return {
    subject: `Reset your ${appName} password`,
    html: await render(ResetPasswordEmail, props),
    text: await renderText(ResetPasswordEmail, props),
  };
}
