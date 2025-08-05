// ===============================================
// Patient Portal Types - NeonPro Healthcare
// Story 4.3: Patient Portal & Self-Service
// ===============================================

export interface PatientPortalSession {
  id: string
  patient_id: string
  clinic_id: string
  session_token: string
  expires_at: string
  last_activity: string
  ip_address: string
  user_agent: string
  is_active: boolean
  metadata: {
    login_method: 'email' | 'phone' | 'document'
    device_type: 'mobile' | 'desktop' | 'tablet'
    browser: string
    location?: string
  }
  created_at: string
  updated_at: string
}

export interface PatientPortalAuth {
  patient: {
    id: string
    full_name: string
    email: string
    phone: string
    document_number: string
    birth_date: string
    avatar_url?: string
  }
  clinic: {
    id: string
    clinic_name: string
    logo_url?: string
    theme_colors?: {
      primary: string
      secondary: string
      accent: string
    }
  }
  session: PatientPortalSession
  permissions: {
    can_book_appointments: boolean
    can_view_history: boolean
    can_upload_files: boolean
    can_view_progress: boolean
    can_submit_evaluations: boolean
  }
}

export interface OnlineBooking {
  id: string
  patient_id: string
  clinic_id: string
  professional_id?: string
  service_type: string
  preferred_date: string
  preferred_time_start: string
  preferred_time_end: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'
  booking_notes?: string
  cancellation_reason?: string
  confirmation_date?: string
  confirmation_by?: string
  appointment_id?: string
  priority_score: number
  metadata: {
    device_used: string
    booking_source: 'portal' | 'app' | 'whatsapp'
    urgency_level: 'low' | 'medium' | 'high'
    payment_preference?: 'cash' | 'card' | 'pix' | 'plan'
  }
  created_at: string
  updated_at: string
}

export interface PatientUpload {
  id: string
  patient_id: string
  clinic_id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  upload_category: 'exam' | 'photo' | 'document' | 'prescription' | 'other'
  visibility: 'private' | 'professional' | 'clinic'
  description?: string
  tags: string[]
  is_processed: boolean
  metadata: {
    upload_source: 'portal' | 'app' | 'email'
    processing_status: 'pending' | 'completed' | 'failed'
    mime_type: string
    dimensions?: { width: number; height: number }
  }
  created_at: string
  updated_at: string
}

export interface PatientEvaluation {
  id: string
  patient_id: string
  clinic_id: string
  evaluation_type: string
  questions: Array<{
    id: string
    question: string
    type: 'text' | 'number' | 'boolean' | 'scale' | 'multiple_choice'
    options?: string[]
    required: boolean
  }>
  responses: Array<{
    question_id: string
    answer: string | number | boolean
    confidence_level?: number
  }>
  overall_score?: number
  status: 'draft' | 'submitted' | 'reviewed' | 'archived'
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  metadata: {
    completion_time_minutes: number
    device_used: string
    satisfaction_rating?: number
  }
  created_at: string
  updated_at: string
}

export interface TreatmentProgress {
  id: string
  patient_id: string
  clinic_id: string
  treatment_name: string
  progress_type: 'photo' | 'measurement' | 'questionnaire' | 'milestone'
  progress_data: {
    photos?: Array<{
      url: string
      caption: string
      taken_at: string
      comparison_photos?: string[]
    }>
    measurements?: Array<{
      metric: string
      value: number
      unit: string
      measured_at: string
    }>
    milestones?: Array<{
      title: string
      description: string
      completed: boolean
      completed_at?: string
    }>
  }
  progress_percentage: number
  notes?: string
  professional_notes?: string
  is_visible_to_patient: boolean
  metadata: {
    auto_generated: boolean
    source: 'patient' | 'professional' | 'system'
    analysis_type?: 'manual' | 'ai_assisted'
  }
  created_at: string
  updated_at: string
}

export interface BookingWaitlist {
  id: string
  patient_id: string
  clinic_id: string
  professional_id?: string
  service_type: string
  preferred_dates: string[]
  preferred_times: Array<{
    start: string
    end: string
  }>
  priority_score: number
  status: 'active' | 'notified' | 'booked' | 'expired' | 'cancelled'
  notification_preferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    push: boolean
  }
  max_wait_days: number
  metadata: {
    urgency_reason?: string
    flexibility_level: 'low' | 'medium' | 'high'
    payment_ready: boolean
  }
  notified_at?: string
  booked_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}

// Portal Navigation & UI Types
export interface PortalMenuItem {
  id: string
  title: string
  icon: string
  path: string
  permissions: string[]
  badge_count?: number
  is_active: boolean
  children?: PortalMenuItem[]
}

export interface PortalNotification {
  id: string
  patient_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'appointment' | 'treatment' | 'system' | 'marketing'
  is_read: boolean
  action_url?: string
  action_label?: string
  expires_at?: string
  created_at: string
}

export interface PortalTheme {
  clinic_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url?: string
  favicon_url?: string
  custom_css?: string
  font_family: string
  layout_style: 'modern' | 'classic' | 'minimal'
}

// Form Types for Portal
export interface PatientLoginForm {
  login_type: 'email' | 'phone' | 'document'
  email?: string
  phone?: string
  document_number?: string
  clinic_code: string
  remember_me: boolean
}

export interface BookingForm {
  service_type: string
  professional_id?: string
  preferred_date: string
  preferred_time: string
  notes?: string
  urgency_level: 'low' | 'medium' | 'high'
  payment_preference: 'cash' | 'card' | 'pix' | 'plan'
}

export interface EvaluationForm {
  evaluation_type: string
  responses: Record<string, string | number | boolean>
  additional_notes?: string
}

// PWA & Offline Types
export interface OfflineAction {
  id: string
  type: 'booking' | 'upload' | 'evaluation' | 'update'
  data: any
  timestamp: string
  retry_count: number
  status: 'pending' | 'syncing' | 'completed' | 'failed'
}

export interface PWAConfig {
  name: string
  short_name: string
  description: string
  theme_color: string
  background_color: string
  display: 'standalone' | 'minimal-ui' | 'browser'
  orientation: 'portrait' | 'landscape' | 'any'
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: string
  }>
  start_url: string
  scope: string
}

// API Response Types
export interface PortalApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
    request_id: string
    timestamp: string
  }
}

export interface PortalDashboardStats {
  upcoming_appointments: number
  pending_evaluations: number
  treatment_progress_percentage: number
  unread_notifications: number
  recent_uploads: number
  waitlist_position?: number
}
