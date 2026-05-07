// Browser-side Sentry init.
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset — code can ship to staging
// before the DSN is provisioned.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "production",
    tracesSampleRate: 0.1,
    // Replay sessions only on errors (cheap on free tier).
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}
