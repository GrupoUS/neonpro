/**
 * LGPD Compliance Types
 * Interfaces for data subject rights and compliance requests
 */

export interface LGPDRequest {
  id: string;
  requestType: "access" | "rectification" | "deletion" | "portability" | "objection";
  requestedAt: string;
  status: "pending" | "processing" | "completed" | "denied";
  subjectId: string;
  subjectEmail: string;
  description?: string;
  completedAt?: string;
  denialReason?: string;
}

export interface DataSubjectRightsRequest {
  requestType: string;
  subjectEmail: string;
  description: string;
  details?: {
    specificData?: string[];
    reason?: string;
    urgency?: "low" | "medium" | "high";
  };
}
