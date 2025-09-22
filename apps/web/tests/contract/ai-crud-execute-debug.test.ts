import { describe, expect, it } from 'vitest';
import { executeCrudOperation } from '../utils/crud-test-utils';

describe('AI CRUD Execute API Debug Test', () => {
  it('should debug actual API response structure', async () => {
    // ARRANGE: Create a minimal valid request
    const request = {
      confirmId: 'confirm-123',
      executionToken: 'execution-token-456',
      operation: {
        entity: 'patients',
        action: 'create',
        data: {
          name: 'Test Patient',
          email: 'test@example.com',
        },
      },
    };

    // ACT: Make request to execute CRUD endpoint
    const response = await executeCrudOperation(_request

    // ASSERT: Debug the actual response structure
    console.log('Full API Response:', JSON.stringify(response, null, 2)

    // Just check it's not empty
    expect(response).toBeDefined(
  }

  it('should debug error response structure', async () => {
    // ARRANGE: Create an invalid request to see error structure
    const invalidRequest = {
      confirmId: 'confirm-123',
      // Missing executionToken and operation
    };

    // ACT: Make invalid request to see error response
    try {
      await executeCrudOperation(invalidRequest
    } catch (error) {
      console.log('Error Response:', JSON.stringify(error, null, 2)
      expect(error).toBeDefined(
    }
  }

  it('should debug XSS sanitization', async () => {
    // ARRANGE: Create request with XSS payload
    const xssRequest = {
      confirmId: 'confirm-123',
      executionToken: 'execution-token-456',
      operation: {
        entity: 'patients',
        action: 'create',
        data: {
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
        },
      },
    };

    // ACT: Make request with XSS payload
    const response = await executeCrudOperation(xssRequest

    // ASSERT: Debug what actually happens with XSS
    console.log('XSS Response:', JSON.stringify(response, null, 2)
    expect(response).toBeDefined(
  }
}
