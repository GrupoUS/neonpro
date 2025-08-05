import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogger } from "../audit/audit-logger";
import type { LGPDManager } from "../lgpd/lgpd-manager";
import type { NotificationService } from "../notifications/notification-service";
import type { EncryptionService } from "../security/encryption-service";
import type { AppointmentConfig, AppointmentManager } from "./appointments/appointment-manager";
// Import patient portal components
import type { SessionConfig, SessionManager } from "./auth/session-manager";
import type {
  CommunicationConfig,
  CommunicationManager,
} from "./communication/communication-manager";
import type { DashboardConfig, PortalDashboard } from "./dashboard/portal-dashboard";
import type { UploadConfig, UploadManager } from "./uploads/upload-manager";

/**
 * Main patient portal configuration
 */
export interface PatientPortalConfig {
  session: SessionConfig;
  dashboard: DashboardConfig;
  appointments: AppointmentConfig;
  uploads: UploadConfig;
  communication: CommunicationConfig;
  features: {
    appointmentBooking: boolean;
    documentUpload: boolean;
    messaging: boolean;
    treatmentTracking: boolean;
    billingAccess: boolean;
    telehealth: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordComplexity: boolean;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    language: string;
    accessibility: boolean;
    mobileOptimized: boolean;
  };
}

/**
 * Patient portal initialization result
 */
export interface PortalInitResult {
  success: boolean;
  portalId: string;
  message: string;
  availableFeatures: string[];
  maintenanceMode?: boolean;
}

/**
 * Patient portal health check
 */
export interface PortalHealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  components: {
    database: "up" | "down";
    storage: "up" | "down";
    notifications: "up" | "down";
    encryption: "up" | "down";
  };
  responseTime: number;
  lastCheck: Date;
}

/**
 * Main Patient Portal class that orchestrates all portal functionality
 */
export class PatientPortal {
  private supabase: SupabaseClient;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private encryptionService: EncryptionService;
  private notificationService: NotificationService;
  private config: PatientPortalConfig;

  // Portal components
  public sessionManager: SessionManager;
  public dashboard: PortalDashboard;
  public appointments: AppointmentManager;
  public uploads: UploadManager;
  public communication: CommunicationManager;

  private isInitialized: boolean = false;
  private portalId: string;

  constructor(
    supabase: SupabaseClient,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    encryptionService: EncryptionService,
    notificationService: NotificationService,
    config: PatientPortalConfig,
  ) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.encryptionService = encryptionService;
    this.notificationService = notificationService;
    this.config = config;
    this.portalId = `portal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize components
    this.initializeComponents();
  }

  /**
   * Initialize all portal components
   */
  private initializeComponents(): void {
    // Initialize session manager
    this.sessionManager = new SessionManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.encryptionService,
      this.config.session,
    );

    // Initialize dashboard
    this.dashboard = new PortalDashboard(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.config.dashboard,
    );

    // Initialize appointment manager
    this.appointments = new AppointmentManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.config.appointments,
    );

    // Initialize upload manager
    this.uploads = new UploadManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.encryptionService,
      this.config.uploads,
    );

    // Initialize communication manager
    this.communication = new CommunicationManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.notificationService,
      this.config.communication,
    );
  }
  /**
   * Initialize the patient portal
   */
  async initialize(): Promise<PortalInitResult> {
    try {
      // Perform health check
      const healthCheck = await this.performHealthCheck();
      if (healthCheck.status === "unhealthy") {
        return {
          success: false,
          portalId: this.portalId,
          message: "Portal não pode ser inicializado devido a problemas de sistema.",
          availableFeatures: [],
          maintenanceMode: true,
        };
      }

      // Validate configuration
      const configValidation = this.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Configuração inválida: ${configValidation.message}`);
      }

      // Initialize database connections and verify tables
      await this.verifyDatabaseSchema();

      // Set up event listeners
      this.setupEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      // Log portal initialization
      await this.auditLogger.log({
        action: "portal_initialized",
        userId: "system",
        userType: "system",
        details: {
          portalId: this.portalId,
          features: this.getAvailableFeatures(),
          healthStatus: healthCheck.status,
        },
      });

      return {
        success: true,
        portalId: this.portalId,
        message: "Portal do paciente inicializado com sucesso!",
        availableFeatures: this.getAvailableFeatures(),
        maintenanceMode: false,
      };
    } catch (error) {
      await this.auditLogger.log({
        action: "portal_initialization_failed",
        userId: "system",
        userType: "system",
        details: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Perform system health check
   */
  async performHealthCheck(): Promise<PortalHealthCheck> {
    const startTime = Date.now();
    const healthCheck: PortalHealthCheck = {
      status: "healthy",
      components: {
        database: "up",
        storage: "up",
        notifications: "up",
        encryption: "up",
      },
      responseTime: 0,
      lastCheck: new Date(),
    };

    try {
      // Test database connection
      const { error: dbError } = await this.supabase.from("patients").select("id").limit(1);

      if (dbError) {
        healthCheck.components.database = "down";
        healthCheck.status = "unhealthy";
      }

      // Test storage
      const { error: storageError } = await this.supabase.storage
        .from("patient-files")
        .list("", { limit: 1 });

      if (storageError) {
        healthCheck.components.storage = "down";
        healthCheck.status = healthCheck.status === "healthy" ? "degraded" : "unhealthy";
      }

      // Test encryption service
      try {
        await this.encryptionService.encrypt("test");
      } catch {
        healthCheck.components.encryption = "down";
        healthCheck.status = healthCheck.status === "healthy" ? "degraded" : "unhealthy";
      }
    } catch (error) {
      healthCheck.status = "unhealthy";
    }

    healthCheck.responseTime = Date.now() - startTime;
    return healthCheck;
  }
  /**
   * Validate portal configuration
   */
  private validateConfiguration(): { isValid: boolean; message: string } {
    // Validate session configuration
    if (!this.config.session.secretKey || this.config.session.secretKey.length < 32) {
      return {
        isValid: false,
        message: "Chave secreta da sessão deve ter pelo menos 32 caracteres",
      };
    }

    // Validate security settings
    if (this.config.security.sessionTimeout < 300) {
      // 5 minutes minimum
      return {
        isValid: false,
        message: "Timeout de sessão deve ser pelo menos 5 minutos",
      };
    }

    // Validate upload settings
    if (this.config.uploads.maxFileSize <= 0) {
      return {
        isValid: false,
        message: "Tamanho máximo de arquivo deve ser maior que zero",
      };
    }

    return { isValid: true, message: "Configuração válida" };
  }

  /**
   * Verify database schema
   */
  private async verifyDatabaseSchema(): Promise<void> {
    const requiredTables = [
      "patients",
      "appointments",
      "services",
      "staff",
      "patient_uploads",
      "patient_files",
      "messages",
      "conversations",
      "patient_sessions",
    ];

    for (const table of requiredTables) {
      const { error } = await this.supabase.from(table).select("*").limit(1);

      if (error) {
        throw new Error(`Tabela requerida '${table}' não encontrada ou inacessível`);
      }
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Set up real-time subscriptions for patient data updates
    // This would include listening for appointment updates, new messages, etc.

    // Example: Listen for new messages
    this.supabase
      .channel("patient-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          this.handleNewMessage(payload.new);
        },
      )
      .subscribe();
  }

  /**
   * Handle new message events
   */
  private async handleNewMessage(message: any): Promise<void> {
    // Process new message notifications
    // This would trigger real-time updates in the UI
  }

  /**
   * Get available features based on configuration
   */
  private getAvailableFeatures(): string[] {
    const features: string[] = [];

    if (this.config.features.appointmentBooking) features.push("appointment_booking");
    if (this.config.features.documentUpload) features.push("document_upload");
    if (this.config.features.messaging) features.push("messaging");
    if (this.config.features.treatmentTracking) features.push("treatment_tracking");
    if (this.config.features.billingAccess) features.push("billing_access");
    if (this.config.features.telehealth) features.push("telehealth");

    return features;
  }

  /**
   * Shutdown the portal gracefully
   */
  async shutdown(): Promise<void> {
    try {
      // Close all active sessions
      await this.sessionManager.terminateAllSessions();

      // Unsubscribe from real-time channels
      await this.supabase.removeAllChannels();

      // Log shutdown
      await this.auditLogger.log({
        action: "portal_shutdown",
        userId: "system",
        userType: "system",
        details: { portalId: this.portalId },
      });

      this.isInitialized = false;
    } catch (error) {
      await this.auditLogger.log({
        action: "portal_shutdown_failed",
        userId: "system",
        userType: "system",
        details: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Check if portal is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get portal configuration
   */
  getConfiguration(): PatientPortalConfig {
    return { ...this.config };
  }

  /**
   * Get portal ID
   */
  getPortalId(): string {
    return this.portalId;
  }
}
