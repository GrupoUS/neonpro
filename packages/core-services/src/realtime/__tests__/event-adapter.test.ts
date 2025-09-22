/**
 * Tests for Realtime Event Adapter (T102.5)
 * Comprehensive test suite for join/leave/status event handling
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import {
  createRealtimeAdapter,
  defaultConfigs,
  MockRealtimeAdapter,
  type RealtimeEventHandlers,
  type RealtimeEvent,
  createRealtimeEvent,
  validateParticipant,
  isHealthcareCompliant,
} from "../index";

describe("Realtime Event Adapter", () => {
  let adapter: MockRealtimeAdapter;
  let eventHandlers: RealtimeEventHandlers;
  let capturedEvents: RealtimeEvent[] = [];

  beforeEach(_async () => {
    capturedEvents = [];

    eventHandlers = {
      onJoin: vi.fn((event) => {
        capturedEvents.push(event
      }),
      onLeave: vi.fn((event) => {
        capturedEvents.push(event
      }),
      onStatusChange: vi.fn((event) => {
        capturedEvents.push(event
      }),
      onPresenceSync: vi.fn((event) => {
        capturedEvents.push(event
      }),
      onError: vi.fn(),
    };

    const config = defaultConfigs.mock(
    adapter = createRealtimeAdapter(config) as MockRealtimeAdapter;
    adapter.setEventHandlers(eventHandlers
    await adapter.initialize(
  }

  afterEach(_async () => {
<<<<<<< HEAD
    await adapter.cleanup(
  }
=======
    await adapter.cleanup();
  });
>>>>>>> origin/main

  describe("Factory Function", () => {
    it("should create mock adapter", () => {
      const config = defaultConfigs.mock(
      const mockAdapter = createRealtimeAdapter(config
      expect(mockAdapter).toBeInstanceOf(MockRealtimeAdapter
    }

    it("should throw error for unsupported provider", () => {
      const config = { ...defaultConfigs.mock(), provider: "invalid" as any };
      expect(() => createRealtimeAdapter(config)).toThrow(
        "Unsupported provider: invalid",
      
    }
  }

  describe("Adapter Lifecycle", () => {
    it(_"should initialize successfully",_async () => {
      const freshAdapter = createRealtimeAdapter(
        defaultConfigs.mock(),
      ) as MockRealtimeAdapter;
      await expect(freshAdapter.initialize()).resolves.toBeUndefined(
      await freshAdapter.cleanup(
    }

    it(_"should cleanup successfully",_async () => {
<<<<<<< HEAD
      await expect(adapter.cleanup()).resolves.toBeUndefined(
      expect(adapter.getActiveChannels()).toEqual([]
    }

    it(_"should get health status",_async () => {
      const health = await adapter.getHealth(
=======
      await expect(adapter.cleanup()).resolves.toBeUndefined();
      expect(adapter.getActiveChannels()).toEqual([]);
    });

    it(_"should get health status",_async () => {
      const health = await adapter.getHealth();
>>>>>>> origin/main
      expect(health).toEqual({
        status: "healthy",
        latency: expect.any(Number),
        activeChannels: 0,
        totalParticipants: 0,
        lastHeartbeat: expect.any(String),
      }
    }
  }

  describe("Channel Management", () => {
    const channelId = "test-channel-123";
    const participant = {
      id: "participant-1",
      name: "Dr. Silva",
      _role: "doctor" as const,
      status: "connected" as const,
      capabilities: {
        audio: true,
        video: true,
        screenShare: true,
        chat: true,
      },
    };

    it(_"should join channel successfully",_async () => {
      await adapter.joinChannel(channelId, participant, {
        clinicId: "clinic-123",
        sessionId: "session-456",
      }

      // Verify channel state
      const channelState = adapter.getChannelState(channelId
      expect(channelState).toBeTruthy(
      expect(channelState!.participants.size).toBe(1
      expect(channelState!.participants.get(participant.id)).toBeTruthy(

      // Verify join event
      expect(eventHandlers.onJoin).toHaveBeenCalledTimes(1
      const joinEvent = capturedEvents.find((e) => e.type === "join"
      expect(joinEvent).toBeTruthy(
      expect(joinEvent!.participant.id).toBe(participant.id
      expect(joinEvent!.data?.welcomeMessage).toContain("Dr. Silva"
    }

    it(_"should leave channel successfully",_async () => {
      // First join
      await adapter.joinChannel(channelId, participant

      // Then leave
      await adapter.leaveChannel(channelId, participant.id, "Test leave"

      // Verify channel cleanup
      const channelState = adapter.getChannelState(channelId
      expect(channelState).toBeNull(); // Channel should be cleaned up when empty

      // Verify leave event
      expect(eventHandlers.onLeave).toHaveBeenCalledTimes(1
      const leaveEvent = capturedEvents.find((e) => e.type === "leave"
      expect(leaveEvent).toBeTruthy(
      expect(leaveEvent!.participant.id).toBe(participant.id
      expect(leaveEvent!.data?.reason).toBe("Test leave"
      expect(leaveEvent!.data?.duration).toBeGreaterThanOrEqual(0
    }

    it(_"should update participant status",_async () => {
      // First join
      await adapter.joinChannel(channelId, participant

      // Update status
      await adapter.updateParticipantStatus(
        channelId,
        participant.id,
        "reconnecting",
      

      // Verify status change event
<<<<<<< HEAD
      expect(eventHandlers.onStatusChange).toHaveBeenCalledTimes(1
      const statusEvent = capturedEvents.find((e) => e.type === "status_change",
      
      expect(statusEvent).toBeTruthy(
      expect(statusEvent!.data?.previousStatus).toBe("connected"
      expect(statusEvent!.data?.newStatus).toBe("reconnecting"
=======
      expect(eventHandlers.onStatusChange).toHaveBeenCalledTimes(1);
      const statusEvent = capturedEvents.find((e) => e.type === "status_change",
      );
      expect(statusEvent).toBeTruthy();
      expect(statusEvent!.data?.previousStatus).toBe("connected");
      expect(statusEvent!.data?.newStatus).toBe("reconnecting");
>>>>>>> origin/main

      // Verify participant state
      const channelState = adapter.getChannelState(channelId
      const updatedParticipant = channelState!.participants.get(participant.id
      expect(updatedParticipant!.status).toBe("reconnecting"
    }

    it(_"should handle multiple participants",_async () => {
      const participant2 = {
        id: "participant-2",
        name: "Patient João",
        _role: "patient" as const,
        status: "connected" as const,
        capabilities: {
          audio: true,
          video: true,
          screenShare: false,
          chat: true,
        },
      };

      // Join both participants
      await adapter.joinChannel(channelId, participant
      await adapter.joinChannel(channelId, participant2

      // Verify channel state
      const channelState = adapter.getChannelState(channelId
      expect(channelState!.participants.size).toBe(2
      expect(channelState!.metadata.totalParticipants).toBe(2

      // Leave one participant
      await adapter.leaveChannel(channelId, participant.id

      // Verify remaining participant
      const updatedState = adapter.getChannelState(channelId
      expect(updatedState!.participants.size).toBe(1
      expect(updatedState!.participants.has(participant2.id)).toBe(true);
    }
  }

  describe("Event Validation", () => {
    it("should validate participant data", () => {
      const validParticipant = adapter.createMockParticipant(
      expect(validateParticipant(validParticipant)).toBe(true);

      const invalidParticipant = { ...validParticipant, id: "" };
      expect(validateParticipant(invalidParticipant as any)).toBe(false);
    }

    it("should create valid realtime events", () => {
      const participant = adapter.createMockParticipant(
      const event = createRealtimeEvent("join", "test-channel", participant, {
        test: true,
      }

      expect(event.type).toBe("join"
      expect(event.channelId).toBe("test-channel"
      expect(event.participant).toBe(participant
      expect(event.data?.test).toBe(true);
      expect(event.metadata.eventId).toBeTruthy(
      expect(event.timestamp).toBeTruthy(
    }

    it("should validate healthcare compliance", () => {
      const participant = adapter.createMockParticipant(
      const compliantEvent = createRealtimeEvent("join", "test", participant
      compliantEvent.metadata.compliance.lgpdLogged = true;
      compliantEvent.metadata.compliance.sensitiveData = false;

      expect(isHealthcareCompliant(compliantEvent)).toBe(true);

      const nonCompliantEvent = createRealtimeEvent(
        "join",
        "test",
        participant,
      
      nonCompliantEvent.metadata.compliance.lgpdLogged = false;

      expect(isHealthcareCompliant(nonCompliantEvent)).toBe(false);
    }
  }

  describe("Mock-Specific Features", () => {
    const channelId = "mock-test-channel";

    it(_"should simulate network latency",_async () => {
<<<<<<< HEAD
      const participant = adapter.createMockParticipant(
      adapter.setSimulatedLatency(100
=======
      const participant = adapter.createMockParticipant();
      adapter.setSimulatedLatency(100);
>>>>>>> origin/main

      const start = Date.now(
      await adapter.joinChannel(channelId, participant
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90); // Allow for some timing variance
    }

    it(_"should maintain event log",_async () => {
<<<<<<< HEAD
      const participant = adapter.createMockParticipant(
      adapter.clearEventLog(
=======
      const participant = adapter.createMockParticipant();
      adapter.clearEventLog();
>>>>>>> origin/main

      await adapter.joinChannel(channelId, participant
      await adapter.updateParticipantStatus(
        channelId,
        participant.id,
        "reconnecting",
      
      await adapter.leaveChannel(channelId, participant.id

      const eventLog = adapter.getEventLog(
      expect(eventLog).toHaveLength(3
      expect(eventLog[0].type).toBe("join"
      expect(eventLog[1].type).toBe("status_change"
      expect(eventLog[2].type).toBe("leave"
    }

    it(_"should simulate disconnection",_async () => {
<<<<<<< HEAD
      const participant = adapter.createMockParticipant(
      await adapter.joinChannel(channelId, participant
=======
      const participant = adapter.createMockParticipant();
      await adapter.joinChannel(channelId, participant);
>>>>>>> origin/main

      // Start disconnection simulation (doesn't wait for auto-leave)
      adapter.simulateDisconnection(channelId, participant.id

      // Check immediate status change
      await new Promise((resolve) => setTimeout(resolve, 100)
      const channelState = adapter.getChannelState(channelId
      expect(channelState!.participants.get(participant.id)!.status).toBe(
        "disconnected",
      
    }

    it(_"should simulate reconnection",_async () => {
<<<<<<< HEAD
      const participant = adapter.createMockParticipant(
      await adapter.joinChannel(channelId, participant
=======
      const participant = adapter.createMockParticipant();
      await adapter.joinChannel(channelId, participant);
>>>>>>> origin/main

      // Start reconnection simulation
      adapter.simulateReconnection(channelId, participant.id

      // Check reconnecting status
      await new Promise((resolve) => setTimeout(resolve, 100)
      let channelState = adapter.getChannelState(channelId
      expect(channelState!.participants.get(participant.id)!.status).toBe(
        "reconnecting",
      
    }
  }

  describe("Error Handling", () => {
    it(_"should handle initialization errors",_async () => {
      const freshAdapter = createRealtimeAdapter(
        defaultConfigs.mock(),
      ) as MockRealtimeAdapter;
      const participant = adapter.createMockParticipant(

      // Try to join without initialization
      await expect(
        freshAdapter.joinChannel("test", participant),
      ).rejects.toThrow("not initialized"
    }

    it(_"should handle invalid participant data",_async () => {
      const invalidParticipant = {
        id: "",
        _role: "doctor",
        name: "",
        status: "connected",
      } as any;

      await expect(
        adapter.joinChannel("test", invalidParticipant),
      ).rejects.toThrow("Invalid participant data"
    }

    it(_"should handle non-existent channel operations",_async () => {
      // Should not throw, but log warning
      await expect(
        adapter.leaveChannel("non-existent", "participant-1"),
      ).resolves.toBeUndefined(
      await expect(
        adapter.updateParticipantStatus(
          "non-existent",
          "participant-1",
          "connected",
        ),
      ).resolves.toBeUndefined(
    }
  }

  describe("Integration Scenarios", () => {
    it(_"should handle complete healthcare session flow",_async () => {
      const channelId = "healthcare-session-789";

      // Create healthcare participants
      const doctor = adapter.createMockParticipant({
        id: "dr-silva-123",
        name: "Dr. Maria Silva",
        _role: "doctor",
        capabilities: {
          audio: true,
          video: true,
          screenShare: true,
          chat: true,
        },
      }

      const patient = adapter.createMockParticipant({
        id: "patient-joao-456",
        name: "João Santos",
        _role: "patient",
        capabilities: {
          audio: true,
          video: true,
          screenShare: false,
          chat: true,
        },
      }

      const nurse = adapter.createMockParticipant({
        id: "nurse-ana-789",
        name: "Ana Costa",
        _role: "nurse",
        capabilities: {
          audio: true,
          video: false,
          screenShare: false,
          chat: true,
        },
      }

      // 1. Doctor joins first
      await adapter.joinChannel(channelId, doctor, {
        clinicId: "hospital-central",
        sessionId: "consultation-2024-001",
      }

      // 2. Patient joins
      await adapter.joinChannel(channelId, patient, {
        clinicId: "hospital-central",
        sessionId: "consultation-2024-001",
      }

      // 3. Nurse joins
      await adapter.joinChannel(channelId, nurse, {
        clinicId: "hospital-central",
        sessionId: "consultation-2024-001",
      }

      // Verify all participants present
      const channelState = adapter.getChannelState(channelId
      expect(channelState!.participants.size).toBe(3

      // 4. Patient has connection issues
      await adapter.updateParticipantStatus(
        channelId,
        patient.id,
        "reconnecting",
      
      await adapter.updateParticipantStatus(channelId, patient.id, "connected"

      // 5. Nurse leaves early
      await adapter.leaveChannel(channelId, nurse.id, "Shift ended"

      // 6. Session ends
      await adapter.leaveChannel(
        channelId,
        patient.id,
        "Consultation complete",
      
      await adapter.leaveChannel(channelId, doctor.id, "Session ended"

      // Verify session cleanup
      expect(adapter.getChannelState(channelId)).toBeNull(
      expect(adapter.getActiveChannels()).toEqual([]

      // Verify event sequence
      const eventLog = adapter.getEventLog(
      const eventTypes = eventLog.map((e) => e.type
      expect(eventTypes).toEqual([
        "join", // doctor
        "join", // patient
        "join", // nurse
        "status_change", // patient reconnecting
        "status_change", // patient connected
        "leave", // nurse
        "leave", // patient
        "leave", // doctor
      ]
    }
  }
}
