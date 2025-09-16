// Vercel API Health Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers with proper restrictions
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
    status: 'ok',
    message: 'NeonPro API v2 - Fresh deployment working!',
    timestamp: new Date().toISOString(),
    deployment: 'neonpro-v2',
    environment: process.env.NODE_ENV || 'production',
    method: req.method,
    path: '/api/health',
  };

  // Only include sensitive environment variable presence in development or internal health checks
  if (showInternalHealth) {
    healthData.hasSupabaseUrl = !!process.env.SUPABASE_URL;
    healthData.hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
    healthData.hasJwtSecret = !!process.env.JWT_SECRET;
    healthData.hasEncryptionKey = !!process.env.ENCRYPTION_KEY;
  }

  return res.status(200).json(healthData);
}
