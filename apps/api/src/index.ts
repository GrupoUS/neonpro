import app from './app';

// Development server for local runs using Bun's native server
// Bun.serve() configuration for development with hot reload support
const port = Number.parseInt(process.env.PORT || '3004', 10);

if (process.env.NODE_ENV === 'development') {
  console.log(`Started development server: http://localhost:${port}`);
}

// Export Bun server config in development, Hono app otherwise
export default process.env.NODE_ENV === 'development'
  ? {
      port,
      fetch: app.fetch,
    }
  : app;
