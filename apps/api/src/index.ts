import { createServer } from 'http';
import app from './app';
import { createWebSocketServer } from './middleware/websocket-server';
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
      const server = createServer(app);

      // Initialize WebSocket server for AG-UI Protocol
      const _wsServer = createWebSocketServer(server);

      server.listen(_port,_() => {
        secureLogger.info(`API server listening`, {
          port,
          url: `http://localhost:${port}`,
          component: 'server-startup',
        });
        secureLogger.info(`WebSocket server initialized for AG-UI Protocol`, {
          component: 'websocket-server',
        });
      });

      // Graceful shutdown for WebSocket server
      server.on(_'close',_() => {
        secureLogger.info('WebSocket server closed', { component: 'server-shutdown' });
      });
    }
  } catch (_error) {
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
  } catch (_error) {
    secureLogger.error('Error during shutdown', error, { component: 'server-shutdown' });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on(_'SIGTERM',_() => gracefulShutdown('SIGTERM'));
process.on(_'SIGINT',_() => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  secureLogger.error('Uncaught Exception', error, { component: 'server-error' });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on(_'unhandledRejection',_(reason,_promise) => {
  secureLogger.error('Unhandled Rejection', reason, {
    promise: promise.toString(),
    component: 'server-error',
  });
});

startServer();
