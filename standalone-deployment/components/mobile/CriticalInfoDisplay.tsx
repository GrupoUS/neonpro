"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  // Clock, // Unused import
  Heart,
  Phone,
  Pill,
  // Shield, // Unused import
  User,
  Zap,
} from "lucide-react";
import React from "react";

// Interface para informações críticas do paciente
interface CriticalPatientInfo {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  allergies: {
    substance: string;
    severity: "mild" | "moderate" | "severe" | "life-threatening";
    reaction?: string;
  }[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    critical: boolean;
  }[];
  medicalConditions: {
    condition: string;
    severity: "stable" | "monitoring" | "critical";
    notes?: string;
  }[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  lastVitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    timestamp: Date;
  };
  emergencyNotes?: string;
}

interface CriticalInfoDisplayProps {
  patient: CriticalPatientInfo;
  emergencyMode?: boolean;
  onEmergencyCall?: () => void;
  className?: string;
}

// Mapeamento de cores para severity (8:1 contrast ratio)
const getSeverityColors = (severity: string, emergencyMode = false) => {
  const baseColors = {
    "life-threatening": emergencyMode
      ? "bg-red-900 text-white border-red-700"
      : "bg-red-100 text-red-900 border-red-300",
    "severe": emergencyMode
      ? "bg-red-800 text-white border-red-600"
      : "bg-red-50 text-red-800 border-red-200",
    "moderate": emergencyMode
      ? "bg-amber-800 text-white border-amber-600"
      : "bg-amber-50 text-amber-800 border-amber-200",
    "mild": emergencyMode
      ? "bg-yellow-800 text-white border-yellow-600"
      : "bg-yellow-50 text-yellow-800 border-yellow-200",
    "critical": emergencyMode
      ? "bg-red-900 text-white border-red-700"
      : "bg-red-100 text-red-900 border-red-300",
    "monitoring": emergencyMode
      ? "bg-amber-800 text-white border-amber-600"
      : "bg-amber-50 text-amber-800 border-amber-200",
    "stable": emergencyMode
      ? "bg-green-800 text-white border-green-600"
      : "bg-green-50 text-green-800 border-green-200",
  };

  return baseColors[severity as keyof typeof baseColors] || baseColors.mild;
};

export function CriticalInfoDisplay({
  patient,
  emergencyMode = false,
  onEmergencyCall,
  className,
}: CriticalInfoDisplayProps) {
  // Touch targets: 56px para emergency, 44px normal
  const touchTargetClass = emergencyMode
    ? "min-h-[56px] text-lg"
    : "min-h-[44px]";

  const emergencyTextSize = emergencyMode ? "text-xl" : "text-base";
  const emergencySpacing = emergencyMode ? "space-y-6" : "space-y-4";

  const handleEmergencyCall = () => {
    if (patient.emergencyContact.phone) {
      window.open(`tel:${patient.emergencyContact.phone}`, "_self");
      onEmergencyCall?.();
    }
  };

  const formatVitalSigns = (vitals: typeof patient.lastVitalSigns) => {
    if (!vitals) return null;

    const isRecent = new Date().getTime() - vitals.timestamp.getTime() < 30 * 60 * 1000; // 30 min

    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border",
          isRecent
            ? emergencyMode
              ? "bg-green-800 text-white border-green-600"
              : "bg-green-50 text-green-800 border-green-200"
            : emergencyMode
            ? "bg-amber-800 text-white border-amber-600"
            : "bg-amber-50 text-amber-800 border-amber-200",
        )}
      >
        <Activity className="h-5 w-5" />
        <div className="flex-1">
          <div className="flex gap-4 text-sm font-medium">
            {vitals.heartRate && <span>FC: {vitals.heartRate}bpm</span>}
            {vitals.bloodPressure && <span>PA: {vitals.bloodPressure}</span>}
            {vitals.temperature && <span>T: {vitals.temperature}°C</span>}
          </div>
          <div className="text-xs opacity-80">
            {vitals.timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })} {isRecent ? "(recente)" : "(desatualizado)"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto",
        emergencySpacing,
        className,
      )}
    >
      {/* Header com info básica - High contrast */}
      <Card
        className={cn(
          emergencyMode && "border-2 border-blue-500 shadow-lg",
        )}
      >
        <CardHeader
          className={cn(
            "pb-4",
            emergencyMode && "bg-blue-900 text-white",
          )}
        >
          <CardTitle
            className={cn(
              "flex items-center justify-between",
              emergencyTextSize,
            )}
          >
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <div>
                <div className="font-bold">{patient.name}</div>
                <div
                  className={cn(
                    "text-sm font-normal",
                    emergencyMode ? "text-blue-200" : "text-gray-600",
                  )}
                >
                  {patient.age} anos • Tipo {patient.bloodType}
                </div>
              </div>
            </div>

            {/* Emergency call button - Thumb accessible */}
            <Button
              onClick={handleEmergencyCall}
              variant={emergencyMode ? "secondary" : "outline"}
              size="lg"
              className={cn(
                touchTargetClass,
                "bg-red-600 hover:bg-red-700 text-white border-red-500",
                "font-semibold px-6",
              )}
            >
              <Phone className="h-5 w-5 mr-2" />
              Contato
            </Button>
          </CardTitle>
        </CardHeader>

        {patient.emergencyNotes && (
          <CardContent
            className={cn(
              "pt-0 pb-4",
              emergencyMode && "bg-red-900 text-white",
            )}
          >
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p
                className={cn(
                  "font-medium",
                  emergencyTextSize,
                )}
              >
                {patient.emergencyNotes}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Alergias - Máxima visibilidade */}
      {patient.allergies.length > 0 && (
        <Card className="border-red-400 bg-red-50">
          <CardHeader
            className={cn(
              "pb-3",
              emergencyMode && "bg-red-900 text-white",
            )}
          >
            <CardTitle
              className={cn(
                "flex items-center gap-2 text-red-700",
                emergencyMode && "text-white",
                emergencyTextSize,
              )}
            >
              <AlertTriangle className="h-6 w-6" />
              ALERGIAS
            </CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              emergencyMode && "bg-red-50",
            )}
          >
            <div className="grid gap-3">
              {patient.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 font-semibold",
                    getSeverityColors(allergy.severity, false), // Always use high contrast colors
                    touchTargetClass,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={emergencyTextSize}>{allergy.substance}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-bold uppercase",
                        allergy.severity === "life-threatening" && "bg-red-800 text-white",
                      )}
                    >
                      {allergy.severity === "life-threatening"
                        ? "FATAL"
                        : allergy.severity === "severe"
                        ? "GRAVE"
                        : allergy.severity === "moderate"
                        ? "MODERADA"
                        : "LEVE"}
                    </Badge>
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm mt-1 opacity-90">
                      Reação: {allergy.reaction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicações críticas */}
      {patient.medications.filter(med => med.critical).length > 0 && (
        <Card className="border-orange-400 bg-orange-50">
          <CardHeader
            className={cn(
              "pb-3",
              emergencyMode && "bg-orange-900 text-white",
            )}
          >
            <CardTitle
              className={cn(
                "flex items-center gap-2 text-orange-700",
                emergencyMode && "text-white",
                emergencyTextSize,
              )}
            >
              <Pill className="h-6 w-6" />
              MEDICAÇÕES CRÍTICAS
            </CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              emergencyMode && "bg-orange-50",
            )}
          >
            <div className="grid gap-3">
              {patient.medications.filter(med => med.critical).map((medication, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 bg-orange-100 border-orange-300 text-orange-900",
                    touchTargetClass,
                  )}
                >
                  <div className={cn("font-semibold", emergencyTextSize)}>
                    {medication.name}
                  </div>
                  <p className="text-sm mt-1">
                    {medication.dosage} • {medication.frequency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Condições médicas críticas */}
      {patient.medicalConditions.filter(cond => cond.severity !== "stable").length > 0 && (
        <Card className="border-purple-400 bg-purple-50">
          <CardHeader
            className={cn(
              "pb-3",
              emergencyMode && "bg-purple-900 text-white",
            )}
          >
            <CardTitle
              className={cn(
                "flex items-center gap-2 text-purple-700",
                emergencyMode && "text-white",
                emergencyTextSize,
              )}
            >
              <Heart className="h-6 w-6" />
              CONDIÇÕES MÉDICAS
            </CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              emergencyMode && "bg-purple-50",
            )}
          >
            <div className="grid gap-3">
              {patient.medicalConditions.filter(cond => cond.severity !== "stable").map((
                condition,
                index,
              ) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 font-medium",
                    getSeverityColors(condition.severity, false),
                    touchTargetClass,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={emergencyTextSize}>{condition.condition}</span>
                    <Badge variant="outline" className="text-xs font-bold">
                      {condition.severity === "critical" ? "CRÍTICO" : "MONITORAR"}
                    </Badge>
                  </div>
                  {condition.notes && (
                    <p className="text-sm mt-2 opacity-90">
                      {condition.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sinais vitais */}
      {patient.lastVitalSigns && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle
              className={cn(
                "flex items-center gap-2",
                emergencyTextSize,
              )}
            >
              <Activity className="h-6 w-6 text-blue-600" />
              SINAIS VITAIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formatVitalSigns(patient.lastVitalSigns)}
          </CardContent>
        </Card>
      )}

      {/* Contato de emergência - Bottom thumb zone */}
      <Card className="border-green-400 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  "font-semibold text-green-800",
                  emergencyTextSize,
                )}
              >
                {patient.emergencyContact.name}
              </p>
              <p className="text-green-700">
                {patient.emergencyContact.relation}
              </p>
            </div>
            <Button
              onClick={handleEmergencyCall}
              variant="default"
              size="lg"
              className={cn(
                touchTargetClass,
                "bg-green-600 hover:bg-green-700 text-white px-8 font-bold",
              )}
            >
              <Phone className="h-5 w-5 mr-2" />
              Ligar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CriticalInfoDisplay;
