import type { EmailProvider, SendEmailInput } from '../types';

export interface ConsoleEmailProviderOptions {
  info?: (message?: unknown, ...optionalParams: unknown[]) => void;
}

export function createConsoleEmailProvider(
  options: ConsoleEmailProviderOptions = {},
): EmailProvider {
  const info = options.info ?? console.info;

  return {
    async send(input: SendEmailInput) {
      info('[email:console]', input);

      return {
        provider: 'console',
        id: 'console',
      };
    },
  };
}
