import type { BaseEntity } from "./common";

export interface Appointment extends BaseEntity {
  patient_id: string;
  professional_id: string;
  service_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string;
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
