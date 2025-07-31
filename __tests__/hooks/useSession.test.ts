/**
 * @fileoverview Unit tests for useSession hooks
 * @version 1.0.0
 * @since 2024-12-01
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSession, useSecurityEvents, useDeviceManagement } from '@/hooks/useSession';
import { SessionManager } from '@/lib/auth/session';
import type { SessionData, SecurityEvent, DeviceInfo } from '@/types/session';

// Mock SessionManager
vi.mock('@/lib/auth/session');
const MockSessionManager = SessionManager as Mock;

// Mock data
const mockSessionData: SessionData = {
  id: 'session-123',
  userId: 'user-123',
  deviceId: 'device-123',
  sessionToken: 'token-123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  isActive: true,
  expiresAt: new Date(Date.now() + 3600000),
  lastActivity: new Date(),
  activityCount: 1,
  securityFlags: {},
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockSecurityEvent: SecurityEvent = {
  id: 'event-123',
  userId: 'user-123',
  sessionId: 'session-123',
  eventType: 'unusual_location',
  severity: 'medium',
  ipAddress: '192.168.1.1',
  details: { location: 'Unknown' },
  resolved: false,
  timestamp: new Date(),
  createdAt: new Date()
};

const mockDevice: DeviceInfo = {
  fingerprint: 'device-fingerprint-123',
  name: 'Test Device',
  type: 'desktop',
  os: 'Windows 10',
  browser: 'Chrome',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

describe('useSession', () => {
  let mockSessionManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSessionManager = {
      getUserSessions: vi.fn(),
      createSession: vi.fn(),
      updateSession: vi.fn(),
      terminateSession: vi.fn(),
      terminateAllUserSessions: vi.fn(),
      detectSuspiciousActivity: vi.fn(),
      applySessionPolicies: vi.fn()
    };
    
    MockSessionManager.mockImplementation(() => mockSessionManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSession('user-123'));
    
    expect(result.current.sessions).toEqual([]);
    expect(result.current.activeSessions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load user sessions on mount', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData]
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.sessions).toEqual([mockSessionData]);
    expect(result.current.activeSessions).toEqual([mockSessionData]);
    expect(mockSessionManager.getUserSessions).toHaveBeenCalledWith('user-123');
  });

  it('should handle loading error', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: false,
      error: 'Failed to load sessions'
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Failed to load sessions');
    expect(result.current.sessions).toEqual([]);
  });

  it('should create new session', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: []
    });
    mockSessionManager.createSession.mockResolvedValue({
      success: true,
      data: mockSessionData
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.createSession(mockDevice, '192.168.1.1');
    });
    
    expect(mockSessionManager.createSession).toHaveBeenCalledWith(
      'user-123',
      mockDevice,
      '192.168.1.1',
      undefined
    );
  });

  it('should update session activity', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData]
    });
    mockSessionManager.updateSession.mockResolvedValue({
      success: true,
      data: { ...mockSessionData, activityCount: 2 }
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.updateActivity('session-123');
    });
    
    expect(mockSessionManager.updateSession).toHaveBeenCalledWith(
      'session-123',
      expect.objectContaining({
        lastActivity: expect.any(Date),
        activityCount: expect.any(Number)
      })
    );
  });

  it('should terminate session', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData]
    });
    mockSessionManager.terminateSession.mockResolvedValue({
      success: true,
      data: { ...mockSessionData, isActive: false }
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.terminateSession('session-123');
    });
    
    expect(mockSessionManager.terminateSession).toHaveBeenCalledWith('session-123');
  });

  it('should terminate all sessions', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData]
    });
    mockSessionManager.terminateAllUserSessions.mockResolvedValue({
      success: true,
      data: 1
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.terminateAllSessions();
    });
    
    expect(mockSessionManager.terminateAllUserSessions).toHaveBeenCalledWith('user-123');
  });

  it('should refresh sessions', async () => {
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData]
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.refreshSessions();
    });
    
    expect(mockSessionManager.getUserSessions).toHaveBeenCalledTimes(2);
  });

  it('should filter active sessions correctly', async () => {
    const inactiveSession = { ...mockSessionData, id: 'session-456', isActive: false };
    mockSessionManager.getUserSessions.mockResolvedValue({
      success: true,
      data: [mockSessionData, inactiveSession]
    });
    
    const { result } = renderHook(() => useSession('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.activeSessions).toHaveLength(1);
    expect(result.current.activeSessions[0].id).toBe('session-123');
  });
});

describe('useSecurityEvents', () => {
  let mockSessionManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSessionManager = {
      getSecurityEvents: vi.fn(),
      logSecurityEvent: vi.fn(),
      resolveSecurityEvent: vi.fn()
    };
    
    MockSessionManager.mockImplementation(() => mockSessionManager);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSecurityEvents('user-123'));
    
    expect(result.current.events).toEqual([]);
    expect(result.current.unresolvedEvents).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load security events on mount', async () => {
    mockSessionManager.getSecurityEvents.mockResolvedValue({
      success: true,
      data: [mockSecurityEvent]
    });
    
    const { result } = renderHook(() => useSecurityEvents('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.events).toEqual([mockSecurityEvent]);
    expect(result.current.unresolvedEvents).toEqual([mockSecurityEvent]);
    expect(mockSessionManager.getSecurityEvents).toHaveBeenCalledWith('user-123', {});
  });

  it('should apply filters', async () => {
    const filters = { severity: 'high', resolved: false };
    mockSessionManager.getSecurityEvents.mockResolvedValue({
      success: true,
      data: []
    });
    
    const { result } = renderHook(() => useSecurityEvents('user-123', filters));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(mockSessionManager.getSecurityEvents).toHaveBeenCalledWith('user-123', filters);
  });

  it('should log security event', async () => {
    mockSessionManager.getSecurityEvents.mockResolvedValue({
      success: true,
      data: []
    });
    mockSessionManager.logSecurityEvent.mockResolvedValue({
      success: true,
      data: mockSecurityEvent
    });
    
    const { result } = renderHook(() => useSecurityEvents('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.logEvent({
        userId: 'user-123',
        eventType: 'unusual_location',
        severity: 'medium',
        ipAddress: '192.168.1.1',
        details: { location: 'Unknown' }
      });
    });
    
    expect(mockSessionManager.logSecurityEvent).toHaveBeenCalled();
  });

  it('should resolve security event', async () => {
    mockSessionManager.getSecurityEvents.mockResolvedValue({
      success: true,
      data: [mockSecurityEvent]
    });
    mockSessionManager.resolveSecurityEvent.mockResolvedValue({
      success: true,
      data: { ...mockSecurityEvent, resolved: true }
    });
    
    const { result } = renderHook(() => useSecurityEvents('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.resolveEvent('event-123', 'admin-123', 'False positive');
    });
    
    expect(mockSessionManager.resolveSecurityEvent).toHaveBeenCalledWith(
      'event-123',
      'admin-123',
      'False positive'
    );
  });

  it('should filter unresolved events correctly', async () => {
    const resolvedEvent = { ...mockSecurityEvent, id: 'event-456', resolved: true };
    mockSessionManager.getSecurityEvents.mockResolvedValue({
      success: true,
      data: [mockSecurityEvent, resolvedEvent]
    });
    
    const { result } = renderHook(() => useSecurityEvents('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.events).toHaveLength(2);
    expect(result.current.unresolvedEvents).toHaveLength(1);
    expect(result.current.unresolvedEvents[0].id).toBe('event-123');
  });
});

describe('useDeviceManagement', () => {
  let mockSessionManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSessionManager = {
      getDevices: vi.fn(),
      updateDeviceTrust: vi.fn()
    };
    
    MockSessionManager.mockImplementation(() => mockSessionManager);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    expect(result.current.devices).toEqual([]);
    expect(result.current.trustedDevices).toEqual([]);
    expect(result.current.suspiciousDevices).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load devices on mount', async () => {
    const mockDeviceData = {
      id: 'device-123',
      ...mockDevice,
      trustLevel: 'trusted',
      status: 'active'
    };
    
    mockSessionManager.getDevices.mockResolvedValue({
      success: true,
      data: [mockDeviceData]
    });
    
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.devices).toEqual([mockDeviceData]);
    expect(result.current.trustedDevices).toEqual([mockDeviceData]);
    expect(mockSessionManager.getDevices).toHaveBeenCalledWith('user-123');
  });

  it('should update device trust level', async () => {
    const mockDeviceData = {
      id: 'device-123',
      ...mockDevice,
      trustLevel: 'unknown',
      status: 'active'
    };
    
    mockSessionManager.getDevices.mockResolvedValue({
      success: true,
      data: [mockDeviceData]
    });
    mockSessionManager.updateDeviceTrust.mockResolvedValue({
      success: true,
      data: { ...mockDeviceData, trustLevel: 'trusted' }
    });
    
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.updateTrustLevel('device-123', 'trusted');
    });
    
    expect(mockSessionManager.updateDeviceTrust).toHaveBeenCalledWith('device-123', 'trusted');
  });

  it('should filter devices by trust level correctly', async () => {
    const trustedDevice = {
      id: 'device-123',
      ...mockDevice,
      trustLevel: 'trusted',
      status: 'active'
    };
    const suspiciousDevice = {
      id: 'device-456',
      ...mockDevice,
      trustLevel: 'suspicious',
      status: 'active'
    };
    
    mockSessionManager.getDevices.mockResolvedValue({
      success: true,
      data: [trustedDevice, suspiciousDevice]
    });
    
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.devices).toHaveLength(2);
    expect(result.current.trustedDevices).toHaveLength(1);
    expect(result.current.suspiciousDevices).toHaveLength(1);
    expect(result.current.trustedDevices[0].id).toBe('device-123');
    expect(result.current.suspiciousDevices[0].id).toBe('device-456');
  });

  it('should refresh devices', async () => {
    mockSessionManager.getDevices.mockResolvedValue({
      success: true,
      data: []
    });
    
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.refreshDevices();
    });
    
    expect(mockSessionManager.getDevices).toHaveBeenCalledTimes(2);
  });

  it('should handle loading error', async () => {
    mockSessionManager.getDevices.mockResolvedValue({
      success: false,
      error: 'Failed to load devices'
    });
    
    const { result } = renderHook(() => useDeviceManagement('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Failed to load devices');
    expect(result.current.devices).toEqual([]);
  });
});
