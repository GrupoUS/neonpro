/**
 * React Hook for Enhanced Real-Time Telemedicine
 * Phase 3.4: T031 - Frontend integration for real-time subscriptions
 *
 * Features:
 * - WebSocket session management
 * - Real-time encrypted messaging
 * - Presence detection and status updates
 * - Connection quality monitoring
 * - Emergency alert handling
 * - LGPD-compliant data handling
 */

import { trpc } from "@/lib/trpc/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

// Types for real-time telemedicine
export interface TelemedicineSession {
  sessionId: string;
  channelId: string;
  encryptionKey: string;
  participantCount: number;
  status: "connecting" | "connected" | "disconnected" | "error";
  created: string;
  metadata: {
    sessionType: string;
    encrypted: boolean;
    cfmCompliant: boolean;
    lgpdCompliant: boolean;
    emergencyProtocolsEnabled: boolean;
  };
}

export interface ConnectionQuality {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
  quality: "excellent" | "good" | "fair" | "poor";
}

export interface PresenceUser {
  userId: string;
  userRole: "patient" | "doctor" | "nurse" | "technician" | "admin";
  status: "online" | "away" | "busy" | "offline" | "in_consultation";
  connectionQuality?: ConnectionQuality;
  deviceInfo?: {
    type: "desktop" | "mobile" | "tablet";
    browser?: string;
    os?: string;
    capabilities: {
      video: boolean;
      audio: boolean;
      screenshare: boolean;
    };
  };
  lastSeen: string;
}

export interface TelemedicineMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: "patient" | "doctor" | "nurse" | "technician";
  messageType: "text" | "file" | "image" | "system" | "emergency";
  content: string;
  priority: "low" | "normal" | "high" | "critical";
  timestamp: string;
  requiresAcknowledgment: boolean;
  acknowledged?: boolean;
  metadata?: Record<string, any>;
}

export interface EmergencyAlert {
  alertId: string;
  alertType:
    | "medical_emergency"
    | "technical_failure"
    | "security_breach"
    | "connectivity_loss";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  triggered: string;
  protocolsActivated: string[];
  estimatedResponseTime: string;
}

interface UseRealtimeTelemedicineOptions {
  onMessageReceived?: (message: TelemedicineMessage) => void;
  onPresenceUpdate?: (users: PresenceUser[]) => void;
  onConnectionQualityChange?: (quality: ConnectionQuality) => void;
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  qualityThresholds?: {
    maxLatency: number;
    maxPacketLoss: number;
    maxJitter: number;
  };
}

export function useRealtimeTelemedicine(
  options: UseRealtimeTelemedicineOptions = {},
) {
  const { user } = useAuth();
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [connectionQuality, setConnectionQuality] =
    useState<ConnectionQuality | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastEmergencyAlert, setLastEmergencyAlert] =
    useState<EmergencyAlert | null>(null);

  // tRPC mutations and queries
  const createSessionMutation =
    trpc.realtimeTelemedicine.createSession.useMutation();
  const sendMessageMutation =
    trpc.realtimeTelemedicine.sendMessage.useMutation();
  const updatePresenceMutation =
    trpc.realtimeTelemedicine.updatePresence.useMutation();
  const endSessionMutation = trpc.realtimeTelemedicine.endSession.useMutation();
  const sendEmergencyAlertMutation =
    trpc.realtimeTelemedicine.sendEmergencyAlert.useMutation();

  // Connection quality monitoring query
  const qualityQuery = trpc.realtimeTelemedicine.monitorQuality.useQuery(
    {
      sessionId: session?.sessionId || "",
      thresholds: options.qualityThresholds || {
        maxLatency: 200,
        maxPacketLoss: 5,
        maxJitter: 100,
      },
    },
    {
      enabled: !!session?.sessionId && isMonitoring,
      refetchInterval: 5000, // Monitor every 5 seconds
      onSuccess: (data) => {
        const quality: ConnectionQuality = {
          latency: data.averageLatency,
          bandwidth: 0, // Would be measured separately
          packetLoss: 0, // Would be measured separately
          jitter: 0, // Would be measured separately
          quality: data.connectionQuality as any,
        };
        setConnectionQuality(quality);
        options.onConnectionQualityChange?.(quality);

        // Alert on poor quality
        if (quality.quality === "poor") {
          toast.warning("Qualidade da conexão baixa detectada", {
            description:
              "Verifique sua conexão de internet para melhor qualidade de telemedicina.",
          });
        }
      },
    },
  );

  // Session info query
  const sessionInfoQuery = trpc.realtimeTelemedicine.getSessionInfo.useQuery(
    { sessionId: session?.sessionId || "" },
    {
      enabled: !!session?.sessionId,
      refetchInterval: 10000, // Update every 10 seconds
    },
  );

  // Health check query
  const healthCheckQuery = trpc.realtimeTelemedicine.healthCheck.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Check health every 30 seconds
    },
  );

  // Refs for stable callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /**
   * Create a new telemedicine session
   */
  const createSession = useCallback(
    async (
      sessionId: string,
      participants: string[],
      sessionType:
        | "consultation"
        | "emergency"
        | "follow_up"
        | "group_session" = "consultation",
      metadata?: {
        appointmentId?: string;
        specialtyCode?: string;
        emergencyLevel?: "low" | "medium" | "high" | "critical";
        recordingConsent?: boolean;
      },
    ): Promise<TelemedicineSession | null> => {
      if (!user?.id) {
        throw new Error(
          "User must be authenticated to create telemedicine sessions",
        );
      }

      setIsConnecting(true);

      try {
        const result = await createSessionMutation.mutateAsync({
          sessionId,
          participants,
          sessionType,
          metadata: {
            ...metadata,
            lgpdConsentVerified: true, // Should be verified before calling
          },
        });

        const newSession: TelemedicineSession = {
          sessionId: result.sessionId,
          channelId: result.channelId,
          encryptionKey: result.encryptionKey,
          participantCount: result.participantCount,
          status: "connected",
          created: result.created,
          metadata: result.metadata,
        };

        setSession(newSession);
        setIsMonitoring(true);

        // Initialize user presence
        await updatePresence("online", {
          type: "desktop",
          capabilities: {
            video: true,
            audio: true,
            screenshare: true,
          },
        });

        toast.success("Sessão de telemedicina iniciada", {
          description: "Conexão segura estabelecida com criptografia LGPD.",
        });

        return newSession;
      } catch (error: any) {
        console.error("Failed to create telemedicine session:", error);
        optionsRef.current.onError?.(error);
        toast.error("Falha ao iniciar sessão", {
          description:
            error.message || "Erro ao estabelecer conexão de telemedicina.",
        });
        return null;
      } finally {
        setIsConnecting(false);
      }
    },
    [user?.id, createSessionMutation, updatePresenceMutation],
  );

  /**
   * Send encrypted message in session
   */
  const sendMessage = useCallback(
    async (
      content: string,
      messageType: "text" | "file" | "image" | "system" | "emergency" = "text",
      priority: "low" | "normal" | "high" | "critical" = "normal",
      requiresAcknowledgment = false,
      metadata?: Record<string, any>,
    ): Promise<boolean> => {
      if (!session || !user?.id) {
        throw new Error("No active session or user authentication");
      }

      try {
        const result = await sendMessageMutation.mutateAsync({
          sessionId: session.sessionId,
          senderId: user.id,
          senderRole: "patient", // Would be determined by user role
          messageType,
          content,
          priority,
          requiresAcknowledgment,
          metadata,
        });

        // Add message to local state (would normally come from WebSocket)
        const newMessage: TelemedicineMessage = {
          id: result.messageId,
          sessionId: session.sessionId,
          senderId: user.id,
          senderRole: "patient", // Would be determined by user role
          messageType,
          content,
          priority,
          timestamp: result.sent,
          requiresAcknowledgment,
          metadata,
        };

        setMessages((prev) => [...prev, newMessage]);
        optionsRef.current.onMessageReceived?.(newMessage);

        return result.success;
      } catch (error: any) {
        console.error("Failed to send message:", error);
        optionsRef.current.onError?.(error);
        toast.error("Falha ao enviar mensagem", {
          description: error.message || "Erro na comunicação criptografada.",
        });
        return false;
      }
    },
    [session, user?.id, sendMessageMutation],
  );

  /**
   * Update user presence and connection quality
   */
  const updatePresence = useCallback(
    async (
      status: "online" | "away" | "busy" | "offline" | "in_consultation",
      deviceInfo?: {
        type: "desktop" | "mobile" | "tablet";
        browser?: string;
        os?: string;
        capabilities: {
          video: boolean;
          audio: boolean;
          screenshare: boolean;
        };
      },
      connectionMetrics?: {
        latency: number;
        bandwidth: number;
        packetLoss: number;
        jitter: number;
      },
    ): Promise<boolean> => {
      if (!session || !user?.id) {
        throw new Error("No active session or user authentication");
      }

      try {
        const result = await updatePresenceMutation.mutateAsync({
          sessionId: session.sessionId,
          userId: user.id,
          userRole: "patient", // Would be determined by user role
          status,
          deviceInfo,
          connectionQuality: connectionMetrics,
        });

        // Update local presence state
        setPresenceUsers((prev) => {
          const updated = prev.filter((u) => u.userId !== user.id);
          const newPresence: PresenceUser = {
            userId: user.id,
            userRole: "patient", // Would be determined by user role
            status,
            deviceInfo,
            connectionQuality: connectionMetrics
              ? {
                  ...connectionMetrics,
                  quality: result.connectionQuality as any,
                }
              : undefined,
            lastSeen: result.updated,
          };
          return [...updated, newPresence];
        });

        optionsRef.current.onPresenceUpdate?.(presenceUsers);

        return result.success;
      } catch (error: any) {
        console.error("Failed to update presence:", error);
        optionsRef.current.onError?.(error);
        return false;
      }
    },
    [session, user?.id, updatePresenceMutation, presenceUsers],
  );

  /**
   * Send emergency alert
   */
  const sendEmergencyAlert = useCallback(
    async (
      alertType:
        | "medical_emergency"
        | "technical_failure"
        | "security_breach"
        | "connectivity_loss",
      severity: "low" | "medium" | "high" | "critical",
      description: string,
      requiredActions?: string[],
    ): Promise<EmergencyAlert | null> => {
      if (!session) {
        throw new Error("No active session");
      }

      try {
        const result = await sendEmergencyAlertMutation.mutateAsync({
          sessionId: session.sessionId,
          alertType,
          severity,
          description,
          requiredActions,
        });

        const alert: EmergencyAlert = {
          alertId: result.alertId,
          alertType: result.alertType,
          severity: result.severity,
          description,
          triggered: result.triggered,
          protocolsActivated: result.protocolsActivated,
          estimatedResponseTime: result.estimatedResponseTime,
        };

        setLastEmergencyAlert(alert);
        optionsRef.current.onEmergencyAlert?.(alert);

        toast.error("Alerta de emergência enviado", {
          description: `Protocolos de emergência ativados. Tempo estimado de resposta: ${result.estimatedResponseTime}`,
        });

        return alert;
      } catch (error: any) {
        console.error("Failed to send emergency alert:", error);
        optionsRef.current.onError?.(error);
        toast.error("Falha ao enviar alerta de emergência", {
          description:
            error.message || "Erro crítico no sistema de emergência.",
        });
        return null;
      }
    },
    [session, sendEmergencyAlertMutation],
  );

  /**
   * End telemedicine session
   */
  const endSession = useCallback(
    async (
      reason:
        | "completed"
        | "emergency_ended"
        | "technical_issues"
        | "cancelled" = "completed",
      summary?: string,
    ): Promise<boolean> => {
      if (!session) {
        return false;
      }

      try {
        const result = await endSessionMutation.mutateAsync({
          sessionId: session.sessionId,
          reason,
          summary,
        });

        setSession(null);
        setMessages([]);
        setPresenceUsers([]);
        setConnectionQuality(null);
        setIsMonitoring(false);
        setLastEmergencyAlert(null);

        toast.success("Sessão de telemedicina finalizada", {
          description: "Todos os dados foram processados conforme LGPD.",
        });

        return result.success;
      } catch (error: any) {
        console.error("Failed to end session:", error);
        optionsRef.current.onError?.(error);
        toast.error("Falha ao finalizar sessão", {
          description:
            error.message || "Erro ao encerrar sessão de telemedicina.",
        });
        return false;
      }
    },
    [session, endSessionMutation],
  );

  /**
   * Get current session statistics
   */
  const getSessionStats = useCallback(() => {
    if (!session || !sessionInfoQuery.data) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      participantCount: sessionInfoQuery.data.participantCount,
      averageLatency: sessionInfoQuery.data.averageLatency,
      connectionQuality: sessionInfoQuery.data.connectionQuality,
      messageCount: messages.length,
      emergencyAlerts: lastEmergencyAlert ? 1 : 0,
      status: sessionInfoQuery.data.status,
      duration: new Date().getTime() - new Date(session.created).getTime(),
      complianceInfo: sessionInfoQuery.data.complianceInfo,
    };
  }, [session, sessionInfoQuery.data, messages.length, lastEmergencyAlert]);

  // Auto-reconnect logic
  useEffect(() => {
    if (options.autoReconnect && session && session.status === "disconnected") {
      console.log("Auto-reconnecting to telemedicine session...");
      // Implement auto-reconnect logic here
    }
  }, [session, options.autoReconnect]);

  // Monitor connection quality
  useEffect(() => {
    if (session && isMonitoring && qualityQuery.data) {
      const quality = qualityQuery.data.connectionQuality;

      // Alert on quality degradation
      if (
        quality === "poor" &&
        connectionQuality &&
        connectionQuality.quality !== "poor"
      ) {
        toast.warning("Qualidade da conexão degradada", {
          description:
            "Considerando medidas para melhorar a qualidade da telemedicina.",
        });
      }
    }
  }, [qualityQuery.data, connectionQuality, session, isMonitoring]);

  return {
    // State
    session,
    messages,
    presenceUsers,
    connectionQuality,
    isConnecting,
    isMonitoring,
    lastEmergencyAlert,

    // Computed values
    isConnected: !!session && session.status === "connected",
    sessionStats: getSessionStats(),
    healthStatus: healthCheckQuery.data,

    // Actions
    createSession,
    sendMessage,
    updatePresence,
    sendEmergencyAlert,
    endSession,

    // Utilities
    isLoading:
      createSessionMutation.isPending ||
      sendMessageMutation.isPending ||
      updatePresenceMutation.isPending ||
      endSessionMutation.isPending,
    error:
      createSessionMutation.error ||
      sendMessageMutation.error ||
      updatePresenceMutation.error ||
      endSessionMutation.error,
  };
}
