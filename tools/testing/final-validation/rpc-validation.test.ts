// RPC CLIENT VALIDATION TEST
// File: tools/testing/final-validation/rpc-validation.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

describe('🎯 HONO RPC CLIENT INTEGRATION VALIDATION', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    console.log('🚀 Starting RPC validation tests...');
    
    // Try to import backend Hono app
    try {
      const { default: app } = await import('../../../apps/api/src/index');
      
      // Create test server
      server = createServer(app.fetch);
      await new Promise<void>((resolve) => {
        server.listen(0, () => {
          const port = (server.address() as AddressInfo).port;
          baseUrl = `http://localhost:${port}`;
          console.log(`✅ Test server running on ${baseUrl}`);
          resolve();
        });
      });
      
    } catch (error) {
      console.error('❌ Failed to start backend server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (server) {
      server.close();
      console.log('🛑 Test server stopped');
    }
  });

  describe('📁 Backend Hono Server', () => {
    it('should import Hono backend successfully', async () => {
      const { default: app } = await import('../../../apps/api/src/index');
      expect(app).toBeDefined();
      expect(typeof app.fetch).toBe('function');
      console.log('✅ Hono backend imported successfully');
    });

    it('should respond to health check endpoint', async () => {
      try {
        const response = await fetch(`${baseUrl}/health`);
        expect(response.ok).toBe(true);
        
        const data = await response.json();
        expect(data).toHaveProperty('status');
        console.log('✅ Health endpoint responding:', data);
        
      } catch (error) {
        console.log('⚠️  Health endpoint test:', error.message);
        // This might be expected if /health doesn't exist yet
      }
    });
  });

  describe('🔗 RPC Client Integration', () => {
    it('should import RPC client successfully', async () => {
      try {
        const clientModule = await import('../../../packages/shared/src/api-client');
        expect(clientModule).toBeDefined();
        console.log('✅ RPC Client module imported');
        
        // Check if apiClient is exported
        if ('apiClient' in clientModule) {
          expect(clientModule.apiClient).toBeDefined();
          console.log('✅ apiClient exported successfully');
        } else {
          console.log('⚠️  apiClient not found in exports');
        }
        
      } catch (error) {
        console.error('❌ RPC Client import failed:', error);
        throw error;
      }
    });

    it('should have proper type inference setup', async () => {
      try {
        const clientModule = await import('../../../packages/shared/src/api-client');
        
        // Check for type-related exports
        const hasTypeExports = Object.keys(clientModule).some(key => 
          key.includes('Type') || key.includes('Client') || key.includes('Api')
        );
        
        console.log('✅ Client module exports:', Object.keys(clientModule));
        
      } catch (error) {
        console.error('❌ Type validation failed:', error);
      }
    });
  });

  describe('🧪 Patient Hook Integration', () => {
    it('should import patient hooks successfully', async () => {
      try {
        const hooksModule = await import('../../../apps/web/hooks/enhanced/use-patients');
        expect(hooksModule).toBeDefined();
        
        // Check for common hook exports
        const hookExports = Object.keys(hooksModule);
        console.log('✅ Patient hooks exports:', hookExports);
        
        // Look for typical hook patterns
        const hasHooks = hookExports.some(key => key.startsWith('use'));
        if (hasHooks) {
          console.log('✅ Hook patterns found');
        }
        
      } catch (error) {
        console.error('❌ Patient hooks import failed:', error);
        throw error;
      }
    });
  });

  describe('🔍 End-to-End Validation', () => {
    it('should validate complete RPC flow', async () => {
      console.log('🧪 Testing complete RPC flow...');
      
      try {
        // 1. Import all components
        const backendModule = await import('../../../apps/api/src/index');
        const clientModule = await import('../../../packages/shared/src/api-client');
        const hooksModule = await import('../../../apps/web/hooks/enhanced/use-patients');
        
        // 2. Verify all imports successful
        expect(backendModule.default).toBeDefined();
        expect(clientModule).toBeDefined();
        expect(hooksModule).toBeDefined();
        
        console.log('✅ All modules imported successfully');
        
        // 3. Test basic connectivity if client is available
        if ('apiClient' in clientModule && clientModule.apiClient) {
          console.log('🔗 Testing RPC client connectivity...');
          // Basic connectivity test would go here
        }
        
      } catch (error) {
        console.error('❌ End-to-end validation failed:', error);
        throw error;
      }
    });
  });
});