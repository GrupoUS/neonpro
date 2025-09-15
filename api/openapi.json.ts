import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const baseUrl = (() => {
    const fromEnv = process.env.API_URL;
    if (fromEnv) return fromEnv.startsWith('http') ? `${fromEnv}/api` : `https://${fromEnv}/api`;
    const host = req.headers.host ?? 'localhost:3000';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    return `${proto}://${host}/api`;
  })();

  const doc = {
    openapi: '3.0.0',
    info: {
      title: 'NeonPro API',
      version: '2.0.0',
      description: 'Minimal OpenAPI document for health endpoints',
    },
    servers: [
      { url: baseUrl, description: 'API Server' },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      status: { type: 'string' },
                      ts: { type: 'string', format: 'date-time' },
                      path: { type: 'string' },
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
          summary: 'v1 Health check',
          responses: { '200': { description: 'OK' } },
        },
      },
    },
  } as const;

  return res.status(200).json(doc);
}
