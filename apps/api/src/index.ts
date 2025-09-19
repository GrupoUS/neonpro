import { serve } from '@hono/node-server';
import { initializeErrorTracking, shutdownErrorTracking } from './services/error-tracking-init';
import app from './app';

// This is the Node entrypoint for the API. In serverless/Vercel, we use files under vercel/.
const port = Number(process.env.PORT || 3005);

// Initialize error tracking before starting server
async function startServer() {
  try {
    // Initialize error tracking systems
    await initializeErrorTracking();
    console.log('✅ Error tracking initialized');
    
    if (process.env.VERCEL === undefined) {
      // Only start a local server when not running on Vercel
      serve({ fetch: app.fetch, port });
      // eslint-disable-next-line no-console
      console.log(`[api] listening on http://localhost:${port}`);
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔄 Received ${signal}, starting graceful shutdown...`);
  
  try {
    await shutdownErrorTracking();
    console.log('✅ Error tracking shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export default app;
