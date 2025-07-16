import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://b80f9fdaa62b4c4bc1481bc069202917@o4508232176304128.ingest.us.sentry.io/4509570123038720",
  release: VITE_VERSION,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    // Sentry.feedbackIntegration({
    //   // Additional SDK configuration goes in here, for example:
    //   colorScheme: "system",
    // }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});


window.dataLayer = window.dataLayer || [];
function gtag(name: string, data: any) { window.dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'G-NKGPNTLDF1');