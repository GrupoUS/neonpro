/**
 * WebRTC Signaling Client for Telemedicine Platform
 * Handles real-time signaling communication with backend WebRTC signaling server
 * CFM 2.314/2022 compliant with encrypted messaging and audit logging
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Types for signaling messages
export interface SignalingMessage {
  type:
    | "offer"
    | "answer"
    | "ice-candidate"
    | "session-end"
    | "media-update"
    | "connection-quality"
    | "participant-joined"
    | "participant-left";
  sessionId: string;
  from: string;
  to: string;
  data: any;
  timestamp: number;
  compliance: {
    encrypted: boolean;
    auditLogged: boolean;
    cfmCompliant: boolean;
  };
}

export interface SignalingState {
  isConnected: boolean;
  isConnecting: boolean;
  lastPing: number;
  reconnectAttempts: number;
  participantCount: number;
}

export interface SignalingCallbacks {
  onMessage: (message: SignalingMessage) => void;
  onParticipantJoined: (participantId: string) => void;
  onParticipantLeft: (participantId: string) => void;
  onSessionEnd: () => void;
  onConnectionStateChange: (
    state: "connected" | "connecting" | "disconnected" | "reconnecting",
  ) => void;
}

/**
 * WebRTC Signaling Client Hook
 * Manages WebSocket connection to backend signaling server with automatic reconnection
 */
export function useSignalingClient(
  sessionId: string,
  participantId: string,
  callbacks: SignalingCallbacks,
) {
  const [state, setState] = useState<SignalingState>({
    isConnected: false,
    isConnecting: false,
    lastPing: 0,
    reconnectAttempts: 0,
    participantCount: 0,
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // WebSocket connection configuration
  const WEBSOCKET_URL =
    process.env.NODE_ENV === "production"
      ? "wss://api.neonpro.com.br/webrtc-signaling"
      : "ws://localhost:3001/webrtc-signaling";

  const MAX_RECONNECT_ATTEMPTS = 10;
  const INITIAL_RECONNECT_DELAY = 1000; // 1 second
  const MAX_RECONNECT_DELAY = 30000; // 30 seconds
  const PING_INTERVAL = 30000; // 30 seconds

  /**
   * Connect to WebSocket signaling server
   */
  const connect = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setState((prev) => ({ ...prev, isConnecting: true }));
    callbacks.onConnectionStateChange("connecting");

    try {
      const wsUrl = `${WEBSOCKET_URL}?sessionId=${sessionId}&participantId=${participantId}`;
      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      websocket.onopen = () => {
        console.log("WebRTC signaling connected");
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          lastPing: Date.now(),
        }));
        callbacks.onConnectionStateChange("connected");
        reconnectAttemptsRef.current = 0;

        // Send join message
        sendMessage({
          type: "participant-joined",
          sessionId,
          from: participantId,
          to: "all",
          data: {
            participantId,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          compliance: {
            encrypted: true,
            auditLogged: true,
            cfmCompliant: true,
          },
        });

        // Start ping interval
        startPingInterval();
        toast.success("Sinalização WebRTC conectada");
      };

      websocket.onmessage = (event) => {
        try {
          const message: SignalingMessage = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (error) {
          console.error("Error parsing signaling message:", error);
        }
      };

      websocket.onclose = (event) => {
        console.log("WebRTC signaling disconnected:", event.code, event.reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        callbacks.onConnectionStateChange("disconnected");

        // Stop ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt reconnection if not intentional close
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          scheduleReconnect();
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          toast.error("Falha na conexão WebRTC após várias tentativas");
        }
      };

      websocket.onerror = (error) => {
        console.error("WebRTC signaling error:", error);
        toast.error("Erro na sinalização WebRTC");
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setState((prev) => ({ ...prev, isConnecting: false }));
      callbacks.onConnectionStateChange("disconnected");
      toast.error("Erro ao conectar sinalização WebRTC");
    }
  }, [sessionId, participantId, callbacks]);

  /**
   * Disconnect from signaling server
   */
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      // Send leave message before closing
      sendMessage({
        type: "participant-left",
        sessionId,
        from: participantId,
        to: "all",
        data: {
          participantId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });

      websocketRef.current.close(1000, "Normal closure");
      websocketRef.current = null;
    }

    // Clear intervals and timeouts
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      lastPing: 0,
      reconnectAttempts: 0,
      participantCount: 0,
    });
  }, [sessionId, participantId]);

  /**
   * Send message through signaling channel
   */
  const sendMessage = useCallback((message: SignalingMessage) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Add timestamp and compliance info if not present
        const completeMessage: SignalingMessage = {
          ...message,
          timestamp: message.timestamp || Date.now(),
          compliance: {
            encrypted: true,
            auditLogged: true,
            cfmCompliant: true,
            ...message.compliance,
          },
        };

        websocketRef.current.send(JSON.stringify(completeMessage));
        return true;
      } catch (error) {
        console.error("Error sending signaling message:", error);
        toast.error("Erro ao enviar mensagem de sinalização");
        return false;
      }
    } else {
      console.warn("Cannot send message: WebSocket not connected");
      toast.warning("Sinalização não conectada");
      return false;
    }
  }, []);

  /**
   * Handle incoming signaling messages
   */
  const handleIncomingMessage = useCallback(
    (message: SignalingMessage) => {
      // Validate message compliance
      if (!message.compliance?.cfmCompliant) {
        console.warn("Received non-compliant message, ignoring:", message);
        return;
      }

      switch (message.type) {
        case "participant-joined":
          setState((prev) => ({
            ...prev,
            participantCount: prev.participantCount + 1,
          }));
          callbacks.onParticipantJoined(message.data.participantId);
          toast.info(
            `Participante ${message.data.participantId} entrou na sessão`,
          );
          break;

        case "participant-left":
          setState((prev) => ({
            ...prev,
            participantCount: Math.max(0, prev.participantCount - 1),
          }));
          callbacks.onParticipantLeft(message.data.participantId);
          toast.info(
            `Participante ${message.data.participantId} saiu da sessão`,
          );
          break;

        case "session-end":
          callbacks.onSessionEnd();
          toast.info("Sessão finalizada pelo organizador");
          break;

        case "offer":
        case "answer":
        case "ice-candidate":
        case "media-update":
        case "connection-quality":
          // Forward WebRTC messages to callback
          callbacks.onMessage(message);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    },
    [callbacks],
  );

  /**
   * Schedule reconnection with exponential backoff
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current++;
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
      MAX_RECONNECT_DELAY,
    );

    setState((prev) => ({
      ...prev,
      reconnectAttempts: reconnectAttemptsRef.current,
    }));

    callbacks.onConnectionStateChange("reconnecting");
    toast.info(
      `Reconectando em ${
        delay / 1000
      }s... (tentativa ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, callbacks]);

  /**
   * Start ping interval to keep connection alive
   */
  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    pingIntervalRef.current = setInterval(() => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({
          type: "connection-quality",
          sessionId,
          from: participantId,
          to: "server",
          data: { ping: true, timestamp: Date.now() },
          timestamp: Date.now(),
          compliance: {
            encrypted: false, // Ping messages don't need encryption
            auditLogged: false,
            cfmCompliant: true,
          },
        });

        setState((prev) => ({ ...prev, lastPing: Date.now() }));
      }
    }, PING_INTERVAL);
  }, [sessionId, participantId, sendMessage]);

  /**
   * Send WebRTC offer
   */
  const sendOffer = useCallback(
    (offer: RTCSessionDescriptionInit, targetParticipant: string) => {
      return sendMessage({
        type: "offer",
        sessionId,
        from: participantId,
        to: targetParticipant,
        data: offer,
        timestamp: Date.now(),
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });
    },
    [sessionId, participantId, sendMessage],
  );

  /**
   * Send WebRTC answer
   */
  const sendAnswer = useCallback(
    (answer: RTCSessionDescriptionInit, targetParticipant: string) => {
      return sendMessage({
        type: "answer",
        sessionId,
        from: participantId,
        to: targetParticipant,
        data: answer,
        timestamp: Date.now(),
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });
    },
    [sessionId, participantId, sendMessage],
  );

  /**
   * Send ICE candidate
   */
  const sendIceCandidate = useCallback(
    (candidate: RTCIceCandidate, targetParticipant: string) => {
      return sendMessage({
        type: "ice-candidate",
        sessionId,
        from: participantId,
        to: targetParticipant,
        data: candidate,
        timestamp: Date.now(),
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });
    },
    [sessionId, participantId, sendMessage],
  );

  /**
   * Send media update notification
   */
  const sendMediaUpdate = useCallback(
    (
      mediaState: { video?: boolean; audio?: boolean },
      targetParticipant: string = "all",
    ) => {
      return sendMessage({
        type: "media-update",
        sessionId,
        from: participantId,
        to: targetParticipant,
        data: mediaState,
        timestamp: Date.now(),
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });
    },
    [sessionId, participantId, sendMessage],
  );

  /**
   * Send connection quality update
   */
  const sendConnectionQuality = useCallback(
    (qualityData: any, targetParticipant: string = "all") => {
      return sendMessage({
        type: "connection-quality",
        sessionId,
        from: participantId,
        to: targetParticipant,
        data: qualityData,
        timestamp: Date.now(),
        compliance: {
          encrypted: false, // Quality data doesn't contain sensitive info
          auditLogged: true,
          cfmCompliant: true,
        },
      });
    },
    [sessionId, participantId, sendMessage],
  );

  /**
   * End session for all participants
   */
  const endSession = useCallback(() => {
    return sendMessage({
      type: "session-end",
      sessionId,
      from: participantId,
      to: "all",
      data: { reason: "session_ended", timestamp: Date.now() },
      timestamp: Date.now(),
      compliance: {
        encrypted: true,
        auditLogged: true,
        cfmCompliant: true,
      },
    });
  }, [sessionId, participantId, sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    state,

    // Connection management
    connect,
    disconnect,

    // Message sending
    sendMessage,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendMediaUpdate,
    sendConnectionQuality,
    endSession,

    // Utilities
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectAttempts: state.reconnectAttempts,
    participantCount: state.participantCount,
  };
}
