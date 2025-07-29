import '@testing-library/jest-dom';

// Mock MediaStream
global.MediaStream = class MockMediaStream {
  getTracks() { return []; }
  getAudioTracks() { return []; }
  getVideoTracks() { return []; }
  addTrack() {}
  removeTrack() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
  clone() { return new MockMediaStream(); }
  active = true;
  id = 'mock-stream-id';
  onaddtrack = null;
  onremovetrack = null;
} as any;

// Mock MediaStreamTrack
global.MediaStreamTrack = class MockMediaStreamTrack {
  applyConstraints() { return Promise.resolve(); }
  clone() { return new MockMediaStreamTrack(); }
  getCapabilities() { return {}; }
  getConstraints() { return {}; }
  getSettings() { return {}; }
  stop() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
  enabled = true;
  id = 'mock-track-id';
  kind = 'video';
  label = 'mock track';
  muted = false;
  readyState = 'live';
  onended = null;
  onmute = null;
  onunmute = null;
} as any;

// Mock BarcodeDetector
global.BarcodeDetector = class MockBarcodeDetector {
  constructor() {}
  detect() { return Promise.resolve([]); }
  static getSupportedFormats() { return Promise.resolve(['qr_code', 'ean_13']); }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor(callback: any) {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  constructor(callback: any, options?: any) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
} as any;

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
  set: jest.fn(),
  get: jest.fn(),
  configurable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  value: jest.fn().mockResolvedValue(undefined),
  configurable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  value: jest.fn(),
  configurable: true,
});

// Mock canvas methods
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  drawImage: jest.fn(),
  getImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  }),
  putImageData: jest.fn(),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
});

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock Notification
global.Notification = class MockNotification {
  constructor(title: string, options?: any) {}
  static permission = 'granted';
  static requestPermission = jest.fn().mockResolvedValue('granted');
  onclick = null;
  onshow = null;
  onerror = null;
  onclose = null;
  close = jest.fn();
} as any;

// Mock window.open
global.open = jest.fn();

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((message, ...args) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is deprecated') ||
       message.includes('Warning: validateDOMNesting') ||
       message.includes('Warning: Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    originalConsoleError(message, ...args);
  });

  console.warn = jest.fn((message, ...args) => {
    if (
      typeof message === 'string' &&
      (message.includes('componentWillReceiveProps') ||
       message.includes('componentWillUpdate'))
    ) {
      return;
    }
    originalConsoleWarn(message, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});