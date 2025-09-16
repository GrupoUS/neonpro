// Vercel API v1 Health Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers with proper origin whitelisting
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://neonpro.vercel.app'];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  const showInternalHealth = isDevelopment || process.env.INTERNAL_HEALTH === 'true';

  const healthData: any = {
    status: 'healthy',
    message: 'NeonPro API v1 health check',
    timestamp: new Date().toISOString(),
    version: 'v1',
    uptime: process.uptime(),
    method: req.method,
    path: '/api/v1/health',
  };

  // Only include sensitive environment info in development or when internal health flag is set
  if (showInternalHealth) {
    healthData.environment = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    };
  }

  return res.status(200).json(healthData);
}
