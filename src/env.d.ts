/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    EMAIL_PROVIDER: string;
    EMAIL?: SendEmail;
    EMAIL_FROM?: string;
    EMAIL_REPLY_TO?: string;
    RESEND_API_KEY?: string;
    MAILGUN_API_KEY?: string;
    MAILGUN_DOMAIN?: string;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
  }
}

declare namespace App {
  interface Locals {
    user: import('@/auth/permissions').AppUser | null;
    session: (import('better-auth').Session & {
      impersonatedBy?: string | null;
    }) | null;
    isAuthenticated: boolean;
  }
}
