import { render } from 'react-email';
import type {
  AuthEmailTemplateInput,
  CreateAuthEmailSenderFromEnvOptions,
  RenderedAuthEmail,
} from '@vergekit/core/email';
import * as React from 'react';
import { appConfig } from '@/config/app';
import ResetPasswordEmail from '@/email/auth/reset-password';
import VerifyEmail from '@/email/auth/verify-email';

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
  const component = React.createElement(VerifyEmail, props);

  return {
    subject: `Verify your ${appName} email`,
    html: await render(component),
    text: await render(component, { plainText: true }),
  };
}

export async function renderResetPasswordEmail({
  appName = appConfig.name,
  name,
  url,
}: RenderAppAuthEmailInput): Promise<RenderedAuthEmail> {
  const props = { appName, name, resetUrl: url };
  const component = React.createElement(ResetPasswordEmail, props);

  return {
    subject: `Reset your ${appName} password`,
    html: await render(component),
    text: await render(component, { plainText: true }),
  };
}
