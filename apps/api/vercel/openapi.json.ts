// Vercel API OpenAPI JSON Endpoint
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
    openapi: '3.0.0',
    info: {
      title: 'NeonPro API',
      version: '2.0.0',
      description: 'Fresh deployment API - caching issues resolved',
    },
    servers: [
      {
        url: 'https://neonpro-v2-6udn92859-grupous-projects.vercel.app/api',
        description: 'Production server (fresh deployment)',
      },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check endpoint',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      message: { type: 'string' },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/health': {
        get: {
          summary: 'API v1 health check endpoint',
          responses: {
            '200': {
              description: 'API v1 is healthy',
            },
          },
        },
      },
    },
  });
}
