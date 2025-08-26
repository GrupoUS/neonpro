// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://35734fdad8e1c17f62ae3e547dd787d2@o4509529416728576.ingest.us.sentry.io/4509529439797248",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  sendDefaultPii: true,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Import with `import * as Sentry from "@sentry/nextjs"` if you are using ESM

  integrations: [
    // Add the Vercel AI SDK integration to config.server.(js/ts)
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
  ],
});
