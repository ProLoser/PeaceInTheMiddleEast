import * as Sentry from "@sentry/react";

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

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
  // Filter out localhost errors - best practice for Sentry
  beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint): Sentry.ErrorEvent | null {
    // Check if the error originated from localhost or private network
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' 
      || hostname === '127.0.0.1'
      || hostname.startsWith('192.168.')
      || hostname.startsWith('10.')
      || hostname.startsWith('172.16.')
      || hostname.startsWith('172.17.')
      || hostname.startsWith('172.18.')
      || hostname.startsWith('172.19.')
      || hostname.startsWith('172.2')
      || hostname.startsWith('172.30.')
      || hostname.startsWith('172.31.')
      || hostname.endsWith('.local');
    
    if (isLocalhost) {
      // Don't send localhost errors to Sentry
      if (import.meta.env.DEV) {
        console.warn('Sentry: Error filtered (localhost):', hint.originalException || hint.syntheticException);
      }
      return null;
    }
    
    return event;
  },
});


window.dataLayer = window.dataLayer || [];
function gtag(_name: string, _data: any) { window.dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'G-NKGPNTLDF1');