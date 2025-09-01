// Staff Alert Workflow System Types
// Real-time notifications and escalation workflows for high-risk appointments

export interface StaffAlert {
  id: string;
  appointmentId: string;
  patientId: string;
  riskScore: number;
  riskLevel: "high" | "critical";
  alertType: "no_show_risk" | "intervention_required" | "escalation" | "manual";
  priority: "normal" | "high" | "urgent" | "critical";
  status:
    | "pending"
    | "acknowledged"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "dismissed";
  assignedTo?: string; // staff member ID
  assignedBy?: string; // who assigned it
  department: "reception" | "nursing" | "clinical" | "management";
  title: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  assignedAt?: Date;
  resolvedAt?: Date;
  dueAt?: Date;
  escalatedAt?: Date;
  escalationLevel: number; // 0 = initial, 1+ = escalated
  interventions: Intervention[];
  auditLog: AlertAuditEntry[];
}

export interface Intervention {
  id: string;
  alertId: string;
  type:
    | "call"
    | "whatsapp"
    | "email"
    | "sms"
    | "in_person"
    | "reschedule"
    | "discount";
  status: "planned" | "attempted" | "completed" | "failed" | "cancelled";
  scheduledAt: Date;
  attemptedAt?: Date;
  completedAt?: Date;
  performedBy: string;
  notes: string;
  outcome: "successful" | "partial" | "failed" | "no_response";
  nextAction?: string;
}

export interface AlertAuditEntry {
  id: string;
  alertId: string;
  action:
    | "created"
    | "acknowledged"
    | "assigned"
    | "escalated"
    | "resolved"
    | "dismissed"
    | "updated";
  performedBy: string;
  performedAt: Date;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  timeLimits: {
    acknowledge: number; // minutes
    assign: number; // minutes
    resolve: number; // minutes
  };
  departments: string[];
}

export interface EscalationCondition {
  type:
    | "time_elapsed"
    | "risk_score"
    | "appointment_time"
    | "patient_history"
    | "staff_availability";
  operator: "greater_than" | "less_than" | "equals" | "contains";
  value: string | number;
  unit?: "minutes" | "hours" | "days" | "percentage";
}

export interface EscalationAction {
  type:
    | "notify_staff"
    | "reassign"
    | "escalate_level"
    | "trigger_intervention"
    | "schedule_followup";
  targetRole: "receptionist" | "nurse" | "doctor" | "manager" | "coordinator";
  parameters: Record<string, unknown>;
  delay?: number; // minutes
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "receptionist" | "nurse" | "doctor" | "manager" | "coordinator";
  department: string;
  isActive: boolean;
  shiftStart?: string;
  shiftEnd?: string;
  skills: string[];
  maxActiveAlerts: number;
  notificationPreferences: {
    channels: ("email" | "sms" | "whatsapp" | "push" | "desktop")[];
    urgentOnly: boolean;
    offHoursEnabled: boolean;
  };
}

export interface AlertDashboardStats {
  total: number;
  pending: number;
  acknowledged: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  dismissed: number;
  overdue: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  interventionSuccessRate: number; // percentage
}

export interface AlertFilters {
  status?: StaffAlert["status"][];
  priority?: StaffAlert["priority"][];
  department?: string[];
  assignedTo?: string[];
  alertType?: StaffAlert["alertType"][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  riskScore?: {
    min: number;
    max: number;
  };
}

// Brazilian Portuguese localization
export const ALERT_STATUS_LABELS_PT = {
  pending: "Pendente",
  acknowledged: "Reconhecido",
  assigned: "Atribuído",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  dismissed: "Dispensado",
} as const;

export const ALERT_PRIORITY_LABELS_PT = {
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
  critical: "Crítica",
} as const;

export const INTERVENTION_TYPE_LABELS_PT = {
  call: "Ligação Telefônica",
  whatsapp: "WhatsApp",
  email: "E-mail",
  sms: "SMS",
  in_person: "Presencial",
  reschedule: "Reagendamento",
  discount: "Desconto/Oferta",
} as const;

export const DEPARTMENT_LABELS_PT = {
  reception: "Recepção",
  nursing: "Enfermagem",
  clinical: "Clínica",
  management: "Gerência",
} as const;

// Alert priority colors
export const ALERT_PRIORITY_COLORS = {
  normal: "text-blue-600 bg-blue-50 border-blue-200",
  high: "text-yellow-600 bg-yellow-50 border-yellow-200",
  urgent: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
} as const;

// Default escalation timeouts (minutes)
export const DEFAULT_ESCALATION_TIMES = {
  acknowledge: 15, // 15 minutes to acknowledge
  assign: 30, // 30 minutes to assign
  resolve: 120, // 2 hours to resolve
} as const;
