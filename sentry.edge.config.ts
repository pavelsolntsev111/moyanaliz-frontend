// Edge runtime Sentry init (middleware).
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "production",
    tracesSampleRate: 0.1,
  });
}
