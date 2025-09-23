import { afterAll } from 'vitest';
import { server } from './global-setup';

afterAll(() => {
  // Clean up MSW server
  server.close();
  
  // Clean up any global mocks
  if (global.ResizeObserver) {
    delete global.ResizeObserver;
  }
  
  if (global.IntersectionObserver) {
    delete global.IntersectionObserver;
  }
  
  // Reset all mocks
  vi.clearAllMocks();
  vi.resetAllMocks();
  
  console.log('🧪 Test environment teardown complete');
});