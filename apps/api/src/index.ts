import { serve } from '@hono/node-server';
import app from './app.js';

// This is the Node entrypoint for the API. In serverless/Vercel, we use files under vercel/.
const port = Number(process.env.PORT || 3005);

if (process.env.VERCEL === undefined) {
  // Only start a local server when not running on Vercel
  serve({ fetch: app.fetch, port });
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
}

export default app;
