import { app } from '../apps/api/src/app';

// Export the Hono app for Vercel function deployment
// This creates a dedicated function for the OpenAPI endpoint
export default app;
