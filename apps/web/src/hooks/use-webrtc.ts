/**
 * WebRTC Client Service for Telemedicine Platform
 * Comprehensive WebRTC implementation with signaling, peer connections, and media management
 * CFM 2.314/2022 compliant with LGPD data protection
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Import tRPC client for backend communication
import { trpc } from "@/lib/trpc";

// Import secure WebRTC configuration
import { SECURE_WEBRTC_CONFIG } from "../lib/webrtc/secure-config";

/**
 * WebRTC Configuration following CFM guidelines with enhanced security
 */
const WEBRTC_CONFIG: RTCConfiguration = SECURE_WEBRTC_CONFIG;

/**
 * Media constraints for medical consultation quality
 */
const MEDICAL_MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 15, ideal: 30, max: 60 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  },
};

export interface WebRTCState {
  connectionState: RTCPeerConnectionState;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeakerEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  bandwidth: number;
  latency: number;
  packetsLost: number;
  jitter: number;
}

export interface MediaSettings {
  video: boolean;
  audio: boolean;
  videoQuality: "low" | "medium" | "high" | "auto";
  audioQuality: "low" | "medium" | "high" | "auto";
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface SignalingMessage {
  type:
    | "offer"
    | "answer"
    | "ice-candidate"
    | "session-end"
    | "media-update"
    | "connection-quality";
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

/**
 * Comprehensive WebRTC Hook for Telemedicine Sessions
 * Handles peer connections, media streams, signaling, and compliance
 */
export function useWebRTC(sessionId: string, participantId: string) {
  // State management
  const [state, setState] = useState<WebRTCState>({
    connectionState: "new",
    connectionQuality: "excellent",
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isSpeakerEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    bandwidth: 0,
    latency: 0,
    packetsLost: 0,
    jitter: 0,
  });

  const [mediaSettings, setMediaSettings] = useState<MediaSettings>({
    video: true,
    audio: true,
    videoQuality: "auto",
    audioQuality: "auto",
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });

  // Refs for WebRTC components
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const signalingStateRef = useRef<"connecting" | "connected" | "disconnected">(
    "disconnected",
  );
  const statisticsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations for signaling
  const sendSignalingMessage =
    trpc.telemedicine.sendSignalingMessage.useMutation();
  const updateConnectionStats =
    trpc.telemedicine.updateConnectionStats.useMutation();
  const logComplianceEvent = trpc.telemedicine.logComplianceEvent.useMutation();

  // WebRTC signaling subscription
  trpc.telemedicine.onSignalingMessage.useSubscription(
    { sessionId, participantId },
    {
      onData: handleSignalingMessage,
      onError: (error) => {
        console.error("Signaling error:", error);
        toast.error("Erro na comunicação WebRTC");
      },
    },
  );

  /**
   * Initialize WebRTC peer connection with compliance logging
   */
  const initializePeerConnection = useCallback(async () => {
    try {
      // Log compliance event
      await logComplianceEvent.mutateAsync({
        sessionId,
        participantId,
        eventType: "webrtc_initialization",
        details: "WebRTC peer connection initialization started",
        cfmCompliant: true,
        lgpdCompliant: true,
      });

      const peerConnection = new RTCPeerConnection(WEBRTC_CONFIG);
      peerConnectionRef.current = peerConnection;

      // Set up connection state handlers
      peerConnection.onconnectionstatechange = () => {
        setState((prev) => ({
          ...prev,
          connectionState: peerConnection.connectionState,
        }));

        if (peerConnection.connectionState === "connected") {
          toast.success("Conexão WebRTC estabelecida");
          startStatisticsMonitoring();
        } else if (peerConnection.connectionState === "failed") {
          toast.error("Falha na conexão WebRTC");
          handleConnectionFailure();
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage.mutate({
            type: "ice-candidate",
            sessionId,
            to: "remote", // This would be determined by session participants
            data: event.candidate,
            compliance: {
              encrypted: true,
              auditLogged: true,
              cfmCompliant: true,
            },
          });
        }
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setState((prev) => ({ ...prev, remoteStream }));

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        // Log media reception for compliance
        logComplianceEvent.mutate({
          sessionId,
          participantId,
          eventType: "remote_media_received",
          details: "Remote media stream received and displayed",
          cfmCompliant: true,
          lgpdCompliant: true,
        });
      };

      // Set up data channel for chat and control messages
      const dataChannel = peerConnection.createDataChannel("telemedicine", {
        ordered: true,
        maxRetransmits: 3,
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("Data channel opened");
      };

      dataChannel.onmessage = (event) => {
        handleDataChannelMessage(JSON.parse(event.data));
      };

      return peerConnection;
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      toast.error("Erro ao inicializar conexão WebRTC");
      throw error;
    }
  }, [sessionId, participantId, sendSignalingMessage, logComplianceEvent]);

  /**
   * Initialize local media stream with medical-grade quality
   */
  const initializeLocalMedia = useCallback(async () => {
    try {
      const constraints = {
        video: mediaSettings.video
          ? {
              ...MEDICAL_MEDIA_CONSTRAINTS.video,
              width: getVideoConstraintsByQuality(mediaSettings.videoQuality)
                .width,
              height: getVideoConstraintsByQuality(mediaSettings.videoQuality)
                .height,
            }
          : false,
        audio: mediaSettings.audio
          ? {
              ...MEDICAL_MEDIA_CONSTRAINTS.audio,
              echoCancellation: mediaSettings.echoCancellation,
              noiseSuppression: mediaSettings.noiseSuppression,
              autoGainControl: mediaSettings.autoGainControl,
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setState((prev) => ({ ...prev, localStream: stream }));

      if (localVideoRef.current && stream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection if initialized
      if (peerConnectionRef.current) {
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      // Log media initialization for compliance
      await logComplianceEvent.mutateAsync({
        sessionId,
        participantId,
        eventType: "local_media_initialized",
        details: `Local media initialized - Video: ${!!constraints.video}, Audio: ${!!constraints.audio}`,
        cfmCompliant: true,
        lgpdCompliant: true,
      });

      toast.success("Mídia local inicializada");
      return stream;
    } catch (error) {
      console.error("Error accessing local media:", error);
      toast.error("Erro ao acessar câmera e microfone");
      throw error;
    }
  }, [mediaSettings, sessionId, participantId, logComplianceEvent]);

  /**
   * Handle incoming signaling messages
   */
  async function handleSignalingMessage(message: SignalingMessage) {
    if (!peerConnectionRef.current) return;

    try {
      switch (message.type) {
        case "offer":
          await peerConnectionRef.current.setRemoteDescription(message.data);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          sendSignalingMessage.mutate({
            type: "answer",
            sessionId,
            to: message.from,
            data: answer,
            compliance: message.compliance,
          });
          break;

        case "answer":
          await peerConnectionRef.current.setRemoteDescription(message.data);
          break;

        case "ice-candidate":
          await peerConnectionRef.current.addIceCandidate(message.data);
          break;

        case "media-update":
          handleRemoteMediaUpdate(message.data);
          break;

        case "connection-quality":
          updateConnectionQualityFromRemote(message.data);
          break;

        case "session-end":
          await endSession();
          break;
      }
    } catch (error) {
      console.error("Error handling signaling message:", error);
      toast.error("Erro no processamento de sinalização");
    }
  }

  /**
   * Create and send offer to start session
   */
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      throw new Error("Peer connection not initialized");
    }

    try {
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);

      sendSignalingMessage.mutate({
        type: "offer",
        sessionId,
        to: "remote", // This would be determined by session participants
        data: offer,
        compliance: {
          encrypted: true,
          auditLogged: true,
          cfmCompliant: true,
        },
      });

      toast.success("Oferta WebRTC enviada");
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Erro ao criar oferta WebRTC");
      throw error;
    }
  }, [sessionId, sendSignalingMessage]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(async () => {
    try {
      if (state.localStream) {
        const videoTrack = state.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setState((prev) => ({ ...prev, isVideoEnabled: videoTrack.enabled }));

          // Notify remote participant
          sendSignalingMessage.mutate({
            type: "media-update",
            sessionId,
            to: "remote",
            data: { video: videoTrack.enabled },
            compliance: {
              encrypted: true,
              auditLogged: true,
              cfmCompliant: true,
            },
          });

          // Log compliance event
          await logComplianceEvent.mutateAsync({
            sessionId,
            participantId,
            eventType: "video_toggle",
            details: `Video ${videoTrack.enabled ? "enabled" : "disabled"}`,
            cfmCompliant: true,
            lgpdCompliant: true,
          });

          toast.success(`Vídeo ${videoTrack.enabled ? "ligado" : "desligado"}`);
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      toast.error("Erro ao alternar vídeo");
    }
  }, [
    state.localStream,
    sessionId,
    participantId,
    sendSignalingMessage,
    logComplianceEvent,
  ]);

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(async () => {
    try {
      if (state.localStream) {
        const audioTrack = state.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setState((prev) => ({ ...prev, isAudioEnabled: audioTrack.enabled }));

          // Notify remote participant
          sendSignalingMessage.mutate({
            type: "media-update",
            sessionId,
            to: "remote",
            data: { audio: audioTrack.enabled },
            compliance: {
              encrypted: true,
              auditLogged: true,
              cfmCompliant: true,
            },
          });

          // Log compliance event
          await logComplianceEvent.mutateAsync({
            sessionId,
            participantId,
            eventType: "audio_toggle",
            details: `Audio ${audioTrack.enabled ? "enabled" : "disabled"}`,
            cfmCompliant: true,
            lgpdCompliant: true,
          });

          toast.success(`Áudio ${audioTrack.enabled ? "ligado" : "desligado"}`);
        }
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast.error("Erro ao alternar áudio");
    }
  }, [
    state.localStream,
    sessionId,
    participantId,
    sendSignalingMessage,
    logComplianceEvent,
  ]);

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: true,
      });

      // Replace video track in peer connection
      if (peerConnectionRef.current && state.localStream) {
        const videoSender = peerConnectionRef.current
          .getSenders()
          .find((sender) => sender.track && sender.track.kind === "video");

        if (videoSender) {
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          await videoSender.replaceTrack(screenVideoTrack);

          // Update local video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          setState((prev) => ({ ...prev, isScreenSharing: true }));

          // Handle screen share end
          screenVideoTrack.onended = () => {
            stopScreenShare();
          };

          // Log compliance event
          await logComplianceEvent.mutateAsync({
            sessionId,
            participantId,
            eventType: "screen_share_started",
            details: "Screen sharing initiated",
            cfmCompliant: true,
            lgpdCompliant: true,
          });

          toast.success("Compartilhamento de tela iniciado");
        }
      }
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast.error("Erro ao compartilhar tela");
    }
  }, [state.localStream, sessionId, participantId, logComplianceEvent]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(async () => {
    try {
      if (state.localStream && peerConnectionRef.current) {
        const videoSender = peerConnectionRef.current
          .getSenders()
          .find((sender) => sender.track && sender.track.kind === "video");

        if (videoSender) {
          const cameraVideoTrack = state.localStream.getVideoTracks()[0];
          await videoSender.replaceTrack(cameraVideoTrack);

          // Restore local video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = state.localStream;
          }

          setState((prev) => ({ ...prev, isScreenSharing: false }));

          // Log compliance event
          await logComplianceEvent.mutateAsync({
            sessionId,
            participantId,
            eventType: "screen_share_stopped",
            details: "Screen sharing ended",
            cfmCompliant: true,
            lgpdCompliant: true,
          });

          toast.success("Compartilhamento de tela finalizado");
        }
      }
    } catch (error) {
      console.error("Error stopping screen share:", error);
      toast.error("Erro ao parar compartilhamento de tela");
    }
  }, [state.localStream, sessionId, participantId, logComplianceEvent]);

  /**
   * Start statistics monitoring for connection quality
   */
  const startStatisticsMonitoring = useCallback(() => {
    if (statisticsIntervalRef.current) {
      clearInterval(statisticsIntervalRef.current);
    }

    statisticsIntervalRef.current = setInterval(async () => {
      if (peerConnectionRef.current) {
        try {
          const stats = await peerConnectionRef.current.getStats();
          const connectionStats = parseWebRTCStats(stats);

          setState((prev) => ({
            ...prev,
            bandwidth: connectionStats.bandwidth,
            latency: connectionStats.latency,
            packetsLost: connectionStats.packetsLost,
            jitter: connectionStats.jitter,
            connectionQuality: calculateConnectionQuality(connectionStats),
          }));

          // Update backend with connection stats
          updateConnectionStats.mutate({
            sessionId,
            participantId,
            stats: connectionStats,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Error collecting WebRTC stats:", error);
        }
      }
    }, 5000); // Update every 5 seconds
  }, [sessionId, participantId, updateConnectionStats]);

  /**
   * End WebRTC session and cleanup resources
   */
  const endSession = useCallback(async () => {
    try {
      // Stop statistics monitoring
      if (statisticsIntervalRef.current) {
        clearInterval(statisticsIntervalRef.current);
        statisticsIntervalRef.current = null;
      }

      // Stop local media tracks
      if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Close data channel
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // Reset state
      setState({
        connectionState: "closed",
        connectionQuality: "disconnected",
        localStream: null,
        remoteStream: null,
        isVideoEnabled: false,
        isAudioEnabled: false,
        isSpeakerEnabled: false,
        isScreenSharing: false,
        isRecording: false,
        bandwidth: 0,
        latency: 0,
        packetsLost: 0,
        jitter: 0,
      });

      // Log compliance event
      await logComplianceEvent.mutateAsync({
        sessionId,
        participantId,
        eventType: "session_ended",
        details: "WebRTC session ended and resources cleaned up",
        cfmCompliant: true,
        lgpdCompliant: true,
      });

      toast.success("Sessão WebRTC finalizada");
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Erro ao finalizar sessão");
    }
  }, [state.localStream, sessionId, participantId, logComplianceEvent]);

  /**
   * Initialize complete WebRTC session
   */
  const initializeSession = useCallback(async () => {
    try {
      await initializePeerConnection();
      await initializeLocalMedia();
      toast.success("Sessão WebRTC inicializada");
    } catch (error) {
      console.error("Error initializing WebRTC session:", error);
      toast.error("Erro ao inicializar sessão WebRTC");
      throw error;
    }
  }, [initializePeerConnection, initializeLocalMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    // State
    state,
    mediaSettings,

    // Refs
    localVideoRef,
    remoteVideoRef,

    // Methods
    initializeSession,
    createOffer,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    endSession,
    setMediaSettings,

    // Utils
    isConnected: state.connectionState === "connected",
    isConnecting: state.connectionState === "connecting",
    hasLocalVideo: !!state.localStream?.getVideoTracks().length,
    hasLocalAudio: !!state.localStream?.getAudioTracks().length,
    hasRemoteVideo: !!state.remoteStream?.getVideoTracks().length,
    hasRemoteAudio: !!state.remoteStream?.getAudioTracks().length,
  };
}

// Helper functions

function getVideoConstraintsByQuality(quality: string) {
  switch (quality) {
    case "low":
      return { width: { ideal: 640 }, height: { ideal: 480 } };
    case "medium":
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
    case "high":
      return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    case "auto":
    default:
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
  }
}

function parseWebRTCStats(stats: RTCStatsReport) {
  let bandwidth = 0;
  let latency = 0;
  let packetsLost = 0;
  let jitter = 0;

  stats.forEach((report) => {
    if (report.type === "inbound-rtp" && report.mediaType === "video") {
      bandwidth = report.bytesReceived ? (report.bytesReceived * 8) / 1024 : 0;
      packetsLost = report.packetsLost || 0;
      jitter = report.jitter || 0;
    } else if (
      report.type === "candidate-pair" &&
      report.state === "succeeded"
    ) {
      latency = report.currentRoundTripTime
        ? report.currentRoundTripTime * 1000
        : 0;
    }
  });

  return { bandwidth, latency, packetsLost, jitter };
}

function calculateConnectionQuality(
  stats: any,
): "excellent" | "good" | "poor" | "disconnected" {
  if (stats.latency > 500 || stats.packetsLost > 5) {
    return "poor";
  } else if (stats.latency > 200 || stats.packetsLost > 1) {
    return "good";
  } else {
    return "excellent";
  }
}

function handleDataChannelMessage(message: any) {
  // Handle data channel messages (chat, control, etc.)
  console.log("Data channel message:", message);
}

function handleRemoteMediaUpdate(data: any) {
  // Handle remote media updates (video/audio toggle notifications)
  console.log("Remote media update:", data);
}

function updateConnectionQualityFromRemote(data: any) {
  // Handle connection quality updates from remote peer
  console.log("Remote connection quality:", data);
}

function handleConnectionFailure() {
  // Handle connection failure and attempt reconnection
  console.log("Connection failed, attempting reconnection...");
  // Implement reconnection logic here
}
