// System Integration Types
// Types for advanced patient search, quick access, and system integration features

export interface SystemIntegrationManager {
  searchPatients(
    query: string,
    filters: SearchFilters,
    userId: string,
    limit?: number,
  ): Promise<SearchResults>;

  getIntegratedPatientData(patientId: string, userId: string): Promise<IntegratedPatientData>;

  createPatientSegment(
    name: string,
    description: string,
    criteria: SegmentCriteria,
    userId: string,
  ): Promise<PatientSegment>;

  getQuickAccessPatients(
    type: QuickAccessType,
    userId: string,
    limit?: number,
  ): Promise<QuickAccessData>;
}

// Search Types
export interface SearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  gender?: "male" | "female" | "other";
  riskLevel?: "low" | "medium" | "high";
  treatmentType?: string;
  appointmentStatus?: string;
  hasPhotos?: boolean;
  consentStatus?: boolean;
  ageRange?: {
    min: number;
    max: number;
  };
  lastVisit?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
}

export interface SearchResults {
  patients: SearchPatient[];
  suggestions: string[];
  totalCount: number;
  searchTime: number;
  query: string;
  filters: SearchFilters;
}

export interface SearchPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  gender: "male" | "female" | "other";
  age: number;
  riskLevel: "low" | "medium" | "high";
  lastVisit: string;
  appointmentStatus: string;
  treatmentType: string;
  hasPhotos: boolean;
  consentStatus: boolean;
  tags: string[];
  photoUrl?: string;
  matchScore?: number;
  relevanceFactors?: string[];
}

// Quick Access Types
export type QuickAccessType =
  | "recent"
  | "favorites"
  | "high-risk"
  | "upcoming-appointments"
  | "pending-verification"
  | "frequent";

export interface QuickAccessData {
  patients: QuickAccessPatient[];
  totalCount: number;
  lastUpdated: string;
  listType: QuickAccessType;
}

export interface QuickAccessPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other";
  riskLevel: "low" | "medium" | "high";
  lastVisit: string;
  nextAppointment?: string;
  treatmentType: string;
  hasPhotos: boolean;
  photoUrl?: string;
  isFavorite: boolean;
  visitCount: number;
  verificationStatus: "pending" | "verified" | "failed";
  urgencyLevel?: "low" | "medium" | "high" | "critical";
  lastActivity?: string;
}

// Integrated Patient Data
export interface IntegratedPatientData {
  patient: SearchPatient;
  appointments: PatientAppointment[];
  treatments: PatientTreatment[];
  riskAssessment: RiskAssessment;
  communicationHistory: CommunicationRecord[];
  insights: PatientInsight[];
  timeline: TimelineEvent[];
}

export interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  provider: string;
  notes?: string;
  duration: number;
}

export interface PatientTreatment {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  provider: string;
  progress: number;
  notes?: string;
}

export interface RiskAssessment {
  overall: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  score: number;
  lastUpdated: string;
  recommendations: string[];
}

export interface RiskFactor {
  category: string;
  factor: string;
  severity: "low" | "medium" | "high";
  impact: number;
  description: string;
}

export interface CommunicationRecord {
  id: string;
  type: "email" | "sms" | "call" | "in-person" | "video";
  date: string;
  subject?: string;
  content: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "read" | "replied";
  provider: string;
}

export interface PatientInsight {
  id: string;
  type: "behavioral" | "clinical" | "engagement" | "risk" | "preference";
  title: string;
  description: string;
  confidence: number;
  source: string;
  generatedAt: string;
  actionable: boolean;
  recommendations?: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "appointment" | "treatment" | "communication" | "assessment" | "photo" | "consent";
  title: string;
  description: string;
  importance: "low" | "medium" | "high";
  category: string;
  metadata?: Record<string, any>;
}

// Patient Segments
export interface PatientSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  patientCount: number;
  createdAt: string;
  createdBy: string;
  lastUpdated: string;
  isActive: boolean;
  tags: string[];
}

export interface SegmentCriteria {
  patientIds?: string[];
  filters: SearchFilters;
  conditions: SegmentCondition[];
  logic: "AND" | "OR";
}

export interface SegmentCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between" | "in" | "not_in";
  value: any;
  weight?: number;
}

// System Statistics
export interface SystemStats {
  totalPatients: number;
  searchesPerformed: number;
  averageSearchTime: number;
  favoritePatients: number;
  highRiskPatients: number;
  pendingVerifications: number;
  upcomingAppointments: number;
  systemPerformance: SystemPerformance;
  searchAccuracy: number;
  userEngagement: UserEngagement;
}

export interface SystemPerformance {
  responseTime: number;
  uptime: number;
  accuracy: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface UserEngagement {
  dailyActiveUsers: number;
  searchesPerUser: number;
  averageSessionDuration: number;
  featureUsage: Record<string, number>;
  userSatisfaction: number;
}

// API Response Types
export interface SearchApiResponse {
  success: boolean;
  data?: SearchResults;
  error?: string;
}

export interface QuickAccessApiResponse {
  success: boolean;
  data?: QuickAccessData;
  error?: string;
}

export interface IntegratedDataApiResponse {
  success: boolean;
  data?: IntegratedPatientData;
  error?: string;
}

export interface SegmentApiResponse {
  success: boolean;
  data?: PatientSegment;
  error?: string;
}

export interface FavoriteApiResponse {
  success: boolean;
  data?: {
    action: "added" | "removed";
    patientId: string;
    patientName: string;
  };
  error?: string;
}

// Component Props
export interface AdvancedSearchProps {
  onPatientSelect?: (patient: SearchPatient) => void;
  onCreateSegment?: (patients: SearchPatient[]) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  maxResults?: number;
}

export interface QuickAccessProps {
  onPatientSelect?: (patient: QuickAccessPatient) => void;
  defaultTab?: QuickAccessType;
  showFavoriteToggle?: boolean;
}

export interface SystemIntegrationProps {
  onPatientSelect?: (patient: SearchPatient | QuickAccessPatient) => void;
  userRole?: "admin" | "manager" | "staff";
  showStats?: boolean;
  enableSegmentCreation?: boolean;
}

// Utility Types
export interface SearchSuggestion {
  text: string;
  type: "name" | "email" | "phone" | "treatment" | "tag";
  frequency: number;
  relevance: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: string;
  userId: string;
}

export interface UserPreferences {
  defaultSearchLimit: number;
  favoriteFilters: SearchFilters[];
  quickAccessTabs: QuickAccessType[];
  notificationSettings: {
    newHighRiskPatients: boolean;
    pendingVerifications: boolean;
    upcomingAppointments: boolean;
  };
}

// Error Types
export class SystemIntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "SystemIntegrationError";
  }
}

export class SearchError extends SystemIntegrationError {
  constructor(message: string, details?: any) {
    super(message, "SEARCH_ERROR", details);
    this.name = "SearchError";
  }
}

export class QuickAccessError extends SystemIntegrationError {
  constructor(message: string, details?: any) {
    super(message, "QUICK_ACCESS_ERROR", details);
    this.name = "QuickAccessError";
  }
}

export class SegmentError extends SystemIntegrationError {
  constructor(message: string, details?: any) {
    super(message, "SEGMENT_ERROR", details);
    this.name = "SegmentError";
  }
}

// Database Schema Types
export interface UserFavoritePatient {
  id: string;
  user_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export interface PatientSearchLog {
  id: string;
  user_id: string;
  query: string;
  filters: SearchFilters;
  result_count: number;
  search_time: number;
  timestamp: string;
}

export interface PatientSegmentMember {
  id: string;
  segment_id: string;
  patient_id: string;
  added_at: string;
  added_by: string;
}

// Configuration Types
export interface SystemIntegrationConfig {
  search: {
    maxResults: number;
    timeoutMs: number;
    enableSuggestions: boolean;
    cacheResults: boolean;
  };
  quickAccess: {
    defaultLimit: number;
    refreshInterval: number;
    enableRealtime: boolean;
  };
  segments: {
    maxSegments: number;
    maxPatientsPerSegment: number;
    enableAutoUpdate: boolean;
  };
  performance: {
    enableMetrics: boolean;
    logSearches: boolean;
    enableCaching: boolean;
  };
}
