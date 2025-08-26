// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: "https://35734fdad8e1c17f62ae3e547dd787d2@o4509529416728576.ingest.us.sentry.io/4509529439797248",

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,
	// Enable logs to be sent to Sentry
	enableLogs: true,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
