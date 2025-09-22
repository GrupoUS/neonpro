import { describe, expect, it } from 'vitest';

describe(_'Simple Create Route Test'), () => {
  it(_'should create simple working route',async () => {
    // Use real Hono directly without OpenAPIHono
    const { Hono } = await import('hono');

    const app = new Hono();

    // Simple route without middleware
    app.post('/', async c => {
      return c.json(
        {
          success: true,
          message: 'Simple route works',
        },
        201,
      );
    });

    const mockRequest = {
      method: 'POST',
      url: '/',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: '{}',
    };

    const response = await app.request(mockRequest);

    // Debug raw response
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    console.log('Response status:', response.status);

    // Try parsing
    const data = JSON.parse(responseText);

    console.log('Simple test response:', data);
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
