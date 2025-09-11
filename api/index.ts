import { app } from '../apps/api/src/app';

// Per Vercel’s Hono guide, export the Hono app as the default export.
// Vercel will treat routes defined on this app as Functions automatically.
export default app;
