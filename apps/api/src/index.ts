import { serve } from '@hono/node-server';
import app from './app';
import { initializeErrorTracking, shutdownErrorTracking } from './services/error-tracking-init';
import { secureLogger } from './utils/secure-logger';

// This is the Node entrypoint for the API. In serverless/Vercel, we use files under vercel/.
const port = Number(process.env.PORT || 3005);

// Initialize error tracking before starting server
async function startServer() {
  try {
    // Initialize error tracking systems
    await initializeErrorTracking();
    secureLogger.info('Error tracking initialized', { component: 'server-startup' });

    if (process.env.VERCEL === undefined) {
      // Only start a local server when not running on Vercel
      serve({ fetch: app.fetch, port });
      secureLogger.info(`API server listening`, {
        port,
        url: `http://localhost:${port}`,
        component: 'server-startup',
      });
    }
  } catch (error) {
    secureLogger.error('Failed to start server', error, { component: 'server-startup' });
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  secureLogger.info('Starting graceful shutdown', { signal, component: 'server-shutdown' });

  try {
    await shutdownErrorTracking();
    secureLogger.info('Error tracking shutdown complete', { component: 'server-shutdown' });
    process.exit(0);
  } catch (error) {
    secureLogger.error('Error during shutdown', error, { component: 'server-shutdown' });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  secureLogger.error('Uncaught Exception', error, { component: 'server-error' });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  secureLogger.error('Unhandled Rejection', reason, {
    promise: promise.toString(),
    component: 'server-error',
  });
});

startServer();
