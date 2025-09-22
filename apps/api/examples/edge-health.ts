// Edge Runtime Health Check Example
// Runtime: Edge (for ultra-fast global responses)

export const runtime = 'edge';
export const preferredRegion = 'auto';

export default async function handler(_request: Request) {
<<<<<<< HEAD
  const url = new URL(_request.url);
=======
  const url = new URL(request.url);
>>>>>>> origin/main
  const pathname = url.pathname;

  // Basic health check optimized for Edge runtime
  const healthData = {
    status: 'ok',
    message: 'NeonPro API Health Check (Edge Runtime)',
    timestamp: new Date().toISOString(),
    runtime: 'edge',
    region: process.env.VERCEL_REGION || 'auto',
    path: pathname,
    method: _request.method,

    // Edge runtime capabilities
    features: {
      streaming: true,
      globalDistribution: true,
      coldStart: process.env.EDGE_COLD_START || '<100ms',
      memoryLimit: process.env.EDGE_MEMORY_LIMIT || '128MB',
    },
  };

  return new Response(JSON.stringify(healthData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
