"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Heart,
  MapPin,
  Phone,
  Shield,
  User,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

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
} // Emergency Status Colors with TweakCN Integration
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
  const statusStyles = getStatusStyles(patient.currentStatus);
  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 hover:shadow-neonpro-glow/30",
        statusStyles.card,
        emergencyMode && "border-2 shadow-2xl scale-[1.02]",
        className,
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
          </div>{" "}
          {/* Emergency Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onCallSAMU}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 font-bold"
              aria-label="Ligar para SAMU 192 - Emergência"
            >
              <Phone className="h-4 w-4 mr-1" aria-hidden="true" />
              SAMU 192
            </Button>
            {patient.emergencyContacts.length > 0 && (
              <Button
                onClick={() => onCallEmergencyContact(patient.emergencyContacts[0])}
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                aria-label={`Ligar para ${
                  patient.emergencyContacts[0].name
                } - Contato de emergência`}
              >
                <User className="h-4 w-4 mr-1" aria-hidden="true" />
                Contato
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Critical Information Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blood Type & Allergies */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span className="font-semibold text-sm text-muted-foreground">
                Tipo Sanguíneo:
              </span>
              <Badge variant="destructive" className="font-bold">
                {patient.bloodType}
              </Badge>
            </div>{" "}
            {patient.allergies.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Alergias:
                </span>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="text-xs bg-red-100 text-red-800 border border-red-300"
                      aria-label={`Alergia: ${allergy}`}
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Critical Conditions */}
          {patient.criticalConditions.length > 0 && (
            <div className="space-y-2">
              <span className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <Heart className="h-4 w-4 text-orange-600" aria-hidden="true" />
                Condições Críticas:
              </span>
              <div className="space-y-1">
                {patient.criticalConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="text-sm bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded border-l-4 border-orange-500"
                  >
                    {condition}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>{" "}
        {/* Critical Medications */}
        {patient.medications.some((med) => med.isCritical) && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-300">
            <span className="font-semibold text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-1 mb-2">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Medicações Críticas:
            </span>
            <div className="space-y-2">
              {patient.medications
                .filter((med) => med.isCritical)
                .map((medication, index) => (
                  <div key={index} className="text-sm space-y-1">
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                      {medication.lastTaken && (
                        <span className="ml-2 text-xs">
                          (Última dose: {medication.lastTaken})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Location Information */}
        {patient.lastKnownLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>Última localização: {patient.lastKnownLocation.address}</span>
          </div>
        )}
        {/* Additional Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            aria-expanded={isExpanded}
            aria-controls={`emergency-details-${patient.id}`}
          >
            <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
            {isExpanded ? "Menos Detalhes" : "Mais Detalhes"}
          </Button>

          <Button
            onClick={onAccessMedicalHistory}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            aria-label="Acessar histórico médico completo"
          >
            <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
            Histórico
          </Button>
        </div>{" "}
        {/* Expanded Details */}
        {isExpanded && (
          <div
            id={`emergency-details-${patient.id}`}
            className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/* All Emergency Contacts */}
            {patient.emergencyContacts.length > 1 && (
              <div>
                <span className="font-semibold text-sm text-muted-foreground mb-2 block">
                  Todos os Contatos de Emergência:
                </span>
                <div className="space-y-2">
                  {patient.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {contact.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {contact.relationship} • {contact.phone}
                        </div>
                      </div>
                      <Button
                        onClick={() => onCallEmergencyContact(contact)}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        aria-label={`Ligar para ${contact.name}`}
                      >
                        <Phone className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical History Summary */}
            {patient.medicalHistory.length > 0 && (
              <div>
                <span className="font-semibold text-sm text-muted-foreground mb-2 block">
                  Histórico Médico Relevante:
                </span>
                <div className="space-y-1">
                  {patient.medicalHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </div>
                  ))}
                  {patient.medicalHistory.length > 3 && (
                    <div className="text-xs text-muted-foreground italic">
                      +{patient.medicalHistory.length - 3} mais itens no histórico completo
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LGPD Compliance Notice */}
            {patient.lgpdConsent && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" aria-hidden="true" />
                Dados acessados conforme consentimento LGPD
                {patient.cfmNumber && <span className="ml-2">CFM: {patient.cfmNumber}</span>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
