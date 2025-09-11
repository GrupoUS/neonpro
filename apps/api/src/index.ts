import app from './app';

// Development server for local runs
if (process.env.NODE_ENV === 'development') {
  // Lazy import to avoid bundling into serverless handler
  import('@hono/node-server').then(({ serve }) => {
    const port = Number.parseInt(process.env.PORT || '3004', 10);
    serve({ fetch: app.fetch, port });
    // eslint-disable-next-line no-console
    console.log(`[api] Hono listening on http://localhost:${port}`);
  });
}

export default app;
