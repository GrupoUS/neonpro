import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({
    ok: true,
    status: 'healthy',
    version: 'v1',
    ts: new Date().toISOString(),
    path: '/api/v1/health',
  })
}
