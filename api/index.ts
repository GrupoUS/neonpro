// Vercel API Entry Point - Production Handler
// Runtime: Node.js 20.x (explicitly configured for Prisma + Supabase compatibility)

import { handle } from 'hono/vercel';
import app from '../apps/api/src/app';

// Export the Hono app as a Vercel-compatible handler
// This automatically configures the app for Node.js 20.x runtime
export default handle(app);
