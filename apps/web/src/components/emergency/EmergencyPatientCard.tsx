"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Heart,
  Phone,
  Shield,
  User,
  Clock,
  MapPin,
  FileText,
  Zap,
  Activity,
} from "lucide-react";

// Emergency Patient Data Types
export interface EmergencyPatientData {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  allergies: string[];
  criticalConditions: string[];
  emergencyContacts: EmergencyContact[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  currentStatus: "stable" | "critical" | "emergency" | "life-threatening";
  medications: EmergencyMedication[];
  medicalHistory: string[];
  cfmNumber?: string;
  lgpdConsent: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface EmergencyMedication {
  name: string;
  dosage: string;
  frequency: string;
  isCritical: boolean;
  lastTaken?: string;
}

export interface EmergencyPatientCardProps {
  patient: EmergencyPatientData;
  onCallSAMU: () => void;
  onCallEmergencyContact: (contact: EmergencyContact) => void;
  onAccessMedicalHistory: () => void;
  emergencyMode?: boolean;
  className?: string;
}// Emergency Status Colors with TweakCN Integration
const getStatusStyles = (status: EmergencyPatientData["currentStatus"]) => {
  switch (status) {
    case "life-threatening":
      return {
        card: "border-red-500 bg-red-50 dark:bg-red-950/20 shadow-red-500/20 shadow-lg",
        badge: "bg-red-600 text-white animate-pulse",
        icon: "text-red-600 animate-bounce",
        priority: "CRÍTICO",
      };
    case "emergency":
      return {
        card: "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-orange-500/20 shadow-lg",
        badge: "bg-orange-600 text-white",
        icon: "text-orange-600",
        priority: "URGENTE",
      };
    case "critical":
      return {
        card: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 shadow-yellow-500/20",
        badge: "bg-yellow-600 text-white",
        icon: "text-yellow-600",
        priority: "CRÍTICO",
      };
    case "stable":
      return {
        card: "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-green-500/20",
        badge: "bg-green-600 text-white",
        icon: "text-green-600",
        priority: "ESTÁVEL",
      };
  }
};

export function EmergencyPatientCard({
  patient,
  onCallSAMU,
  onCallEmergencyContact,
  onAccessMedicalHistory,
  emergencyMode = false,
  className,
}: EmergencyPatientCardProps) {
  const [isExpanded, setIsExpanded] = useState(emergencyMode);
  const statusStyles = getStatusStyles(patient.currentStatus);  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 hover:shadow-neonpro-glow/30",
        statusStyles.card,
        emergencyMode && "border-2 shadow-2xl scale-[1.02]",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-labelledby={`emergency-patient-${patient.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("relative", statusStyles.icon)}>
              {patient.currentStatus === "life-threatening" && (
                <Zap className="h-6 w-6" aria-hidden="true" />
              )}
              {patient.currentStatus === "emergency" && (
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              )}
              {patient.currentStatus === "critical" && (
                <Activity className="h-6 w-6" aria-hidden="true" />
              )}
              {patient.currentStatus === "stable" && (
                <Heart className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <CardTitle 
                id={`emergency-patient-${patient.id}`}
                className="text-xl font-bold flex items-center gap-2"
              >
                {patient.name}
                <span className="text-sm font-normal text-muted-foreground">
                  ({patient.age} anos)
                </span>
              </CardTitle>
              <Badge 
                className={statusStyles.badge}
                aria-label={`Status: ${statusStyles.priority}`}
              >
                {statusStyles.priority}
              </Badge>
            </div>
          </div>