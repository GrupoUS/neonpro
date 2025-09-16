import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';

// Minimal Hono app to ensure successful build while advanced routes are stubbed
const app = new Hono();

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://neonpro.vercel.app',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-Request-ID'],
  }),
);

// Global error handler
app.use('*', errorHandler);

// Basic health endpoints
app.get('/health', c => c.json({ status: 'ok' }));

app.get('/v1/health', c =>
  c.json({
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: {
      isProduction: process.env.NODE_ENV === 'production',
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.SUPABASE_URL,
      version: process.env.npm_package_version,
      region: process.env.VERCEL_REGION,
    },
  }),
);

app.get('/v1/info', c =>
  c.json({
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
  }),
);

export default app;
