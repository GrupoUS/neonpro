import {
  type Appointment,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
  type AppointmentCalendarView
} from '../entities/appointment.js';

/**
 * Appointment Repository Interface
 * Abstract interface for appointment data access
 */
export interface AppointmentRepository {
  /**
   * Find an appointment by ID
   * @param id Appointment ID
   * @returns Appointment or null if not found
   */
  findById(id: string): Promise<Appointment | null>;

  /**
   * Find appointments by patient ID
   * @param patientId Patient ID
   * @param includePast Include past appointments
   * @returns Array of appointments
   */
  findByPatientId(patientId: string, includePast?: boolean): Promise<Appointment[]>;

  /**
   * Find appointments by professional ID
   * @param professionalId Professional ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of appointments
   */
  findByProfessionalId(
    professionalId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Appointment[]>;

  /**
   * Find appointments by clinic ID
   * @param clinicId Clinic ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of appointments
   */
  findByClinicId(
    clinicId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Appointment[]>;

  /**
   * Find appointments by room ID
   * @param roomId Room ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of appointments
   */
  findByRoomId(
    roomId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Appointment[]>;

  /**
   * Find appointments by status
   * @param status Appointment status
   * @param clinicId Optional clinic ID
   * @returns Array of appointments
   */
  findByStatus(status: AppointmentStatus, clinicId?: string): Promise<Appointment[]>;

  /**
   * Find appointments by date range
   * @param startDate Start date
   * @param endDate End date
   * @param clinicId Optional clinic ID
   * @returns Array of appointments
   */
  findByDateRange(
    startDate: string,
    endDate: string,
    clinicId?: string
  ): Promise<Appointment[]>;

  /**
   * Find appointments for calendar view
   * @param startDate Start date
   * @param endDate End date
   * @param clinicId Optional clinic ID
   * @param professionalId Optional professional ID
   * @returns Array of appointments in calendar format
   */
  findForCalendar(
    startDate: string,
    endDate: string,
    clinicId?: string,
    professionalId?: string
  ): Promise<AppointmentCalendarView[]>;

  /**
   * Check for time conflicts
   * @param professionalId Professional ID
   * @param startTime Start time
   * @param endTime End time
   * @param excludeAppointmentId Optional appointment ID to exclude from conflict check
   * @returns True if there is a conflict
   */
  hasTimeConflict(
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean>;

  /**
   * Create a new appointment
   * @param appointment Appointment data
   * @returns Created appointment
   */
  create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;

  /**
   * Update an existing appointment
   * @param id Appointment ID
   * @param updates Partial appointment data to update
   * @returns Updated appointment
   */
  update(id: string, updates: Partial<Appointment>): Promise<Appointment>;

  /**
   * Cancel an appointment
   * @param id Appointment ID
   * @param cancelledBy User who cancelled the appointment
   * @param reason Cancellation reason
   * @param notes Optional cancellation notes
   * @returns Updated appointment
   */
  cancel(
    id: string,
    cancelledBy: string,
    reason: string,
    notes?: string
  ): Promise<Appointment>;

  /**
   * Reschedule an appointment
   * @param id Appointment ID
   * @param newStartTime New start time
   * @param newEndTime New end time
   * @param rescheduledBy User who rescheduled the appointment
   * @returns Updated appointment
   */
  reschedule(
    id: string,
    newStartTime: string,
    newEndTime: string,
    rescheduledBy: string
  ): Promise<Appointment>;

  /**
   * Delete an appointment
   * @param id Appointment ID
   * @returns Success status
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count appointments by clinic
   * @param clinicId Clinic ID
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Appointment count
   */
  countByClinic(clinicId: string, startDate?: string, endDate?: string): Promise<number>;

  /**
   * Get appointment statistics
   * @param clinicId Clinic ID
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Appointment statistics
   */
  getStatistics(clinicId: string, startDate?: string, endDate?: string): Promise<AppointmentStatistics>;
}

/**
 * Appointment Query Repository Interface
 * For complex queries and reporting
 */
export interface AppointmentQueryRepository {
  /**
   * Find appointments with filters
   * @param filters Filter criteria
   * @returns Array of matching appointments
   */
  findWithFilters(filters: AppointmentFilters): Promise<Appointment[]>;

  /**
   * Count appointments with filters
   * @param filters Filter criteria
   * @returns Appointment count
   */
  countWithFilters(filters: AppointmentFilters): Promise<number>;

  /**
   * Get appointment timeline
   * @param patientId Patient ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Timeline data
   */
  getTimeline(patientId: string, startDate: string, endDate: string): Promise<AppointmentTimeline[]>;

  /**
   * Get daily appointment counts
   * @param clinicId Clinic ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Daily appointment counts
   */
  getDailyCounts(clinicId: string, startDate: string, endDate: string): Promise<DailyAppointmentCount[]>;
}

/**
 * Appointment filters interface
 */
export interface AppointmentFilters {
  clinicId?: string;
  patientId?: string;
  professionalId?: string;
  roomId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  priority?: AppointmentPriority;
  startDate?: string;
  endDate?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: keyof Appointment;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Appointment statistics interface
 */
export interface AppointmentStatistics {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byType: Record<AppointmentType, number>;
  byPriority: Record<AppointmentPriority, number>;
  noShowRate: number;
  cancellationRate: number;
  averageDuration: number;
  revenue: number;
}

/**
 * Appointment timeline entry
 */
export interface AppointmentTimeline {
  date: string;
  appointments: Appointment[];
  total: number;
}

/**
 * Daily appointment count
 */
export interface DailyAppointmentCount {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}