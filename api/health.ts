// Vercel API Health Endpoint
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
    status: 'ok',
    message: 'NeonPro API v2 - Fresh deployment working!',
    timestamp: new Date().toISOString(),
    deployment: 'neonpro-v2',
    environment: process.env.NODE_ENV || 'production',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    method: req.method,
    path: '/api/health',
  });
}
