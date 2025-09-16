export default function handler(_: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({ ok: true, status: 'ok', ts: new Date().toISOString(), path: '/api/health' })
  );
}
