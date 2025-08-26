import { TriggerClient } from "@trigger.dev/sdk";

// Cliente Trigger.dev configurado para NeonPro
export const client = new TriggerClient({
  id: "neonpro-clinic-automation",
  apiKey: process.env.TRIGGER_SECRET_KEY,
  apiUrl: process.env.TRIGGER_API_URL || "https://api.trigger.dev",
  verbose: process.env.NODE_ENV === "development",
});

// Job categories para organização
export const JOB_IDS = {
  // Email automation (impacto imediato)
  APPOINTMENT_CONFIRMATION: "appointment-confirmation-email",
  APPOINTMENT_REMINDER: "appointment-reminder-email",
  INVOICE_EMAIL: "invoice-email-delivery",
  PAYMENT_REMINDER: "payment-reminder-email",

  // Notification jobs (engage pacientes)
  WHATSAPP_REMINDER: "whatsapp-appointment-reminder",
  PUSH_NOTIFICATION: "push-notification-send",

  // Financial automation (relatórios automáticos)
  DAILY_FINANCIAL_REPORT: "daily-financial-report",
  WEEKLY_CASH_FLOW: "weekly-cash-flow-report",
  MONTHLY_BILLING_SUMMARY: "monthly-billing-summary",

  // Stock & inventory (já tem base no projeto)
  STOCK_ALERT_CHECK: "stock-alert-check",
  INVENTORY_REPORT: "inventory-status-report",

  // Data processing (otimizações)
  PATIENT_DATA_SYNC: "patient-data-synchronization",
  APPOINTMENT_ANALYTICS: "appointment-analytics-processing",
} as const;

export type JobId = (typeof JOB_IDS)[keyof typeof JOB_IDS];

// Helper types para jobs
export interface EmailJobPayload {
  recipientEmail: string;
  recipientName: string;
  clinicName: string;
  clinicId: string;
}

export interface AppointmentJobPayload extends EmailJobPayload {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  professionalName: string;
  serviceName: string;
}

export interface InvoiceJobPayload extends EmailJobPayload {
  invoiceId: string;
  amount: number;
  dueDate: string;
  invoiceUrl?: string;
}

export interface ReportJobPayload {
  clinicId: string;
  reportType: "daily" | "weekly" | "monthly";
  recipientEmails: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
