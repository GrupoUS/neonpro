// Simple test endpoint to verify API functions are being deployed
export default async function handler(req: Request) {
  return new Response(JSON.stringify({
    message: "API function is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    source: "vercel-function"
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
