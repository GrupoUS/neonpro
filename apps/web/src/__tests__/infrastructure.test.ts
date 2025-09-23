import { describe, it, expect } from 'vitest';

describe('Test Infrastructure Validation', () => {
  it('should report test environment', () => {
    console.log('Environment check:', {
      document: typeof document !== 'undefined' ? 'document exists' : 'document undefined',
      window: typeof window !== 'undefined' ? 'window exists' : 'window undefined',
      navigator: typeof navigator !== 'undefined' ? 'navigator exists' : 'navigator undefined',
      localStorage: typeof localStorage !== 'undefined' ? 'localStorage exists' : 'localStorage undefined',
      global: typeof global !== 'undefined' ? 'global exists' : 'global undefined',
      globalThis: typeof globalThis !== 'undefined' ? 'globalThis exists' : 'globalThis undefined',
    });
  });

  it('should have access to DOM APIs', () => {
    expect(global.document).toBeDefined();
    expect(global.window).toBeDefined();
    expect(global.navigator).toBeDefined();
    expect(global.localStorage).toBeDefined();
    expect(global.sessionStorage).toBeDefined();
  });

  it('should have access to vitest globals', () => {
    expect(vi).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should have working DOM manipulation', () => {
    const div = document.createElement('div');
    div.textContent = 'Test';
    document.body.appendChild(div);
    
    const foundDiv = document.querySelector('div');
    expect(foundDiv).not.toBeNull();
    expect(foundDiv?.textContent).toBe('Test');
    
    // Cleanup
    document.body.removeChild(div);
  });

  it('should have working localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    localStorage.removeItem('test');
    expect(localStorage.getItem('test')).toBeNull();
  });
});