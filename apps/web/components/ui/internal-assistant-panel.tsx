"use client";

import React from "react";

export interface UserRole {
  id: string;
  name: "Admin" | "Professional" | "Assistant" | "Coordinator";
  permissions: string[];
}

export interface QuerySuggestion {
  id: string;
  text: string;
  category: "patient" | "analytics" | "compliance" | "scheduling";
  confidence: number;
}

export interface QueryResult {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  userId: string;
  type: "table" | "chart" | "text" | "export";
  data?: Record<string, unknown>;
  confidence: number;
}

export interface InternalAssistantPanelProps {
  userRole: UserRole;
  activePatientId?: string;
  onQuerySubmit?: (query: string) => Promise<QueryResult>;
  onExport?: (data: Record<string, unknown>, format: "pdf" | "excel" | "csv") => void;
  className?: string;
}

export function InternalAssistantPanel({ className }: InternalAssistantPanelProps) {
  return (
    <div className={className}>
      Internal Assistant Panel is temporarily unavailable. This placeholder restores
      build while we fix the original component markup.
    </div>
  );
}
