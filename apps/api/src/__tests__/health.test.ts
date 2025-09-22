import { describe, expect, it } from 'vitest';
import app from '../app';

describe('API health endpoints',() => {
  it('GET /health returns ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200
    const json = await res.json(
    expect(json).toHaveProperty('status', 'ok')

  it('GET /docs/health returns docs status', async () => {
    const res = await app.request('/docs/health')
    expect(res.status).toBe(200
    const json = await res.json(
    expect(json).toHaveProperty('status', 'ok')
    expect(json).toHaveProperty('documentation', 'available')

  it('GET /unknown should produce 404 envelope', async () => {
    const res = await app.request('/does-not-exist')
    expect(res.status).toBe(404
    const json = await res.json(
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND')
