import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogger } from "../../audit/audit-logger";
import type { LGPDManager } from "../../lgpd/lgpd-manager";
import type { SessionManager, SessionData } from "../auth/session-manager";

// Dashboard configuration
export interface DashboardConfig {
  refreshInterval: number; // in seconds
  maxRecentItems: number;
  enableRealTimeUpdates: boolean;
  cacheTimeout: number; // in minutes
  defaultLanguage: string;
  defaultTheme: "light" | "dark" | "auto";
}

// Patient dashboard data
export interface PatientDashboardData {
  patient: PatientInfo;
  upcomingAppointments: AppointmentSummary[];
  recentAppointments: AppointmentSummary[];
  treatmentProgress: TreatmentProgressSummary[];
  recentUploads: UploadSummary[];
  pendingTasks: TaskSummary[];
  notifications: NotificationSummary[];
  quickStats: DashboardStats;
  preferences: PatientPreferences;
}

// Patient information
export interface PatientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  profilePhoto?: string;
  memberSince: Date;
  lastLogin: Date;
  clinicName: string;
} // Appointment summary
export interface AppointmentSummary {
  id: string;
  date: Date;
  time: string;
  serviceType: string;
  staffName: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  location: string;
  canReschedule: boolean;
  canCancel: boolean;
  estimatedDuration: number;
}

// Treatment progress summary
export interface TreatmentProgressSummary {
  id: string;
  treatmentName: string;
  progressPercentage: number;
  currentSession: number;
  totalSessions: number;
  nextSessionDate?: Date;
  lastUpdate: Date;
  status: "active" | "completed" | "paused";
}

// Upload summary
export interface UploadSummary {
  id: string;
  filename: string;
  category: string;
  uploadDate: Date;
  isProcessed: boolean;
  isVerified: boolean;
  fileSize: number;
} // Task summary
export interface TaskSummary {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  type: "form" | "upload" | "payment" | "appointment" | "evaluation";
  completed: boolean;
}

// Notification summary
export interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalAppointments: number;
  completedTreatments: number;
  uploadedDocuments: number;
  pendingTasks: number;
  averageRating: number;
  membershipDays: number;
}

// Patient preferences
export interface PatientPreferences {
  language: string;
  timezone: string;
  theme: "light" | "dark" | "auto";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointmentReminders: boolean;
    treatmentUpdates: boolean;
    promotional: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    shareProgressPhotos: boolean;
    allowTestimonials: boolean;
    marketingConsent: boolean;
    dataSharing: boolean;
  };
} // Dashboard widget data
export interface DashboardWidget {
  id: string;
  type: "appointments" | "progress" | "uploads" | "notifications" | "stats" | "tasks";
  title: string;
  data: any;
  isVisible: boolean;
  order: number;
  size: "small" | "medium" | "large";
}

export class PortalDashboard {
  private supabase: SupabaseClient;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private sessionManager: SessionManager;
  private config: DashboardConfig;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    sessionManager: SessionManager,
    config?: Partial<DashboardConfig>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.config = {
      refreshInterval: 30, // 30 seconds
      maxRecentItems: 5,
      enableRealTimeUpdates: true,
      cacheTimeout: 5, // 5 minutes
      defaultLanguage: "pt-BR",
      defaultTheme: "light",
      ...config,
    };
  }

  /**
   * Get complete dashboard data for a patient
   */
  async getDashboardData(patientId: string, sessionToken: string): Promise<PatientDashboardData> {
    try {
      // Validate session
      const sessionValidation = await this.sessionManager.validateSession(sessionToken);
      if (!sessionValidation.isValid || sessionValidation.session?.patientId !== patientId) {
        throw new Error("Invalid session or unauthorized access");
      }

      // Check cache first
      const cacheKey = `dashboard_${patientId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch all dashboard data in parallel
      const [patient, appointments, progress, uploads, tasks, notifications, stats, preferences] =
        await Promise.all([
          this.getPatientInfo(patientId),
          this.getAppointments(patientId),
          this.getTreatmentProgress(patientId),
          this.getRecentUploads(patientId),
          this.getPendingTasks(patientId),
          this.getNotifications(patientId),
          this.getDashboardStats(patientId),
          this.getPatientPreferences(patientId),
        ]);

      const dashboardData: PatientDashboardData = {
        patient,
        upcomingAppointments: appointments.upcoming,
        recentAppointments: appointments.recent,
        treatmentProgress: progress,
        recentUploads: uploads,
        pendingTasks: tasks,
        notifications,
        quickStats: stats,
        preferences,
      };

      // Cache the data
      this.setCachedData(cacheKey, dashboardData);

      // Log dashboard access
      await this.auditLogger.log({
        action: "dashboard_accessed",
        userId: patientId,
        userType: "patient",
        details: {
          timestamp: new Date(),
          dataTypes: ["appointments", "progress", "uploads", "tasks", "notifications"],
        },
      });

      return dashboardData;
    } catch (error) {
      await this.auditLogger.log({
        action: "dashboard_access_failed",
        userId: patientId,
        userType: "patient",
        details: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Get patient basic information
   */
  private async getPatientInfo(patientId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("patients")
      .select(`
        id, name, email, phone, birth_date, gender,
        profile_photo_url, membership_start_date,
        emergency_contact_name, emergency_contact_phone
      `)
      .eq("id", patientId)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Get patient appointments (upcoming and recent)
   */
  private async getAppointments(patientId: string): Promise<{
    upcoming: AppointmentSummary[];
    recent: AppointmentSummary[];
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get upcoming appointments
    const { data: upcomingData, error: upcomingError } = await this.supabase
      .from("appointments")
      .select(`
        id, appointment_date, appointment_time, status,
        estimated_duration, location,
        services(name, category),
        staff(name, specialization)
      `)
      .eq("patient_id", patientId)
      .gte("appointment_date", now.toISOString().split("T")[0])
      .order("appointment_date", { ascending: true })
      .limit(this.config.maxRecentItems);

    if (upcomingError) throw upcomingError;
    // Get recent appointments
    const { data: recentData, error: recentError } = await this.supabase
      .from("appointments")
      .select(`
        id, appointment_date, appointment_time, status,
        estimated_duration, location,
        services(name, category),
        staff(name, specialization)
      `)
      .eq("patient_id", patientId)
      .lt("appointment_date", now.toISOString().split("T")[0])
      .gte("appointment_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("appointment_date", { ascending: false })
      .limit(this.config.maxRecentItems);

    if (recentError) throw recentError;

    // Transform data to AppointmentSummary format
    const upcoming = upcomingData?.map((apt) => this.transformAppointment(apt)) || [];
    const recent = recentData?.map((apt) => this.transformAppointment(apt)) || [];

    return { upcoming, recent };
  }

  /**
   * Transform appointment data to AppointmentSummary
   */
  private transformAppointment(apt: any): AppointmentSummary {
    const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      id: apt.id,
      date: new Date(apt.appointment_date),
      time: apt.appointment_time,
      serviceType: apt.services?.name || "Consulta",
      staffName: apt.staff?.name || "Profissional",
      status: apt.status,
      location: apt.location || "Clínica",
      canReschedule: hoursUntilAppointment > 24 && apt.status === "scheduled",
      canCancel: hoursUntilAppointment > 24 && apt.status === "scheduled",
      estimatedDuration: apt.estimated_duration || 60,
    };
  }

  /**
   * Get treatment progress for patient
   */
  private async getTreatmentProgress(patientId: string): Promise<TreatmentProgressSummary[]> {
    const { data, error } = await this.supabase
      .from("treatment_progress")
      .select(`
        id, treatment_name, progress_percentage,
        current_session, total_sessions, next_session_date,
        last_update, status
      `)
      .eq("patient_id", patientId)
      .eq("status", "active")
      .order("last_update", { ascending: false })
      .limit(this.config.maxRecentItems);
    if (error) throw error;

    return (
      data?.map((progress) => ({
        id: progress.id,
        treatmentName: progress.treatment_name,
        progressPercentage: progress.progress_percentage,
        currentSession: progress.current_session,
        totalSessions: progress.total_sessions,
        nextSessionDate: progress.next_session_date
          ? new Date(progress.next_session_date)
          : undefined,
        lastUpdate: new Date(progress.last_update),
        status: progress.status,
      })) || []
    );
  }

  /**
   * Get recent uploads for patient
   */
  private async getRecentUploads(patientId: string): Promise<UploadSummary[]> {
    const { data, error } = await this.supabase
      .from("patient_uploads")
      .select(`
        id, filename, category, upload_date,
        is_processed, is_verified, file_size
      `)
      .eq("patient_id", patientId)
      .order("upload_date", { ascending: false })
      .limit(this.config.maxRecentItems);

    if (error) throw error;

    return (
      data?.map((upload) => ({
        id: upload.id,
        filename: upload.filename,
        category: upload.category,
        uploadDate: new Date(upload.upload_date),
        isProcessed: upload.is_processed,
        isVerified: upload.is_verified,
        fileSize: upload.file_size,
      })) || []
    );
  }

  /**
   * Get pending tasks for patient
   */
  private async getPendingTasks(patientId: string): Promise<TaskSummary[]> {
    // This would typically come from a tasks table or be generated based on business logic
    // For now, we'll create some example tasks based on patient data
    const tasks: TaskSummary[] = [];

    // Check for incomplete evaluations
    const { data: evaluations } = await this.supabase
      .from("patient_evaluations")
      .select("id, evaluation_type, due_date")
      .eq("patient_id", patientId)
      .eq("completed", false);

    evaluations?.forEach((eval) => {
      tasks.push({
        id: `eval_${eval.id}`,
        title: `Avaliação: ${eval.evaluation_type}`,
        description: "Complete sua avaliação pendente",
        dueDate: eval.due_date ? new Date(eval.due_date) : undefined,
        priority: "medium",
        type: "evaluation",
        completed: false,
      });
    });

    return tasks;
  }

  /**
   * Get notifications for patient
   */
  private async getNotifications(patientId: string): Promise<NotificationSummary[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select(`
        id, title, message, type, is_read,
        created_at, action_url, action_text
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return (
      data?.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        actionUrl: notification.action_url,
        actionText: notification.action_text,
      })) || []
    );
  }

  /**
   * Get dashboard statistics for patient
   */
  private async getDashboardStats(patientId: string): Promise<DashboardStats> {
    // Get total appointments
    const { count: totalAppointments } = await this.supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId);

    // Get completed treatments
    const { count: completedTreatments } = await this.supabase
      .from("treatment_progress")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("status", "completed");

    // Get uploaded documents
    const { count: uploadedDocuments } = await this.supabase
      .from("patient_uploads")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId);

    // Get pending tasks count (simplified)
    const pendingTasks = await this.getPendingTasks(patientId);

    // Get average rating
    const { data: ratings } = await this.supabase
      .from("patient_evaluations")
      .select("rating")
      .eq("patient_id", patientId)
      .not("rating", "is", null);

    const averageRating =
      ratings?.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    // Get membership days
    const { data: patient } = await this.supabase
      .from("patients")
      .select("membership_start_date")
      .eq("id", patientId)
      .single();

    const membershipDays = patient?.membership_start_date
      ? Math.floor(
          (Date.now() - new Date(patient.membership_start_date).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    return {
      totalAppointments: totalAppointments || 0,
      completedTreatments: completedTreatments || 0,
      uploadedDocuments: uploadedDocuments || 0,
      pendingTasks: pendingTasks.length,
      averageRating,
      membershipDays,
    };
  }

  /**
   * Get patient preferences
   */
  private async getPatientPreferences(patientId: string): Promise<PatientPreferences> {
    const { data, error } = await this.supabase
      .from("patient_portal_preferences")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Return default preferences if none found
    if (!data) {
      return {
        language: this.config.defaultLanguage,
        timezone: "America/Sao_Paulo",
        theme: this.config.defaultTheme,
        notifications: {
          email: true,
          sms: true,
          push: true,
          appointmentReminders: true,
          treatmentUpdates: true,
          promotional: false,
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          reducedMotion: false,
        },
        privacy: {
          shareProgressPhotos: false,
          allowTestimonials: false,
          marketingConsent: false,
          dataSharing: false,
        },
      };
    }

    return data.preferences;
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = new Date();
    const cacheAge = (now.getTime() - cached.timestamp.getTime()) / (1000 * 60); // minutes

    if (cacheAge > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Clear cache for specific patient or all cache
   */
  public clearCache(patientId?: string): void {
    if (patientId) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) => key.includes(patientId));
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// Required imports
import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogger } from "../../audit/audit-logger";
import type { LGPDManager } from "../../lgpd/lgpd-manager";
import type { SessionManager } from "../auth/session-manager";
