/**
 * WebRTC Session Management Service
 * Handles real-time video calling for telemedicine with CFM compliance
 */

import { createClient } from "../client";
// import type { Database } from '../types/supabase';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  turnCredentials?: {
    username: string;
    credential: string;
    urls: string[];
  };
  videoConstraints: MediaStreamConstraints["video"];
  audioConstraints: MediaStreamConstraints["audio"];
}

export interface SessionParticipant {
  id: string;
  _role: "doctor" | "patient" | "observer";
  peerId: string;
  platform: string;
  deviceInfo: any;
  ipAddress: string;
  connectionState:
    | "new"
    | "connecting"
    | "connected"
    | "disconnected"
    | "failed";
  joinedAt: Date;
  lastActivity: Date;
}

export interface SessionQualityMetrics {
  bandwidth: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  videoQuality: 1 | 2 | 3 | 4 | 5;
  audioQuality: 1 | 2 | 3 | 4 | 5;
  connectionStability: 1 | 2 | 3 | 4 | 5;
}

export interface SessionRecording {
  enabled: boolean;
  consentObtained: boolean;
  consentMethod: "verbal" | "digital" | "written";
  consentTimestamp: Date;
  fileHash?: string;
  storageLocation?: string;
  retentionUntil: Date;
  encrypted: boolean;
  accessLog: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress: string;
  }>;
}

export class WebRTCSessionService {
  public supabase = createClient();

  /**
   * Initializes a WebRTC session for telemedicine
   */
  async initializeSession(telemedicineSessionId: string): Promise<{
    roomId: string;
    config: WebRTCConfig;
    sessionToken: string;
  }> {
    try {
      // Get telemedicine session details
      const { data: session, error: sessionError } = await this.supabase
        .from("telemedicine_sessions")
        .select(
          `
          *,
          appointment:appointments(*, patient:patients(*), professional:professionals(*))
        `,
        )
        .eq("id", telemedicineSessionId)
        .single();

      if (sessionError || !session) {
        throw new Error("Telemedicine session not found");
      }

      // Check if WebRTC session already exists
      let { data: webrtcSession, error: webrtcError } = await this.supabase
        .from("webrtc_sessions")
        .select("*")
        .eq("telemedicine_session_id", telemedicineSessionId)
        .single();

      if (webrtcError && webrtcError.code !== "PGRST116") {
        throw new Error(`WebRTC session error: ${webrtcError.message}`);
      }

      // Create WebRTC session if it doesn't exist
      if (!webrtcSession) {
        const roomId = this.generateRoomId();

        const { data: newSession, error: createError } = await this.supabase
          .from("webrtc_sessions")
          .insert({
            telemedicine_session_id: telemedicineSessionId,
            room_id: roomId,
            ice_servers: this.getDefaultICEServers(),
            video_enabled: true,
            audio_enabled: true,
            dtls_enabled: true,
            srtp_enabled: true,
            connection_state: "new",
          })
          .select()
          .single();

        if (createError) {
          throw new Error(
            `Failed to create WebRTC session: ${createError.message}`,
          );
        }

        webrtcSession = newSession;
      }

      // Generate WebRTC configuration
      const config: WebRTCConfig = {
        iceServers: webrtcSession.ice_servers as any as RTCIceServer[],
        videoConstraints: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      };

      // Add TURN servers for production (encrypted)
      if (process.env.NODE_ENV === "production") {
        config.turnCredentials = {
          username: process.env.TURN_USERNAME || "neonpro",
          credential: process.env.TURN_CREDENTIAL || "",
          urls: [
            "turn:turn.neonpro.com.br:3478",
            "turns:turn.neonpro.com.br:5349",
          ],
        };
      }

      return {
        roomId: webrtcSession.room_id,
        config,
        sessionToken: session.session_token,
      };
    } catch (_error) {
      console.error("Error initializing WebRTC session:", error);
      throw error;
    }
  }

  /**
   * Creates a new WebRTC session
   */
  /**
   * Creates a new telemedicine session in the database
   *
   * @param sessionData - Object containing patient and physician information
   * @returns Promise containing the session ID and room ID
   */
  async createSession(sessionData: {
    patientId: string;
    physicianId: string;
    sessionType: string;
    specialtyCode?: string;
  }): Promise<{ sessionId: string; roomId: string }> {
    try {
      const roomId = this.generateRoomId();

      const { data, error } = await this.supabase
        .from("telemedicine_sessions")
        .insert({
          patient_id: sessionData.patientId,
          physician_id: sessionData.physicianId,
          session_type: sessionData.sessionType,
          specialty_code: sessionData.specialtyCode,
          room_id: roomId,
          status: "created",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      return {
        sessionId: data.id,
        roomId,
      };
    } catch (_error) {
      console.error("Error creating WebRTC session:", error);
      throw error;
    }
  }

  /**
   * Starts a WebRTC session
   */
  /**
   * Starts a telemedicine session and initializes WebRTC connections
   *
   * @param sessionId - The ID of the session to start
   * @returns Promise resolving when session is successfully started
   */
  async startSession(sessionId: string): Promise<void> {
    try {
      // Update session status to active
      const { error } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        throw new Error(`Failed to start session: ${error.message}`);
      }

      // Log session start event
      await this.logSessionEvent(sessionId, {
        event: "session_started",
        timestamp: new Date().toISOString(),
      });

      // Initialize WebRTC connections
      await this.initializeSession(sessionId);
    } catch (_error) {
      console.error("Error starting session:", error);
      throw error;
    }
  }

  /**
   * Adds a participant to the WebRTC session
   */
  async addParticipant(
    roomId: string,
    participant: Omit<
      SessionParticipant,
      "joinedAt" | "lastActivity" | "connectionState"
    >,
  ): Promise<void> {
    try {
      // Get WebRTC session
      const { data: webrtcSession, error } = await this.supabase
        .from("webrtc_sessions")
        .select("*")
        .eq("room_id", roomId)
        .single();

      if (error || !webrtcSession) {
        throw new Error("WebRTC session not found");
      }

      // Add participant to the session
      const participants = webrtcSession.additional_participants || [];
      participants.push({
        ...participant,
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        connectionState: "connecting",
      });

      // Update session with new participant
      const { error: updateError } = await this.supabase
        .from("webrtc_sessions")
        .update({
          additional_participants: participants,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", webrtcSession.id);

      if (updateError) {
        throw new Error(`Failed to add participant: ${updateError.message}`);
      }

      // Log the event for audit trail
      await this.logSessionEvent(webrtcSession.telemedicine_session_id, {
        event: "participant_joined",
        participant_id: participant.id,
        participant_role: participant.role,
        timestamp: new Date().toISOString(),
        platform: participant.platform,
      });
    } catch (_error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  }

  /**
   * Updates session quality metrics
   */
  async updateQualityMetrics(
    roomId: string,
    metrics: SessionQualityMetrics,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("webrtc_sessions")
        .update({
          bandwidth_usage_mbps: metrics.bandwidth,
          rtt_ms: metrics.latency,
          jitter_ms: metrics.jitter,
          packet_loss_percentage: metrics.packetLoss,
          video_quality_score: metrics.videoQuality,
          audio_quality_score: metrics.audioQuality,
          connection_stability_score: metrics.connectionStability,
          last_activity_at: new Date().toISOString(),
        })
        .eq("room_id", roomId);

      if (error) {
        throw new Error(`Failed to update quality metrics: ${error.message}`);
      }

      // Check if quality is below acceptable thresholds
      if (
        metrics.packetLoss > 5 ||
        metrics.latency > 300 ||
        metrics.videoQuality <= 2
      ) {
        await this.handleQualityIssues(roomId, metrics);
      }
    } catch (_error) {
      console.error("Error updating quality metrics:", error);
      throw error;
    }
  }

  /**
   * Starts session recording with proper consent verification
   */
  async startRecording(
    roomId: string,
    consentMethod: "verbal" | "digital" | "written",
    consentEvidence?: any,
  ): Promise<{ recordingId: string; storageLocation: string }> {
    try {
      // Get WebRTC and telemedicine sessions
      const { data: webrtcSession, error: webrtcError } = await this.supabase
        .from("webrtc_sessions")
        .select(
          `
          *,
          telemedicine_session:telemedicine_sessions(*)
        `,
        )
        .eq("room_id", roomId)
        .single();

      if (webrtcError || !webrtcSession) {
        throw new Error("WebRTC session not found");
      }

      const telemedicineSession = webrtcSession.telemedicine_session;

      // Verify recording consent
      if (!telemedicineSession.recording_consent) {
        throw new Error(
          "Recording consent not obtained (CFM Resolution 2314/2022 violation)",
        );
      }

      // Generate recording metadata
      const recordingId = crypto.randomUUID();
      const storageLocation = `recordings/${telemedicineSession.clinic_id}/${recordingId}`;
      const retentionUntil = new Date();
      retentionUntil.setFullYear(retentionUntil.getFullYear() + 20); // 20 years retention as per CFM

      // Update telemedicine session with recording details
      const { error: updateError } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          recording_enabled: true,
          recording_consent_given_at: new Date().toISOString(),
          recording_consent_method: consentMethod,
          recording_storage_location: storageLocation,
          recording_retention_until: retentionUntil.toISOString(),
          recording_encrypted: true,
          recording_access_log: [
            {
              user_id: "system",
              action: "recording_started",
              timestamp: new Date().toISOString(),
              consent_method: consentMethod,
              consent_evidence: consentEvidence,
            },
          ],
        })
        .eq("id", telemedicineSession.id);

      if (updateError) {
        throw new Error(`Failed to start recording: ${updateError.message}`);
      }

      // Update WebRTC session
      await this.supabase
        .from("webrtc_sessions")
        .update({
          recording_enabled: true,
        })
        .eq("id", webrtcSession.id);

      // Log the event
      await this.logSessionEvent(telemedicineSession.id, {
        event: "recording_started",
        recording_id: recordingId,
        consent_method: consentMethod,
        storage_location: storageLocation,
        timestamp: new Date().toISOString(),
      });

      return {
        recordingId,
        storageLocation,
      };
    } catch (_error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  /**
   * Stops session recording and generates file hash for integrity
   */
  async stopRecording(roomId: string): Promise<{
    recordingId: string;
    fileHash: string;
    duration: number;
  }> {
    try {
      const { data: webrtcSession, error } = await this.supabase
        .from("webrtc_sessions")
        .select(
          `
          *,
          telemedicine_session:telemedicine_sessions(*)
        `,
        )
        .eq("room_id", roomId)
        .single();

      if (error || !webrtcSession) {
        throw new Error("WebRTC session not found");
      }

      const telemedicineSession = webrtcSession.telemedicine_session;

      if (!telemedicineSession.recording_enabled) {
        throw new Error("Recording is not active");
      }

      // Calculate recording duration
      const startTime = new Date(
        telemedicineSession.recording_consent_given_at!,
      );
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000,
      ); // seconds

      // Generate file hash for integrity (simulated - in production this would be calculated from actual file)
      const recordingId = crypto.randomUUID();
      const fileHash = this.generateFileHash(recordingId, duration);

      // Update telemedicine session
      const accessLog = telemedicineSession.recording_access_log || [];
      accessLog.push({
        user_id: "system",
        action: "recording_stopped",
        timestamp: new Date().toISOString(),
        duration_seconds: duration,
        file_hash: fileHash,
      });

      const { error: updateError } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          recording_file_hash: fileHash,
          recording_access_log: accessLog,
        })
        .eq("id", telemedicineSession.id);

      if (updateError) {
        throw new Error(`Failed to stop recording: ${updateError.message}`);
      }

      // Update WebRTC session
      await this.supabase
        .from("webrtc_sessions")
        .update({
          recording_enabled: false,
        })
        .eq("id", webrtcSession.id);

      // Log the event
      await this.logSessionEvent(telemedicineSession.id, {
        event: "recording_stopped",
        recording_id: recordingId,
        file_hash: fileHash,
        duration_seconds: duration,
        timestamp: new Date().toISOString(),
      });

      return {
        recordingId,
        fileHash,
        duration,
      };
    } catch (_error) {
      console.error("Error stopping recording:", error);
      throw error;
    }
  }

  /**
   * Ends the WebRTC session and updates metrics
   */
  /**
   * Ends a telemedicine session and performs cleanup operations
   *
   * @param sessionId - The ID of the session to end
   * @param reason - Optional reason for ending the session
   * @returns Promise resolving when session is successfully ended
   */
  async endSession(sessionId: string, reason?: string): Promise<void> {
    try {
      // Stop recording if active
      const { data: session } = await this.supabase
        .from("telemedicine_sessions")
        .select("recording_enabled")
        .eq("id", sessionId)
        .single();

      if (session?.recording_enabled) {
        await this.stopRecording(sessionId);
      }

      // Update session status
      const { error } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          end_reason: reason,
        })
        .eq("id", sessionId);

      if (error) {
        throw new Error(`Failed to end session: ${error.message}`);
      }

      // Log session end event
      await this.logSessionEvent(sessionId, {
        event: "session_ended",
        timestamp: new Date().toISOString(),
        reason,
      });
    } catch (_error) {
      console.error("Error ending session:", error);
      throw error;
    }
  }

  /**
   * Gets real-time session status
   */
  async getSessionStatus(roomId: string): Promise<{
    connectionState: string;
    participants: SessionParticipant[];
    qualityMetrics: SessionQualityMetrics;
    recording: SessionRecording;
    duration: number;
  }> {
    try {
      const { data: webrtcSession, error } = await this.supabase
        .from("webrtc_sessions")
        .select(
          `
          *,
          telemedicine_session:telemedicine_sessions(*)
        `,
        )
        .eq("room_id", roomId)
        .single();

      if (error || !webrtcSession) {
        throw new Error("WebRTC session not found");
      }

      const telemedicineSession = webrtcSession.telemedicine_session;
      const participants = webrtcSession.additional_participants || [];

      // Calculate session duration
      const startTime = new Date(
        webrtcSession.session_started_at || webrtcSession.created_at,
      );
      const duration = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000,
      );

      const qualityMetrics: SessionQualityMetrics = {
        bandwidth: webrtcSession.bandwidth_usage_mbps || 0,
        latency: webrtcSession.rtt_ms || 0,
        jitter: webrtcSession.jitter_ms || 0,
        packetLoss: webrtcSession.packet_loss_percentage || 0,
        videoQuality: webrtcSession.video_quality_score || 5,
        audioQuality: webrtcSession.audio_quality_score || 5,
        connectionStability: webrtcSession.connection_stability_score || 5,
      };

      const recording: SessionRecording = {
        enabled: telemedicineSession.recording_enabled || false,
        consentObtained: telemedicineSession.recording_consent || false,
        consentMethod:
          telemedicineSession.recording_consent_method || "digital",
        consentTimestamp: new Date(
          telemedicineSession.recording_consent_given_at || Date.now(),
        ),
        fileHash: telemedicineSession.recording_file_hash || undefined,
        storageLocation:
          telemedicineSession.recording_storage_location || undefined,
        retentionUntil: new Date(
          telemedicineSession.recording_retention_until || Date.now(),
        ),
        encrypted: telemedicineSession.recording_encrypted || true,
        accessLog: telemedicineSession.recording_access_log || [],
      };

      return {
        connectionState: webrtcSession.connection_state,
        participants,
        qualityMetrics,
        recording,
        duration,
      };
    } catch (_error) {
      console.error("Error getting session status:", error);
      throw error;
    }
  }

  /**
   * Private utility methods
   */
  private getDefaultICEServers(): RTCIceServer[] {
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];
  }

  private generateRoomId(): string {
    return "room-" + crypto.randomUUID();
  }

  private generateFileHash(_recordingId: string, _duration: number): string {
    // Simulated hash generation - in production, this would be SHA-256 of actual file
    // const _data = `${recordingId}-${duration}-${Date.now()}`;
    return crypto.randomUUID().replace(/-/g, "");
  }

  private async handleQualityIssues(
    roomId: string,
    metrics: SessionQualityMetrics,
  ): Promise<void> {
    try {
      const issues: string[] = [];

      if (metrics.packetLoss > 5) {
        issues.push(`High packet loss: ${metrics.packetLoss}%`);
      }

      if (metrics.latency > 300) {
        issues.push(`High latency: ${metrics.latency}ms`);
      }

      if (metrics.videoQuality <= 2) {
        issues.push(`Poor video quality: ${metrics.videoQuality}/5`);
      }

      if (issues.length > 0) {
        // Log technical issues
        const { error } = await this.supabase
          .from("webrtc_sessions")
          .update({
            connection_errors: [
              {
                timestamp: new Date().toISOString(),
                issues,
                metrics,
              },
            ],
          })
          .eq("room_id", roomId);

        if (error) {
          console.error("Failed to log quality issues:", error);
        }
      }
    } catch (_error) {
      console.error("Error handling quality issues:", error);
    }
  }

  private async logSessionEvent(
    telemedicineSessionId: string,
    event: any,
  ): Promise<void> {
    try {
      // Get current audit events
      const { data: session, error: getError } = await this.supabase
        .from("telemedicine_sessions")
        .select("audit_events")
        .eq("id", telemedicineSessionId)
        .single();

      if (getError) {
        console.error("Failed to get current audit events:", getError);
        return;
      }

      const auditEvents = session.audit_events || [];
      auditEvents.push(event);

      // Update with new event
      const { error: updateError } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          audit_events: auditEvents,
        })
        .eq("id", telemedicineSessionId);

      if (updateError) {
        console.error("Failed to log session event:", updateError);
      }
    } catch (_error) {
      console.error("Error logging session event:", error);
    }
  }

  /**
   * Gets detailed session information including participants and metrics
   */
  async getSessionDetails(sessionId: string): Promise<{
    session: any;
    participants: SessionParticipant[];
    metrics: SessionQualityMetrics | null;
    recording: SessionRecording | null;
  } | null> {
    try {
      // Get session data
      const { data: session, error: sessionError } = await this.supabase
        .from("webrtc_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return null;
      }

      // Get participants
      const { data: participants } = await this.supabase
        .from("session_participants")
        .select("*")
        .eq("session_id", sessionId);

      // Get metrics
      const { data: metrics } = await this.supabase
        .from("session_quality_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      // Get recording info
      const { data: recording } = await this.supabase
        .from("session_recordings")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      return {
        session,
        participants: participants || [],
        metrics: metrics || null,
        recording: recording || null,
      };
    } catch (_error) {
      console.error("Error getting session details:", error);
      return null;
    }
  }

  /**
   * Cancels an active WebRTC session
   */
  async cancelSession(sessionId: string, reason: string): Promise<void> {
    try {
      // Get the WebRTC session to find the telemedicine session ID
      const { data: webrtcSession, error: getError } = await this.supabase
        .from("webrtc_sessions")
        .select("telemedicine_session_id")
        .eq("id", sessionId)
        .single();

      if (getError || !webrtcSession) {
        throw new Error(
          `WebRTC session not found: ${getError?.message || "Session not found"}`,
        );
      }

      const { error } = await this.supabase
        .from("webrtc_sessions")
        .update({
          status: "cancelled",
          ended_at: new Date().toISOString(),
          metadata: { cancellation_reason: reason },
        })
        .eq("id", sessionId);

      if (error) {
        throw new Error(`Failed to cancel session: ${error.message}`);
      }

      // Log the cancellation event
      await this.logSessionEvent(webrtcSession.telemedicine_session_id, {
        type: "session_cancelled",
        reason,
        cancelled_at: new Date().toISOString(),
      });
    } catch (_error) {
      console.error("Error cancelling session:", error);
      throw error;
    }
  }

  /**
   * Gets quality metrics for a session
   */
  async getQualityMetrics(
    sessionId: string,
  ): Promise<SessionQualityMetrics | null> {
    try {
      const { data, error } = await this.supabase
        .from("session_quality_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        throw new Error(`Failed to get quality metrics: ${error.message}`);
      }

      return data || null;
    } catch (_error) {
      console.error("Error getting quality metrics:", error);
      return null;
    }
  }
}
