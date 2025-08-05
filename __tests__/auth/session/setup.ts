/**
 * Session Management System - Test Setup
 *
 * This file configures the testing environment for the session management system,
 * providing mocks, utilities, and test data for comprehensive testing.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { TextDecoder, TextEncoder } from "node:util";
import { jest } from "@jest/globals";
import "whatwg-fetch";

// Global test setup
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Mock crypto for Node.js environment
if (typeof globalThis.crypto === "undefined") {
  const { webcrypto } = require("node:crypto");
  globalThis.crypto = webcrypto as any;
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock navigator
Object.defineProperty(window, "navigator", {
  value: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    language: "en-US",
    languages: ["en-US", "en"],
    platform: "Win32",
    cookieEnabled: true,
    onLine: true,
  },
});

// Mock location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
  },
});

// Mock fetch
global.fetch = jest.fn();

// Test data factories
export const createMockSession = (overrides = {}) => ({
  id: "session-123",
  userId: "user-123",
  deviceId: "device-123",
  tokenHash: "hashed-token",
  status: "active" as const,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  lastActivity: new Date().toISOString(),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  metadata: {},
  ...overrides,
});

export const createMockDevice = (overrides = {}) => ({
  id: "device-123",
  userId: "user-123",
  fingerprint: "device-fingerprint-123",
  name: "Test Device",
  type: "desktop" as const,
  trusted: false,
  blocked: false,
  firstSeen: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  trustExpiresAt: null,
  userAgent: "Mozilla/5.0...",
  metadata: {},
  ...overrides,
});

export const createMockSecurityEvent = (overrides = {}) => ({
  id: "event-123",
  userId: "user-123",
  sessionId: "session-123",
  deviceId: "device-123",
  type: "login_attempt",
  severity: "medium" as const,
  description: "User login attempt",
  details: {
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    success: true,
  },
  resolved: false,
  resolvedAt: null,
  resolvedBy: null,
  createdAt: new Date().toISOString(),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: "notification-123",
  userId: "user-123",
  type: "security_alert",
  title: "Security Alert",
  message: "New device detected",
  data: {
    deviceId: "device-123",
    deviceName: "Unknown Device",
  },
  read: false,
  readAt: null,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  emailConfirmed: true,
  phone: null,
  phoneConfirmed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSignInAt: new Date().toISOString(),
  role: "authenticated",
  ...overrides,
});

// Test utilities
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

// Mock timers utility
export const mockTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
};

// Database test utilities
export const createTestDatabase = () => {
  const mockDb = {
    sessions: new Map(),
    devices: new Map(),
    securityEvents: new Map(),
    notifications: new Map(),
    users: new Map(),
  };

  const generateId = () => `test-${Math.random().toString(36).substr(2, 9)}`;

  return {
    // Session operations
    createSession: (data: any) => {
      const session = { id: generateId(), ...data };
      mockDb.sessions.set(session.id, session);
      return session;
    },

    getSession: (id: string) => mockDb.sessions.get(id),

    updateSession: (id: string, updates: any) => {
      const session = mockDb.sessions.get(id);
      if (session) {
        const updated = { ...session, ...updates };
        mockDb.sessions.set(id, updated);
        return updated;
      }
      return null;
    },

    deleteSession: (id: string) => mockDb.sessions.delete(id),

    // Device operations
    createDevice: (data: any) => {
      const device = { id: generateId(), ...data };
      mockDb.devices.set(device.id, device);
      return device;
    },

    getDevice: (id: string) => mockDb.devices.get(id),

    getUserDevices: (userId: string) => {
      return Array.from(mockDb.devices.values()).filter((device) => device.userId === userId);
    },

    // Security event operations
    createSecurityEvent: (data: any) => {
      const event = { id: generateId(), ...data };
      mockDb.securityEvents.set(event.id, event);
      return event;
    },

    getSecurityEvents: (userId: string) => {
      return Array.from(mockDb.securityEvents.values()).filter((event) => event.userId === userId);
    },

    // Notification operations
    createNotification: (data: any) => {
      const notification = { id: generateId(), ...data };
      mockDb.notifications.set(notification.id, notification);
      return notification;
    },

    getUserNotifications: (userId: string) => {
      return Array.from(mockDb.notifications.values()).filter(
        (notification) => notification.userId === userId,
      );
    },

    // Utility methods
    clear: () => {
      mockDb.sessions.clear();
      mockDb.devices.clear();
      mockDb.securityEvents.clear();
      mockDb.notifications.clear();
      mockDb.users.clear();
    },

    seed: () => {
      // Create test user
      const user = createMockUser();
      mockDb.users.set(user.id, user);

      // Create test session
      const session = createMockSession({ userId: user.id });
      mockDb.sessions.set(session.id, session);

      // Create test device
      const device = createMockDevice({ userId: user.id });
      mockDb.devices.set(device.id, device);

      // Create test security event
      const securityEvent = createMockSecurityEvent({
        userId: user.id,
        sessionId: session.id,
        deviceId: device.id,
      });
      mockDb.securityEvents.set(securityEvent.id, securityEvent);

      // Create test notification
      const notification = createMockNotification({ userId: user.id });
      mockDb.notifications.set(notification.id, notification);

      return {
        user,
        session,
        device,
        securityEvent,
        notification,
      };
    },
  };
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<any>, name: string) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);

  return { result, duration };
};

// Cleanup function for tests
export const cleanup = () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorageMock.clear();

  // Clear sessionStorage
  sessionStorageMock.clear();

  // Reset fetch mock
  (global.fetch as jest.Mock).mockReset();
};

// Global test cleanup
afterEach(() => {
  cleanup();
});

// Export test configuration
export const testConfig = {
  timeout: 10000, // 10 seconds
  retries: 2,
  verbose: process.env.NODE_ENV === "test",
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
};

export default {
  createMockSession,
  createMockDevice,
  createMockSecurityEvent,
  createMockNotification,
  createMockUser,
  createTestDatabase,
  waitFor,
  mockConsole,
  mockTimers,
  measurePerformance,
  cleanup,
  testConfig,
};
