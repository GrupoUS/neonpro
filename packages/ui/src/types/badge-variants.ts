/**
 * Badge Variant Types
 * Centralized type definitions for badge component variants
 */

export type BadgeVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "normal"
  | "patient"
  | "appointment"
  | "professional"
  | "urgent"
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "emergency"
  | "routine"
  | "follow-up"
  | "critical"
  | "low"
  | "offline"
  | "lgpd-compliant"
  | "lgpd-warning"
  | "lgpd-violation";

export type ProgressVariant =
  | "default"
  | "medical"
  | "success"
  | "warning"
  | "critical"
  | "treatment";

export type SecurityAlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type SecurityEventStatus =
  | "open"
  | "resolved"
  | "investigating"
  | "false_positive";

export type ContrastContext =
  | "emergency"
  | "form"
  | "patient-data"
  | "general";
