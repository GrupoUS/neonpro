// Staff Alert Types

export interface StaffAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "urgent";
  category: "scheduling" | "patient" | "system" | "compliance" | "emergency";
  staffId?: string;
  departmentId?: string;
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  actions?: StaffAlertAction[];
  metadata?: Record<string, unknown>;
}

export interface StaffAlertAction {
  id: string;
  label: string;
  type: "button" | "link" | "navigation";
  action: string;
  variant?: "primary" | "secondary" | "destructive";
}

export interface StaffAlertFilter {
  type?: StaffAlert["type"][];
  priority?: StaffAlert["priority"][];
  category?: StaffAlert["category"][];
  status?: ("unread" | "read" | "acknowledged" | "resolved")[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}
