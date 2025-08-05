/**
 * @fileoverview Unit tests for SessionDashboard component
 * @version 1.0.0
 * @since 2024-12-01
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { SessionDashboard } from "@/components/admin/sessions/SessionDashboard";
import { useDeviceManagement, useSecurityEvents, useSession } from "@/hooks/useSession";
import type { SecurityEvent, SessionData } from "@/types/session";

// Mock hooks
vi.mock("@/hooks/useSession");
const mockUseSession = useSession as Mock;
const mockUseSecurityEvents = useSecurityEvents as Mock;
const mockUseDeviceManagement = useDeviceManagement as Mock;

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock data
const mockSessionData: SessionData = {
  id: "session-123",
  userId: "user-123",
  deviceId: "device-123",
  sessionToken: "token-123",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  isActive: true,
  expiresAt: new Date(Date.now() + 3600000),
  lastActivity: new Date(),
  activityCount: 1,
  securityFlags: {},
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSecurityEvent: SecurityEvent = {
  id: "event-123",
  userId: "user-123",
  sessionId: "session-123",
  eventType: "unusual_location",
  severity: "medium",
  ipAddress: "192.168.1.1",
  details: { location: "Unknown" },
  resolved: false,
  timestamp: new Date(),
  createdAt: new Date(),
};

const mockDevice = {
  id: "device-123",
  fingerprint: "device-fingerprint-123",
  name: "Test Device",
  type: "desktop",
  os: "Windows 10",
  browser: "Chrome",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  trustLevel: "trusted",
  status: "active",
  firstSeen: new Date(),
  lastSeen: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("SessionDashboard", () => {
  const defaultProps = {
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSession hook
    mockUseSession.mockReturnValue({
      sessions: [mockSessionData],
      activeSessions: [mockSessionData],
      loading: false,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    // Mock useSecurityEvents hook
    mockUseSecurityEvents.mockReturnValue({
      events: [mockSecurityEvent],
      unresolvedEvents: [mockSecurityEvent],
      loading: false,
      error: null,
      logEvent: vi.fn(),
      resolveEvent: vi.fn(),
      refreshEvents: vi.fn(),
    });

    // Mock useDeviceManagement hook
    mockUseDeviceManagement.mockReturnValue({
      devices: [mockDevice],
      trustedDevices: [mockDevice],
      suspiciousDevices: [],
      loading: false,
      error: null,
      updateTrustLevel: vi.fn(),
      refreshDevices: vi.fn(),
    });
  });

  it("should render dashboard with all sections", () => {
    render(<SessionDashboard {...defaultProps} />);

    expect(screen.getByText("Session Management Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Monitor and manage user sessions, security events, and device access"),
    ).toBeInTheDocument();

    // Check for tabs
    expect(screen.getByTestId("tab-overview")).toBeInTheDocument();
    expect(screen.getByTestId("tab-sessions")).toBeInTheDocument();
    expect(screen.getByTestId("tab-security")).toBeInTheDocument();
    expect(screen.getByTestId("tab-devices")).toBeInTheDocument();
  });

  it("should display session statistics in overview", () => {
    render(<SessionDashboard {...defaultProps} />);

    expect(screen.getByText("Active Sessions")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Security Events")).toBeInTheDocument();
    expect(screen.getByText("Trusted Devices")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseSession.mockReturnValue({
      sessions: [],
      activeSessions: [],
      loading: true,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    expect(screen.getByText("Loading session data...")).toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseSession.mockReturnValue({
      sessions: [],
      activeSessions: [],
      loading: false,
      error: "Failed to load sessions",
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText("Failed to load sessions")).toBeInTheDocument();
  });

  it("should display session details in sessions tab", () => {
    render(<SessionDashboard {...defaultProps} />);

    // Switch to sessions tab
    fireEvent.click(screen.getByTestId("tab-sessions"));

    expect(screen.getByText("session-123")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should display security events in security tab", () => {
    render(<SessionDashboard {...defaultProps} />);

    // Switch to security tab
    fireEvent.click(screen.getByTestId("tab-security"));

    expect(screen.getByText("event-123")).toBeInTheDocument();
    expect(screen.getByText("unusual_location")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("should display devices in devices tab", () => {
    render(<SessionDashboard {...defaultProps} />);

    // Switch to devices tab
    fireEvent.click(screen.getByTestId("tab-devices"));

    expect(screen.getByText("Test Device")).toBeInTheDocument();
    expect(screen.getByText("desktop")).toBeInTheDocument();
    expect(screen.getByText("Windows 10")).toBeInTheDocument();
  });

  it("should handle session termination", async () => {
    const mockTerminateSession = vi.fn().mockResolvedValue({ success: true });
    mockUseSession.mockReturnValue({
      sessions: [mockSessionData],
      activeSessions: [mockSessionData],
      loading: false,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: mockTerminateSession,
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    // Switch to sessions tab
    fireEvent.click(screen.getByTestId("tab-sessions"));

    // Find and click terminate button
    const terminateButton = screen.getByText("Terminate");
    fireEvent.click(terminateButton);

    await waitFor(() => {
      expect(mockTerminateSession).toHaveBeenCalledWith("session-123");
    });
  });

  it("should handle security event resolution", async () => {
    const mockResolveEvent = vi.fn().mockResolvedValue({ success: true });
    mockUseSecurityEvents.mockReturnValue({
      events: [mockSecurityEvent],
      unresolvedEvents: [mockSecurityEvent],
      loading: false,
      error: null,
      logEvent: vi.fn(),
      resolveEvent: mockResolveEvent,
      refreshEvents: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    // Switch to security tab
    fireEvent.click(screen.getByTestId("tab-security"));

    // Find and click resolve button
    const resolveButton = screen.getByText("Resolve");
    fireEvent.click(resolveButton);

    await waitFor(() => {
      expect(mockResolveEvent).toHaveBeenCalledWith(
        "event-123",
        expect.any(String),
        expect.any(String),
      );
    });
  });

  it("should handle device trust level update", async () => {
    const mockUpdateTrustLevel = vi.fn().mockResolvedValue({ success: true });
    mockUseDeviceManagement.mockReturnValue({
      devices: [{ ...mockDevice, trustLevel: "unknown" }],
      trustedDevices: [],
      suspiciousDevices: [],
      loading: false,
      error: null,
      updateTrustLevel: mockUpdateTrustLevel,
      refreshDevices: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    // Switch to devices tab
    fireEvent.click(screen.getByTestId("tab-devices"));

    // Find and click trust button
    const trustButton = screen.getByText("Trust");
    fireEvent.click(trustButton);

    await waitFor(() => {
      expect(mockUpdateTrustLevel).toHaveBeenCalledWith("device-123", "trusted");
    });
  });

  it("should refresh data when refresh button is clicked", async () => {
    const mockRefreshSessions = vi.fn();
    const mockRefreshEvents = vi.fn();
    const mockRefreshDevices = vi.fn();

    mockUseSession.mockReturnValue({
      sessions: [mockSessionData],
      activeSessions: [mockSessionData],
      loading: false,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: mockRefreshSessions,
    });

    mockUseSecurityEvents.mockReturnValue({
      events: [mockSecurityEvent],
      unresolvedEvents: [mockSecurityEvent],
      loading: false,
      error: null,
      logEvent: vi.fn(),
      resolveEvent: vi.fn(),
      refreshEvents: mockRefreshEvents,
    });

    mockUseDeviceManagement.mockReturnValue({
      devices: [mockDevice],
      trustedDevices: [mockDevice],
      suspiciousDevices: [],
      loading: false,
      error: null,
      updateTrustLevel: vi.fn(),
      refreshDevices: mockRefreshDevices,
    });

    render(<SessionDashboard {...defaultProps} />);

    // Find and click refresh button
    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefreshSessions).toHaveBeenCalled();
      expect(mockRefreshEvents).toHaveBeenCalled();
      expect(mockRefreshDevices).toHaveBeenCalled();
    });
  });

  it("should show security alerts for unresolved events", () => {
    const highSeverityEvent = {
      ...mockSecurityEvent,
      id: "event-456",
      severity: "high" as const,
    };

    mockUseSecurityEvents.mockReturnValue({
      events: [mockSecurityEvent, highSeverityEvent],
      unresolvedEvents: [mockSecurityEvent, highSeverityEvent],
      loading: false,
      error: null,
      logEvent: vi.fn(),
      resolveEvent: vi.fn(),
      refreshEvents: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    // Should show alert for high severity events
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText(/high severity security events/i)).toBeInTheDocument();
  });

  it("should display correct session status badges", () => {
    const expiredSession = {
      ...mockSessionData,
      id: "session-456",
      isActive: false,
    };

    mockUseSession.mockReturnValue({
      sessions: [mockSessionData, expiredSession],
      activeSessions: [mockSessionData],
      loading: false,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    // Switch to sessions tab
    fireEvent.click(screen.getByTestId("tab-sessions"));

    // Should show different status badges
    const badges = screen.getAllByTestId("badge");
    expect(badges.some((badge) => badge.textContent === "Active")).toBe(true);
    expect(badges.some((badge) => badge.textContent === "Inactive")).toBe(true);
  });

  it("should handle empty states", () => {
    mockUseSession.mockReturnValue({
      sessions: [],
      activeSessions: [],
      loading: false,
      error: null,
      createSession: vi.fn(),
      updateActivity: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllSessions: vi.fn(),
      refreshSessions: vi.fn(),
    });

    mockUseSecurityEvents.mockReturnValue({
      events: [],
      unresolvedEvents: [],
      loading: false,
      error: null,
      logEvent: vi.fn(),
      resolveEvent: vi.fn(),
      refreshEvents: vi.fn(),
    });

    mockUseDeviceManagement.mockReturnValue({
      devices: [],
      trustedDevices: [],
      suspiciousDevices: [],
      loading: false,
      error: null,
      updateTrustLevel: vi.fn(),
      refreshDevices: vi.fn(),
    });

    render(<SessionDashboard {...defaultProps} />);

    expect(screen.getByText("No active sessions")).toBeInTheDocument();
    expect(screen.getByText("No security events")).toBeInTheDocument();
    expect(screen.getByText("No devices registered")).toBeInTheDocument();
  });
});
