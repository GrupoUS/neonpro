// T010: Unit tests for session expiration logic
// Purpose: Test chat session lifecycle and expiration handling for LGPD compliance
// File: packages/core-services/tests/chatSession.spec.ts

import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
// import type { ChatSession } from "@neonpro/types";
import { ChatRepository } from "../src/database/chat-repository";
import {
  SessionManager,
  MemorySessionStore,
  type SessionConfig,
} from "../src/config/session";

describe("T010: Chat Session Expiration Logic", () => {
  let sessionRepo: ChatRepository;
  let sessionManager: SessionManager;
  let sessionStore: MemorySessionStore;
  let sessionConfig: SessionConfig;

  beforeEach(() => {
    sessionRepo = new ChatRepository();

    sessionConfig = {
      cookieName: "test-session",
      secretKey: "test-secret-key-32-chars-long!",
      maxAge: 3600, // 1 hour
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      renewThreshold: 300, // 5 minutes
    };

    sessionStore = new MemorySessionStore(1000); // Cleanup every 1s for testing
    sessionManager = new SessionManager(sessionConfig, sessionStore);
  });

  afterEach(() => {
    sessionStore.destroy();
  });

  describe("Basic Session Repository", () => {
    it("should create new chat session with correct timestamps", async () => {
      const userId = "user-123";
      const session = await sessionRepo.create(userId, "pt-BR");

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.locale).toBe("pt-BR");
      expect(session.startedAt).toBeDefined();
      expect(session.lastActivityAt).toBeDefined();
      expect(new Date(session.startedAt)).toBeInstanceOf(Date);
      expect(new Date(session.lastActivityAt)).toBeInstanceOf(Date);
    });

    it("should find existing session by ID", async () => {
      const userId = "user-123";
      const session = await sessionRepo.create(userId);

      const found = await sessionRepo.find(session.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(session.id);
      expect(found?.userId).toBe(userId);
    });

    it("should return null for non-existent session", async () => {
      const found = await sessionRepo.find("non-existent-id");
      expect(found).toBeNull();
    });

    it("should update lastActivityAt when touching session", async () => {
      const userId = "user-123";
      const session = await sessionRepo.create(userId);
      const originalActivity = session.lastActivityAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await sessionRepo.touch(session.id);

      const updated = await sessionRepo.find(session.id);
      expect(updated?.lastActivityAt).not.toBe(originalActivity);
      expect(new Date(updated!.lastActivityAt)).toBeInstanceOf(Date);
    });

    it("should handle touching non-existent session gracefully", async () => {
      // Should not throw error
      await expect(
        sessionRepo.touch("non-existent-id"),
      ).resolves.toBeUndefined();
    });
  });

  describe("Session Manager Expiration", () => {
    it("should create session with correct expiration time", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
        _role: "patient",
      };

      const { sessionId, session } =
        await sessionManager.createSession(userData);

      expect(sessionId).toBeDefined();
      expect(session.expiresAt).toBeDefined();

      const expiresAt = new Date(session.expiresAt);
      const createdAt = new Date(session.createdAt);
      const expectedExpiry = new Date(
        createdAt.getTime() + sessionConfig.maxAge * 1000,
      );

      expect(
        Math.abs(expiresAt.getTime() - expectedExpiry.getTime()),
      ).toBeLessThan(1000);
    });

    it("should retrieve valid session before expiration", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await sessionManager.createSession(userData);
      const retrieved = await sessionStore.get(sessionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.userId).toBe("user-123");
      expect(retrieved?.email).toBe("test@example.com");
    });

    it("should return null for expired session", async () => {
      // Mock current time
      const originalNow = Date.now;
      const fixedTime = new Date("2023-01-01T12:00:00Z").getTime();
      Date.now = vi.fn(() => fixedTime);

      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await sessionManager.createSession(userData);

      // Fast-forward time beyond expiration
      const expiredTime = fixedTime + sessionConfig.maxAge * 1000 + 1000;
      Date.now = vi.fn(() => expiredTime);

      const retrieved = await sessionStore.get(sessionId);
      expect(retrieved).toBeNull();

      // Restore original Date.now
      Date.now = originalNow;
    });

    it("should detect session renewal need", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await sessionManager.createSession(userData);

      // Mock time near expiration (within renewal threshold)
      const originalNow = Date.now;
      const renewalTime =
        Date.now() +
        sessionConfig.maxAge * 1000 -
        sessionConfig.renewThreshold * 500;
      Date.now = vi.fn(() => renewalTime);

      const session = await sessionStore.get(sessionId);
      const needsRenewal =
        session &&
        new Date(session.expiresAt).getTime() - Date.now() <
          sessionConfig.renewThreshold * 1000;

      expect(needsRenewal).toBe(true);

      // Restore original Date.now
      Date.now = originalNow;
    });

    it("should renew session extending expiration time", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await sessionManager.createSession(userData);
      const originalSession = await sessionStore.get(sessionId);

      // Wait a bit then renew
      await new Promise((resolve) => setTimeout(resolve, 10));
      const renewed = await sessionManager.renewSession(sessionId);

      expect(renewed.success).toBe(true);
      expect(renewed.session).toBeDefined();

      if (renewed.session) {
        expect(new Date(renewed.session.expiresAt).getTime()).toBeGreaterThan(
          new Date(originalSession!.expiresAt).getTime(),
        );
      }
    });

    it("should handle renewal of non-existent session", async () => {
      const renewed = await sessionManager.renewSession("non-existent-id");
      expect(renewed.success).toBe(false);
      expect(renewed.session).toBeNull();
    });
  });

  describe("Session Store Cleanup", () => {
    it("should automatically clean up expired sessions", async () => {
      // Create session with very short expiration
      const shortConfig: SessionConfig = {
        ...sessionConfig,
        maxAge: 1, // 1 second
      };

      const shortStore = new MemorySessionStore(100); // Cleanup every 100ms
      const shortManager = new SessionManager(shortConfig, shortStore);

      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await shortManager.createSession(userData);

      // Verify session exists initially
      let session = await shortStore.get(sessionId);
      expect(session).toBeDefined();

      // Wait for expiration and cleanup
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Session should be cleaned up
      session = await shortStore.get(sessionId);
      expect(session).toBeNull();

      shortStore.destroy();
    });

    it("should not clean up valid sessions during cleanup", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const { sessionId } = await sessionManager.createSession(userData);

      // Trigger manual cleanup
      await sessionStore.cleanup();

      // Valid session should still exist
      const session = await sessionStore.get(sessionId);
      expect(session).toBeDefined();
    });

    it("should clean up multiple expired sessions efficiently", async () => {
      const SESSION_COUNT = 5;
      const shortConfig: SessionConfig = {
        ...sessionConfig,
        maxAge: 1, // 1 second
      };

      const shortStore = new MemorySessionStore();
      const shortManager = new SessionManager(shortConfig, shortStore);

      // Create multiple sessions
      const sessionIds: string[] = [];
      for (let i = 0; i < SESSION_COUNT; i++) {
        const { sessionId } = await shortManager.createSession({
          userId: `user-${i}`,
          email: `user${i}@example.com`,
        });
        sessionIds.push(sessionId);
      }

      // Verify all sessions exist
      for (const sessionId of sessionIds) {
        const session = await shortStore.get(sessionId);
        expect(session).toBeDefined();
      }

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Manual cleanup
      await shortStore.cleanup();

      // All sessions should be cleaned up
      for (const sessionId of sessionIds) {
        const session = await shortStore.get(sessionId);
        expect(session).toBeNull();
      }

      shortStore.destroy();
    });
  });

  describe("LGPD Compliance and Security", () => {
    it("should properly expire sessions for data protection", async () => {
      const userData = {
        userId: "user-123",
        email: "patient@clinic.com",
        metadata: {
          patientId: "patient-456",
          clinicId: "clinic-789",
        },
      };

      const { sessionId } = await sessionManager.createSession(userData);

      // Mock expired time
      const originalNow = Date.now;
      const expiredTime = Date.now() + sessionConfig.maxAge * 1000 + 1000;
      Date.now = vi.fn(() => expiredTime);

      // Attempt to access expired session
      const expiredSession = await sessionStore.get(sessionId);

      // Should return null and not expose patient data
      expect(expiredSession).toBeNull();

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should handle session metadata securely during expiration", async () => {
      const sensitiveData = {
        userId: "user-123",
        email: "patient@clinic.com",
        metadata: {
          cpf: "123.456.789-00",
          clinicId: "clinic-789",
          lastAccess: "/patients/sensitive-data",
        },
      };

      const { sessionId } = await sessionManager.createSession(sensitiveData);

      // Verify session was created with metadata
      let session = await sessionStore.get(sessionId);
      expect(session?.metadata?.cpf).toBe("123.456.789-00");

      // Delete session (simulating expiration/logout)
      await sessionStore.delete(sessionId);

      // Verify sensitive data is no longer accessible
      session = await sessionStore.get(sessionId);
      expect(session).toBeNull();
    });

    it("should generate unique session IDs to prevent prediction", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      const sessionIds = new Set<string>();

      // Generate multiple session IDs
      for (let i = 0; i < 10; i++) {
        const { sessionId } = await sessionManager.createSession(userData);
        sessionIds.add(sessionId);
      }

      // All IDs should be unique
      expect(sessionIds.size).toBe(10);

      // IDs should follow expected format
      sessionIds.forEach((id) => {
        expect(id).toMatch(/^sess_\d+_[a-z0-9]+$/);
      });
    });

    it("should handle concurrent session operations safely", async () => {
      const userData = {
        userId: "user-123",
        email: "test@example.com",
      };

      // Create multiple sessions concurrently
      const sessionPromises = Array.from({ length: 5 }, () =>
        sessionManager.createSession(userData),
      );

      const sessions = await Promise.all(sessionPromises);

      // All sessions should be created successfully
      expect(sessions).toHaveLength(5);
      sessions.forEach(({ sessionId, _session }) => {
        expect(sessionId).toBeDefined();
        expect(session.userId).toBe("user-123");
      });

      // All sessions should be retrievable
      for (const { sessionId } of sessions) {
        const retrieved = await sessionStore.get(sessionId);
        expect(retrieved).toBeDefined();
      }
    });
  });
});
