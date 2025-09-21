import { describe, expect, it } from 'vitest';
import { makeAbsoluteUrl } from '../utils/test-config';

describe('Financial Metrics API Debug Test', () => {
  it('should debug API response structure', async () => {
    // ARRANGE: Setup test data
    const type = 'all';
    const timeframe = '30d';

    // ACT: Make request to financial metrics endpoint
    const response = await fetch(
      makeAbsoluteUrl(`/api/financial/metrics?type=${type}&timeframe=${timeframe}`),
    );

    // ASSERT: Debug the actual response structure
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    // Just check it's not empty
    expect(data).toBeDefined();
  });
});
