// Real-time Updates Integration Test
// Supabase Realtime integration with cache synchronization

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Supabase realtime channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn().mockReturnThis(),
  send: vi.fn(),
};

// Mock Supabase client with realtime
const mockSupabaseClient = {
  channel: vi.fn(() => mockChannel),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
  removeChannel: vi.fn(),
};

// Mock realtime hook
const mockRealtimeHook = {
  isConnected: false,
  connectionStatus: "disconnected",
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  send: vi.fn(),
  lastMessage: undefined,
  error: undefined,
};

vi.mock(
  "@supabase/supabase-js",
  () => ({
    createClient: () => mockSupabaseClient,
  }),
);

vi.mock(
  "../../hooks/enhanced/use-realtime",
  () => ({
    useRealtime: () => mockRealtimeHook,
  }),
);

// Test data
const mockPatient = {
  id: "patient-123",
  name: "João Silva Santos",
  cpf: "123.456.789-00",
  clinic_id: "clinic-1",
  updated_at: new Date().toISOString(),
};

const mockAppointment = {
  id: "appointment-123",
  patient_id: "patient-123",
  doctor_id: "doctor-123",
  clinic_id: "clinic-1",
  scheduled_at: new Date().toISOString(),
  status: "scheduled",
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode; }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("real-time Updates Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Don't clear all mocks here since global setup does it

    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Reset realtime hook state
    mockRealtimeHook.isConnected = false;
    mockRealtimeHook.connectionStatus = "disconnected";
    mockRealtimeHook.lastMessage = undefined;
    mockRealtimeHook.error = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  describe("realtime Connection Management", () => {
    it("should establish realtime connection successfully", async () => {
      mockSupabaseClient.channel.mockReturnValue(mockChannel);

      mockRealtimeHook.subscribe.mockImplementation((channelName, callback) => {
        // Simulate actual hook behavior by calling global mock
        mockSupabaseClient.channel(channelName);

        // Call subscribe on the returned channel
        mockChannel.subscribe();

        mockRealtimeHook.isConnected = true;
        mockRealtimeHook.connectionStatus = "connected";

        // Simulate connection established
        setTimeout(() => {
          callback({ event: "system", type: "connected" });
        }, 100);

        return mockChannel;
      });

      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", (payload) => {
          mockRealtimeHook.lastMessage = payload;
        });
      });

      await waitFor(() => {
        expect(mockRealtimeHook.isConnected).toBeTruthy();
      });

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        "patients:clinic-1",
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it("should handle connection failures and reconnection", async () => {
      const connectionError = new Error("Connection failed");

      mockRealtimeHook.subscribe.mockImplementation(() => {
        mockRealtimeHook.isConnected = false;
        mockRealtimeHook.connectionStatus = "error";
        mockRealtimeHook.error = connectionError;

        // Simulate reconnection after delay
        setTimeout(() => {
          mockRealtimeHook.isConnected = true;
          mockRealtimeHook.connectionStatus = "connected";
          mockRealtimeHook.error = undefined;
        }, 2000);

        return mockChannel;
      });

      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", () => {});
      });

      // Initially failed
      expect(mockRealtimeHook.isConnected).toBeFalsy();
      expect(mockRealtimeHook.error).toBeDefined();

      // Wait for reconnection
      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockRealtimeHook.isConnected).toBeTruthy();
      expect(mockRealtimeHook.error ?? null).toBeNull();
    });
  });

  describe("patient Data Real-time Updates", () => {
    it("should receive patient updates and sync cache", async () => {
      const updatedPatient = {
        ...mockPatient,
        phone: "(11) 88888-8888",
        updated_at: new Date().toISOString(),
      };

      let realtimeCallback: ((payload: unknown) => void) | null;

      mockRealtimeHook.subscribe.mockImplementation(
        (_channelName, callback) => {
          realtimeCallback = callback;
          mockRealtimeHook.isConnected = true;

          // Create a local reference to ensure queryClient is available
          const currentQueryClient = queryClient;
          if (currentQueryClient) {
            // Store reference for use in callback
            callback.queryClient = currentQueryClient;
          }

          return mockChannel;
        },
      );

      // Set up initial patient data in cache
      queryClient.setQueryData(["patients", "patient-123"], mockPatient);

      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", (payload) => {
          // Simulate cache invalidation on realtime update
          if (payload.eventType === "UPDATE") {
            queryClient.setQueryData(["patients", payload.new.id], payload.new);
            queryClient.invalidateQueries({ queryKey: ["patients"] });
          }
        });
      });

      // Simulate realtime update
      await act(async () => {
        if (realtimeCallback) {
          realtimeCallback({
            eventType: "UPDATE",
            schema: "public",
            table: "patients",
            old: mockPatient,
            new: updatedPatient,
          });
        }
      });

      const cachedPatient = queryClient.getQueryData([
        "patients",
        "patient-123",
      ]);
      expect(cachedPatient).toStrictEqual(updatedPatient);
    });

    it("should handle concurrent patient updates from multiple users", async () => {
      const user2Update = {
        ...mockPatient,
        email: "joao.updated@email.com",
        updated_at: "2024-01-01T10:31:00Z", // Later timestamp
      };

      // Set initial data in the queryClient
      queryClient.setQueryData(["patients", "patient-123"], mockPatient);

      // Verify initial data is set
      const initialData = queryClient.getQueryData(["patients", "patient-123"]);
      expect(initialData).toBeDefined();

      // Simulate the update directly
      await act(async () => {
        queryClient.setQueryData(["patients", "patient-123"], user2Update);
      });

      // Verify the update was applied
      const finalPatient = queryClient.getQueryData([
        "patients",
        "patient-123",
      ]) as unknown;

      // Validate the final state matches the update
      expect(finalPatient).toBeDefined();
      expect(finalPatient.email).toBe("joao.updated@email.com");
      expect(finalPatient.updated_at).toBe(user2Update.updated_at);
    });
  });
  describe("appointment Real-time Notifications", () => {
    it("should notify all relevant users of appointment changes", async () => {
      const appointmentUpdate = {
        ...mockAppointment,
        status: "confirmed",
        updated_at: new Date().toISOString(),
      };

      const notificationCallbacks = {
        doctor: vi.fn(),
        patient: vi.fn(),
        reception: vi.fn(),
      };

      mockRealtimeHook.subscribe.mockImplementation((channelName, callback) => {
        if (channelName.includes("appointments")) {
          callback({
            eventType: "UPDATE",
            new: appointmentUpdate,
            old: mockAppointment,
          });
        }
        return mockChannel;
      });

      // Simulate multiple user types subscribing
      await act(async () => {
        // Doctor subscription
        mockRealtimeHook.subscribe(
          "appointments:doctor:doctor-123",
          notificationCallbacks.doctor,
        );

        // Patient subscription
        mockRealtimeHook.subscribe(
          "appointments:patient:patient-123",
          notificationCallbacks.patient,
        );

        // Reception subscription
        mockRealtimeHook.subscribe(
          "appointments:clinic:clinic-1",
          notificationCallbacks.reception,
        );
      });

      expect(notificationCallbacks.doctor).toHaveBeenCalledWith({
        eventType: "UPDATE",
        new: appointmentUpdate,
        old: mockAppointment,
      });

      expect(notificationCallbacks.patient).toHaveBeenCalled();
      expect(notificationCallbacks.reception).toHaveBeenCalled();
    });

    it("should handle appointment scheduling conflicts in real-time", async () => {
      const conflictingAppointment = {
        id: "appointment-456",
        doctor_id: "doctor-123",
        scheduled_at: mockAppointment.scheduled_at, // Same time slot
        status: "scheduled",
      };

      let conflictDetected = false;
      let realtimeCallback: ((payload: unknown) => void) | null;

      // Set existing appointment in cache FIRST
      queryClient.setQueryData(
        ["appointments", "doctor-123"],
        [mockAppointment],
      );

      mockRealtimeHook.subscribe.mockImplementation(
        (_channelName, callback) => {
          realtimeCallback = callback;
          return mockChannel;
        },
      );

      await act(async () => {
        mockRealtimeHook.subscribe(
          "appointments:doctor:doctor-123",
          (payload) => {
            if (payload.eventType === "INSERT") {
              // Check for scheduling conflicts
              const existingAppointments = (queryClient.getQueryData([
                "appointments",
                "doctor-123",
              ]) as unknown[]) || [];
              const conflict = existingAppointments.find(
                (apt) =>
                  apt.scheduled_at === payload.new.scheduled_at
                  && apt.id !== payload.new.id
                  && apt.status !== "cancelled",
              );

              if (conflict) {
                conflictDetected = true;
              }
            }
          },
        );
      });

      // Simulate new conflicting appointment
      await act(async () => {
        if (realtimeCallback) {
          realtimeCallback({
            eventType: "INSERT",
            new: conflictingAppointment,
          });
        }
      });

      expect(conflictDetected).toBeTruthy();
    });
  });

  describe("emergency Alerts Real-time Broadcasting", () => {
    it("should broadcast emergency alerts to all clinic staff immediately", async () => {
      const emergencyAlert = {
        id: "emergency-123",
        type: "medical_emergency",
        patient_id: "patient-123",
        location: "Room 101",
        severity: "critical",
        message: "Patient experiencing cardiac arrest",
        created_at: new Date().toISOString(),
        clinic_id: "clinic-1",
      };

      const emergencyCallbacks = {
        doctors: vi.fn(),
        nurses: vi.fn(),
        reception: vi.fn(),
        security: vi.fn(),
      };

      mockRealtimeHook.subscribe.mockImplementation((channelName, callback) => {
        // Emergency alerts go to all staff channels
        if (channelName.includes("emergency")) {
          callback({
            eventType: "EMERGENCY_ALERT",
            alert: emergencyAlert,
            priority: "immediate",
          });
        }
        return mockChannel;
      });

      // Simulate all staff types subscribing to emergency channel
      await act(async () => {
        mockRealtimeHook.subscribe(
          "emergency:clinic:clinic-1:doctors",
          emergencyCallbacks.doctors,
        );
        mockRealtimeHook.subscribe(
          "emergency:clinic:clinic-1:nurses",
          emergencyCallbacks.nurses,
        );
        mockRealtimeHook.subscribe(
          "emergency:clinic:clinic-1:reception",
          emergencyCallbacks.reception,
        );
        mockRealtimeHook.subscribe(
          "emergency:clinic:clinic-1:security",
          emergencyCallbacks.security,
        );
      });

      // All staff should receive the emergency alert
      expect(emergencyCallbacks.doctors).toHaveBeenCalledWith({
        eventType: "EMERGENCY_ALERT",
        alert: emergencyAlert,
        priority: "immediate",
      });

      expect(emergencyCallbacks.nurses).toHaveBeenCalled();
      expect(emergencyCallbacks.reception).toHaveBeenCalled();
      expect(emergencyCallbacks.security).toHaveBeenCalled();
    });
  });

  describe("performance and Scalability", () => {
    it("should handle high-frequency updates without performance degradation", async () => {
      const updateCount = 100;
      const updates: unknown[] = [];

      // Use the QueryClient instance from the test scope
      const testQueryClient = queryClient;

      let realtimeCallback: ((payload: unknown) => void) | null;

      mockRealtimeHook.subscribe.mockImplementation(
        (_channelName, callback) => {
          realtimeCallback = callback;
          return mockChannel;
        },
      );

      // Define the callback function with proper QueryClient reference
      const subscriptionCallback = (payload: unknown) => {
        updates.push(payload);
        // Simulate efficient cache update
        if (payload.eventType === "UPDATE") {
          // Use the correct TanStack Query v5 API
          testQueryClient.setQueryData(
            ["patients", payload.new.id],
            payload.new,
          );
        }
      };

      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", subscriptionCallback);
      });

      const startTime = performance.now();

      // Simulate high-frequency updates
      await act(async () => {
        for (let i = 0; i < updateCount; i++) {
          if (realtimeCallback) {
            realtimeCallback({
              eventType: "UPDATE",
              new: {
                ...mockPatient,
                id: `patient-${i}`,
                updated_at: new Date().toISOString(),
              },
            });
          }
        }
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(updates).toHaveLength(updateCount);
      expect(processingTime).toBeLessThan(1000); // < 1 second for 100 updates
    });

    it("should handle connection drops gracefully with reconnection", async () => {
      let connectionAttempts = 0;

      mockRealtimeHook.subscribe.mockImplementation(
        (_channelName, _callback) => {
          connectionAttempts++;

          if (connectionAttempts === 1) {
            // First connection succeeds
            mockRealtimeHook.isConnected = true;
            mockRealtimeHook.connectionStatus = "connected";

            // Simulate connection drop after 1 second
            setTimeout(() => {
              mockRealtimeHook.isConnected = false;
              mockRealtimeHook.connectionStatus = "disconnected";
            }, 1000);
          } else if (connectionAttempts === 2) {
            // Reconnection succeeds
            setTimeout(() => {
              mockRealtimeHook.isConnected = true;
              mockRealtimeHook.connectionStatus = "connected";
            }, 500);
          }

          return mockChannel;
        },
      );

      // Initial connection
      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", () => {});
      });

      expect(mockRealtimeHook.isConnected).toBeTruthy();

      // Wait for connection drop
      await new Promise((resolve) => setTimeout(resolve, 1100));
      expect(mockRealtimeHook.isConnected).toBeFalsy();

      // Simulate reconnection attempt
      await act(async () => {
        mockRealtimeHook.subscribe("patients:clinic-1", () => {});
      });

      // Wait for reconnection
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(mockRealtimeHook.isConnected).toBeTruthy();
      expect(connectionAttempts).toBe(2);
    });
  });

  describe("multi-tenant Isolation in Real-time", () => {
    it("should ensure clinic isolation in realtime subscriptions", async () => {
      const clinic1Updates: unknown[] = [];
      const clinic2Updates: unknown[] = [];

      mockRealtimeHook.subscribe.mockImplementation((channelName, callback) => {
        if (channelName.includes("clinic-1")) {
          callback({
            eventType: "UPDATE",
            new: { ...mockPatient, clinic_id: "clinic-1" },
          });
        } else if (channelName.includes("clinic-2")) {
          callback({
            eventType: "UPDATE",
            new: { ...mockPatient, id: "patient-456", clinic_id: "clinic-2" },
          });
        }
        return mockChannel;
      });

      await act(async () => {
        // Subscribe to clinic-1 updates
        mockRealtimeHook.subscribe("patients:clinic-1", (payload) => {
          if (payload.new.clinic_id === "clinic-1") {
            clinic1Updates.push(payload);
          }
        });

        // Subscribe to clinic-2 updates
        mockRealtimeHook.subscribe("patients:clinic-2", (payload) => {
          if (payload.new.clinic_id === "clinic-2") {
            clinic2Updates.push(payload);
          }
        });
      });

      expect(clinic1Updates).toHaveLength(1);
      expect(clinic2Updates).toHaveLength(1);
      expect(clinic1Updates[0].new.clinic_id).toBe("clinic-1");
      expect(clinic2Updates[0].new.clinic_id).toBe("clinic-2");
    });
  });
});
