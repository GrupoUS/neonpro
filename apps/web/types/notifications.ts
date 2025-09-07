// Types for notifications used across the web app
// Keep minimal to satisfy lint; extend as needed by features.

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string; // ISO string
}

export type NotificationEvent =
  | { kind: "add"; payload: NotificationPayload; }
  | { kind: "remove"; id: string; }
  | { kind: "clear"; };
