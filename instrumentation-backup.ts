// This file is used to initialize instrumentation in Next.js 15
// Sentry temporarily disabled for CRM development phase

export async function register() {
  // Sentry instrumentation disabled for development
  console.log("Instrumentation: Ready (Sentry disabled)");
}

// Request error handling disabled for now
// Will be re-enabled when Sentry is properly configured
