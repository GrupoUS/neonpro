import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Setup DOM environment before tests
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
});

// Mock localStorage for JSDOM
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key]),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
  length: 0,
  key: vi.fn((index: number) => Object.keys(store)[index]),
};

// Use Object.defineProperty to set localStorage
Object.defineProperty(dom.window, 'localStorage', {
  value: localStorageMock,
  writable: false,
  configurable: true,
});

Object.defineProperty(dom.window, 'sessionStorage', {
  value: localStorageMock,
  writable: false,
  configurable: true,
});

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;
globalThis.document = dom.window.document;
globalThis.window = dom.window.window;
globalThis.navigator = dom.window.navigator;
globalThis.localStorage = localStorageMock;
globalThis.sessionStorage = localStorageMock;

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
    expect(localStorage.getItem('test')).toBeUndefined();
  });

  it('should show global objects are accessible', () => {
    console.log('Global objects:', {
      document: typeof global.document !== 'undefined' ? 'document exists' : 'document undefined',
      window: typeof global.window !== 'undefined' ? 'window exists' : 'window undefined',
      global: typeof global !== 'undefined' ? 'global exists' : 'global undefined',
      globalThis: typeof globalThis !== 'undefined' ? 'globalThis exists' : 'globalThis undefined',
    });
  });
});