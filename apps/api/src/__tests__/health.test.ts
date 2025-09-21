import { describe, expect, it } from 'vitest';
import app from '../app';

describe(_'API health endpoints',_() => {
  it(_'GET /health returns ok',_async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('status', 'ok');
  });

  it(_'GET /docs/health returns docs status',_async () => {
    const res = await app.request('/docs/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('documentation', 'available');
  });

  it(_'GET /unknown should produce 404 envelope',_async () => {
    const res = await app.request('/does-not-exist');
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});
