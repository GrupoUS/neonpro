// Vercel API v1 Health Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return res.status(200).json({
    status: 'healthy',
    message: 'NeonPro API v1 health check',
    timestamp: new Date().toISOString(),
    version: 'v1',
    uptime: process.uptime(),
    method: req.method,
    path: '/api/v1/health',
    environment: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    },
  });
}
