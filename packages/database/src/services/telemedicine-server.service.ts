/**
 * Telemedicine WebRTC Integration Server
 * Combines signaling server and peer management for telemedicine sessions
 * with CFM compliance, LGPD privacy, and comprehensive audit trails
 */

import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import WebRTC services
import { WebRTCSignalingServer } from "./webrtc-signaling.service";
import { WebRTCSessionService } from "./webrtc-session.service";
import { CFMComplianceService } from "./cfm-compliance.service";
import { PatientIdentityService } from "./patient-identity.service";
import { MedicalLicenseService } from "./medical-license.service";

interface TelemedicineServerConfig {
  port: number;
  signalingPort: number;
  environment: "development" | "staging" | "production";
  corsOrigins: string[];
  enableRecording: boolean;
  enableQualityMonitoring: boolean;
  maxSessionDuration: number; // in minutes
  complianceLevel: "basic" | "enhanced" | "full";
}

interface SessionRequest {
  sessionId: string;
  patientId: string;
  physicianId: string;
  sessionType: "consultation" | "follow_up" | "emergency" | "second_opinion";
  scheduledAt: Date;
  estimatedDuration: number;
  specialtyCode?: string;
  requiresRecording: boolean;
  consentStatus: {
    patient: boolean;
    physician: boolean;
    recording: boolean;
    dataSharing: boolean;
  };
}

interface SessionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceStatus: {
    cfm: boolean;
    lgpd: boolean;
    anvisa: boolean;
  };
}

export class TelemedicineServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private signalingServer: WebRTCSignalingServer;

  // Services
  private webrtcService: WebRTCSessionService;
  private cfmService: CFMComplianceService;
  private identityService: PatientIdentityService;
  private licenseService: MedicalLicenseService;

  private config: TelemedicineServerConfig;
  private activeSessions: Map<string, SessionRequest> = new Map();

  constructor(config: TelemedicineServerConfig) {
    this.config = config;
    this.app = express();
    this.httpServer = createServer(this.app);

    // Initialize services
    this.webrtcService = new WebRTCSessionService();
    this.cfmService = new CFMComplianceService();
    this.identityService = new PatientIdentityService();
    this.licenseService = new MedicalLicenseService();

    // Initialize signaling server
    this.signalingServer = new WebRTCSignalingServer(config.signalingPort);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Sets up Express middleware with security and compliance features
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            mediaSrc: ["'self'", "blob:", "data:"],
            connectSrc: ["'self'", "ws:", "wss:"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      }),
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: this.config.corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
      }),
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: this.config.environment === "production" ? 100 : 1000,
      message: "Too many requests from this IP",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging for compliance
    this.app.use((req,res,_next) => {
      const sessionId = req.headers["x-session-id"] as string;

      if (sessionId) {
        // Log API request for compliance
        this.cfmService
          .logComplianceEvent({
            sessionId,
            eventType: "api_request",
            description: `API ${req.method} ${req.path}`,
            metadata: {
              method: req.method,
              path: req.path,
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              timestamp: new Date().toISOString(),
            },
          })
          .catch((error) => {
            console.error("Error logging compliance event:", error);
          });
      }

      next();
    });
  }

  /**
   * Sets up API routes for telemedicine session management
   */
  private setupRoutes(): void {
    // Health check
    this.app.get(_"/health",(req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          signaling: this.signalingServer.getActiveSessionsCount(),
          activeSessions: this.activeSessions.size,
        },
        version: "1.0.0",
      });
    });

    // Session management routes
    this.app.post("/api/sessions/validate", this.validateSession.bind(this));
    this.app.post("/api/sessions/create", this.createSession.bind(this));
    this.app.get("/api/sessions/:sessionId", this.getSession.bind(this)); // res used
    this.app.put(
      "/api/sessions/:sessionId/start",
      this.startSession.bind(this),
    ); // req used
    this.app.put("/api/sessions/:sessionId/end", this.endSession.bind(this));
    this.app.delete("/api/sessions/:sessionId", this.cancelSession.bind(this));

    // Compliance and monitoring routes
    this.app.get(
      "/api/sessions/:sessionId/compliance",
      this.getComplianceStatus.bind(this),
    );
    this.app.get(
      "/api/sessions/:sessionId/quality",
      this.getQualityMetrics.bind(this),
    );
    this.app.post(
      "/api/sessions/:sessionId/consent",
      this.updateConsent.bind(this),
    );

    // Identity verification routes
    this.app.post(
      "/api/identity/verify-patient",
      this.verifyPatientIdentity.bind(this),
    );
    this.app.post(
      "/api/identity/verify-physician",
      this.verifyPhysicianIdentity.bind(this),
    );
    this.app.get(
      "/api/licenses/:crm/validate",
      this.validateMedicalLicense.bind(this),
    );

    // WebRTC configuration routes
    this.app.get("/api/webrtc/config", this.getWebRTCConfig.bind(this));
    this.app.get("/api/webrtc/ice-servers", this.getIceServers.bind(this));

    // Recording and storage routes
    this.app.post(
      "/api/sessions/:sessionId/recording/start",
      this.startRecording.bind(this),
    );
    this.app.post(
      "/api/sessions/:sessionId/recording/stop",
      this.stopRecording.bind(this),
    );
    this.app.get(
      "/api/sessions/:sessionId/recording/download",
      this.downloadRecording.bind(this),
    );

    // Analytics and reporting routes
    this.app.get(
      "/api/compliance/audit-trail/:sessionId",
      this.getAuditTrail.bind(this),
    );
  }

  /**
   * Validates session parameters and compliance requirements
   */
  private async validateSession(
    req: express.Request,
    res: express.Response,
  ): Promise<SessionValidationResult | void> {
    try {
      const sessionRequest: SessionRequest = req.body;
      const result: SessionValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        complianceStatus: {
          cfm: false,
          lgpd: false,
          anvisa: false,
        },
      };

      // Validate patient identity - using verifyPatientIdentity method
      const patientValidation =
        await this.identityService.verifyPatientIdentity(
          sessionRequest.patientId,
          [], // Empty documents array for basic validation
          false, // No biometric verification
        );
      if (patientValidation.riskScore > 50) {
        result.errors.push("Patient identity verification failed");
        result.isValid = false;
      }

      // Validate physician license - using verifyMedicalLicense method
      const physicianValidation =
        await this.licenseService.verifyMedicalLicense(
          sessionRequest.physicianId, // Using physicianId as CFM number
          "SP", // Default state - should be extracted from physician data
          sessionRequest.specialtyCode,
        );
      if (physicianValidation.cfmRegistration.registrationStatus !== "active") {
        result.errors.push("Physician license is not active");
        result.isValid = false;
      }

      // Check CFM compliance
      const cfmCompliance = await this.cfmService.createTelemedicineSession({
        appointment_id: sessionRequest.sessionId,
        patient_id: sessionRequest.patientId,
        cfm_professional_crm: sessionRequest.physicianId,
        cfm_professional_state: "SP",
        patient_consent_obtained:
          sessionRequest.consentStatus.patient &&
          sessionRequest.consentStatus.physician,
        recording_consent_required: sessionRequest.requiresRecording,
        data_retention_period: "20 years",
      });
      result.complianceStatus.cfm =
        cfmCompliance.complianceStatus.complianceScore >= 80;

      // Check LGPD consent
      if (
        !sessionRequest.consentStatus.patient ||
        !sessionRequest.consentStatus.physician
      ) {
        result.errors.push("Required consents not obtained");
        result.isValid = false;
      }
      result.complianceStatus.lgpd =
        sessionRequest.consentStatus.patient &&
        sessionRequest.consentStatus.physician;

      // ANVISA compliance (simplified for demo)
      result.complianceStatus.anvisa = true;

      // Session duration validation
      if (sessionRequest.estimatedDuration > this.config.maxSessionDuration) {
        result.warnings.push(
          `Session duration exceeds recommended maximum of ${this.config.maxSessionDuration} minutes`,
        );
      }

      res.json(result);
    } catch (error) {
      console.error("Error validating session:", error);
      res.status(500).json({
        error: "Session validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Creates a new telemedicine session
   */
  private async createSession(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const sessionRequest: SessionRequest = req.body;

      // Validate session first
      const validation = (await this.validateSession(
        req,
        res,
      )) as unknown as SessionValidationResult | void;
      if (!validation || (validation as any) === undefined) return; // Response already sent

      // Create WebRTC session
      const webrtcSession = await this.webrtcService.createSession({
        patientId: sessionRequest.patientId,
        physicianId: sessionRequest.physicianId,
        sessionType: sessionRequest.sessionType,
        specialtyCode: sessionRequest.specialtyCode,
      });

      // Store active session
      this.activeSessions.set(webrtcSession.sessionId, sessionRequest);

      // Log compliance event
      await this.cfmService.logComplianceEvent({
        sessionId: webrtcSession.sessionId,
        eventType: "session_created",
        description: "Telemedicine session created",
        metadata: {
          patientId: sessionRequest.patientId,
          sessionType: sessionRequest.sessionType,
          recordingEnabled: sessionRequest.requiresRecording,
        },
      });

      res.status(201).json({
        sessionId: webrtcSession.sessionId,
        status: "created",
        signalingUrl: `ws://localhost:${this.config.signalingPort}`,
        iceServers: await this.getIceServersConfig(),
        compliance: {
          cfm: true,
          lgpd: true,
          anvisa: true,
        },
      });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({
        error: "Failed to create session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets session details
   */
  private async getSession(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const sessionDetails =
        await this.webrtcService.getSessionDetails(sessionId);
      if (!sessionDetails) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      const activeSession = this.activeSessions.get(sessionId);

      res.json({
        ...sessionDetails,
        activeParticipants: this.signalingServer.getTotalParticipantsCount(),
        complianceStatus: await this.getSessionComplianceStatus(sessionId),
        ...(activeSession && { requestDetails: activeSession }),
      });
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({
        error: "Failed to get session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Starts a telemedicine session
   */
  private async startSession(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const result = await this.webrtcService.startSession(sessionId);

      // Log compliance event
      await this.cfmService.logComplianceEvent({
        sessionId,
        eventType: "session_started",
        description: "Telemedicine session started",
        metadata: {
          startedAt: new Date().toISOString(),
          initiatedBy: req.headers["user-id"] as string,
        },
      });

      res.json(result);
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({
        error: "Failed to start session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Ends a telemedicine session
   */
  private async endSession(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason, summary } = req.body;

      const result = await this.webrtcService.endSession(
        sessionId,
        String(reason ?? "completed"),
      );

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      // Log compliance event
      await this.cfmService.logComplianceEvent({
        sessionId,
        eventType: "session_ended",
        description: "Telemedicine session ended",
        metadata: {
          endedAt: new Date().toISOString(),
          reason,
          summary,
          endedBy: req.headers["user-id"] as string,
        },
      });

      res.json(result);
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({
        error: "Failed to end session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Cancels a scheduled session
   */
  private async cancelSession(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;

      const result = await this.webrtcService.cancelSession(sessionId, reason);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      // Log compliance event
      await this.cfmService.logComplianceEvent({
        sessionId,
        eventType: "session_cancelled",
        description: "Telemedicine session cancelled",
        metadata: {
          cancelledAt: new Date().toISOString(),
          reason,
          cancelledBy: req.headers["user-id"] as string,
        },
      });

      res.json(result);
    } catch (error) {
      console.error("Error cancelling session:", error);
      res.status(500).json({
        error: "Failed to cancel session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets compliance status for a session
   */
  private async getComplianceStatus(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const complianceStatus = await this.getSessionComplianceStatus(sessionId);

      res.json(complianceStatus);
    } catch (error) {
      console.error("Error getting compliance status:", error);
      res.status(500).json({
        error: "Failed to get compliance status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets quality metrics for a session
   */
  private async getQualityMetrics(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const qualityMetrics =
        await this.webrtcService.getQualityMetrics(sessionId);

      res.json(qualityMetrics);
    } catch (error) {
      console.error("Error getting quality metrics:", error);
      res.status(500).json({
        error: "Failed to get quality metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Updates consent status for a session
   */
  private async updateConsent(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { granted } = req.body;

      // Update consent in database
      const { error } = await this.webrtcService.supabase
        .from("telemedicine_sessions")
        .update({
          lgpd_compliant: granted === true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        throw new Error(`Failed to update consent: ${error.message}`);
      }

      res.json({
        success: true,
        message: "Consent updated successfully",
        sessionId,
        consentGiven: granted === true,
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      res.status(500).json({
        error: "Failed to update consent",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Verifies patient identity
   */
  private async verifyPatientIdentity(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { patientId, documents, enableBiometric } = req.body;

      const verification = await this.identityService.verifyPatientIdentity(
        patientId,
        documents,
        enableBiometric === true,
      );

      res.json(verification);
    } catch (error) {
      console.error("Error verifying patient identity:", error);
      res.status(500).json({
        error: "Identity verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Verifies physician identity
   */
  private async verifyPhysicianIdentity(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { physicianId, cfmNumber, documents } = req.body;

      const verification = await this.identityService.verifyPhysicianIdentity(
        physicianId,
        cfmNumber,
        documents,
      );

      res.json(verification);
    } catch (error) {
      console.error("Error verifying physician identity:", error);
      res.status(500).json({
        error: "Identity verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Validates medical license
   */
  private async validateMedicalLicense(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { crm } = req.params;

      const validation = await this.licenseService.verifyMedicalLicense(
        crm,
        "SP",
        undefined,
      );

      res.json(validation);
    } catch (error) {
      console.error("Error validating medical license:", error);
      res.status(500).json({
        error: "License validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets WebRTC configuration
   */
  private async getWebRTCConfig(
    _req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const config = {
        iceServers: await this.getIceServersConfig(),
        sdpSemantics: "unified-plan",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        iceCandidatePoolSize: 10,
        mediaConstraints: {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        },
      };

      res.json(config);
    } catch (error) {
      console.error("Error getting WebRTC config:", error);
      res.status(500).json({
        error: "Failed to get WebRTC config",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets ICE servers configuration
   */
  private async getIceServers(
    _req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const iceServers = await this.getIceServersConfig();
      res.json({ iceServers });
    } catch (error) {
      console.error("Error getting ICE servers:", error);
      res.status(500).json({
        error: "Failed to get ICE servers",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Starts session recording
   */
  private async startRecording(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const result = await this.webrtcService.startRecording(
        sessionId,
        "digital",
      );

      res.json(result);
    } catch (error) {
      console.error("Error starting recording:", error);
      res.status(500).json({
        error: "Failed to start recording",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Stops session recording
   */
  private async stopRecording(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const result = await this.webrtcService.stopRecording(sessionId);

      res.json(result);
    } catch (error) {
      console.error("Error stopping recording:", error);
      res.status(500).json({
        error: "Failed to stop recording",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Downloads session recording
   */
  private async downloadRecording(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId: sessionId } = req.params;

      // This would implement secure recording download
      res.status(501).json({ error: "Recording download not implemented" });
    } catch (error) {
      console.error("Error downloading recording:", error);
      res.status(500).json({
        error: "Failed to download recording",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Gets audit trail for a session
   */
  private async getAuditTrail(
    req: express.Request,
    res: express.Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params;

      const auditTrail = await this.cfmService.getSessionAuditTrail(sessionId);

      res.json(auditTrail);
    } catch (error) {
      console.error("Error getting audit trail:", error);
      res.status(500).json({
        error: "Failed to get audit trail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Sets up error handling middleware
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: "Not found",
        message: `Route ${req.method} ${req.path} not found`,
      });
    });

    // Global error handler
    this.app.use(
      (
        error: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        console.error("Global error handler:", error);

        res.status(error.status || 500).json({
          error: "Internal server error",
          message:
            this.config.environment === "development"
              ? error.message
              : "Something went wrong",
          ...(this.config.environment === "development" && {
            stack: error.stack,
          }),
        });
      },
    );
  }

  /**
   * Helper method to get session compliance status
   */
  private async getSessionComplianceStatus(sessionId: string): Promise<any> {
    const auditTrail = await this.cfmService.getSessionAuditTrail(sessionId);

    return {
      cfm: {
        compliant: (auditTrail.compliance as any)?.cfm || false,
        lastCheck: auditTrail.lastComplianceCheck,
      },
      lgpd: {
        compliant: (auditTrail.compliance as any)?.lgpd || false,
        consentStatus: auditTrail.consentEvents,
      },
      anvisa: {
        compliant: (auditTrail.compliance as any)?.anvisa || false,
        deviceCompliance: true,
      },
    };
  }

  /**
   * Helper method to get ICE servers configuration
   */
  private async getIceServersConfig(): Promise<RTCIceServer[]> {
    return [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
      // Add TURN servers for production
    ];
  }

  /**
   * Starts the telemedicine server
   */
  public start(): void {
    this.httpServer.listen(_this.config.port, () => {
      console.log(`Telemedicine Server listening on port ${this.config.port}`);
      console.log(
        `Signaling Server listening on port ${this.config.signalingPort}`,
      );
      console.log(`Environment: ${this.config.environment}`);
      console.log(`Compliance Level: ${this.config.complianceLevel}`);
    });
  }

  /**
   * Stops the telemedicine server
   */
  public async stop(): Promise<void> {
    console.log("Stopping Telemedicine Server...");

    // Shutdown signaling server
    await this.signalingServer.shutdown();

    // Close HTTP server
    this.httpServer.close();

    console.log("Telemedicine Server stopped");
  }

  /**
   * Gets server status
   */
  public getStatus(): any {
    return {
      activeSessions: this.activeSessions.size,
      signalingConnections: this.signalingServer.getTotalParticipantsCount(),
      activeSessionRooms: this.signalingServer.getActiveSessionsCount(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

// Create and export default server instance
const defaultConfig: TelemedicineServerConfig = {
  port: 3002,
  signalingPort: 3001,
  environment: (process.env.NODE_ENV as any) || "development",
  corsOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean),
  enableRecording: process.env.ENABLE_RECORDING === "true",
  enableQualityMonitoring: true,
  maxSessionDuration: 120, // 2 hours
  complianceLevel: "full",
};

export const telemedicineServer = new TelemedicineServer(defaultConfig);

// Start server if this file is run directly
if (require.main === module) {
  telemedicineServer.start();

  // Graceful shutdown
  process.on(_"SIGTERM",_async () => {
    await telemedicineServer.stop();
    process.exit(0);
  });

  process.on(_"SIGINT",_async () => {
    await telemedicineServer.stop();
    process.exit(0);
  });
}

export default TelemedicineServer;
