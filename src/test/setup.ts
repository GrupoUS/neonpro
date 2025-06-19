/**
 * Jest Test Setup Configuration
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 *
 * Global test setup for NEONPRO monitoring components testing
 * Configures testing environment, mocks, and utilities
 * Integrates with Task 1 (Production Monitoring Infrastructure), Task 2 (OpenTelemetry), and Task 3 (React Dashboard)
 */

import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/dashboard/monitoring";
  },
}));

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Activity: () => <div data-testid="activity-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Database: () => <div data-testid="database-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />,
  Server: () => <div data-testid="server-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Cpu: () => <div data-testid="cpu-icon" />,
  HardDrive: () => <div data-testid="hard-drive-icon" />,
  Network: () => <div data-testid="network-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  BellOff: () => <div data-testid="bell-off-icon" />,
  Archive: () => <div data-testid="archive-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

// Mock OpenTelemetry
jest.mock("@opentelemetry/api", () => ({
  trace: {
    getActiveTracer: jest.fn(() => ({
      startSpan: jest.fn(() => ({
        setAttributes: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      })),
    })),
    getTracer: jest.fn(() => ({
      startSpan: jest.fn(() => ({
        setAttributes: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      })),
    })),
  },
  context: {
    active: jest.fn(),
  },
  SpanKind: {
    SERVER: 1,
    CLIENT: 2,
  },
  SpanStatusCode: {
    OK: 1,
    ERROR: 2,
  },
}));

// Mock monitoring infrastructure
jest.mock("@/lib/observability", () => ({
  neonproObservability: {
    recordMetric: jest.fn(),
    traceAppointmentFlow: jest.fn(),
    traceTreatmentFlow: jest.fn(),
    traceAIRecommendation: jest.fn(),
    tracePaymentFlow: jest.fn(),
    traceDatabaseOperation: jest.fn(),
  },
  initializeNEONPROObservability: jest.fn(),
  traceClinicWorkflow: jest.fn(),
  recordClinicMetric: jest.fn(),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for file downloads
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for download functionality
const originalCreateElement = document.createElement;
document.createElement = jest.fn().mockImplementation((tagName) => {
  if (tagName === "a") {
    return {
      href: "",
      download: "",
      click: jest.fn(),
      style: {},
    };
  }
  return originalCreateElement.call(document, tagName);
});

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Set up fake timers for testing time-dependent functionality
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
