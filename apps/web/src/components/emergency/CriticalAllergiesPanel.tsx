"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Critical Allergies Types
export interface CriticalAllergy {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  reactions: string[];
  treatments: string[];
  lastReaction?: {
    date: string;
    description: string;
    treatment: string;
  };
  medications?: string[];
  crossReactivities?: string[];
}

export interface CriticalAllergiesPanelProps {
  allergies: CriticalAllergy[];
  patientName: string;
  onCallEmergency: () => void;
  onViewFullHistory: () => void;
  emergencyMode?: boolean;
  showMedications?: boolean;
  className?: string;
}

// Severity Colors and Styles
const getSeverityStyles = (severity: CriticalAllergy["severity"]) => {
  switch (severity) {
    case "life-threatening":
      return {
        badge: "bg-red-600 text-white animate-pulse border-2 border-red-400",
        card: "border-red-500 bg-red-50 dark:bg-red-950/30 shadow-red-500/30",
        icon: "text-red-600 animate-bounce",
        text: "text-red-800 dark:text-red-200",
        priority: "RISCO DE VIDA",
      };
    case "severe":
      return {
        badge: "bg-orange-600 text-white border-orange-400",
        card: "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-orange-500/20",
        icon: "text-orange-600",
        text: "text-orange-800 dark:text-orange-200",
        priority: "GRAVE",
      };
    case "moderate":
      return {
        badge: "bg-yellow-600 text-white border-yellow-400",
        card: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
        icon: "text-yellow-600",
        text: "text-yellow-800 dark:text-yellow-200",
        priority: "MODERADA",
      };
    case "mild":
      return {
        badge: "bg-blue-600 text-white",
        card: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
        icon: "text-blue-600",
        text: "text-blue-800 dark:text-blue-200",
        priority: "LEVE",
      };
  }
};export function CriticalAllergiesPanel({
  allergies,
  patientName,
  onCallEmergency,
  onViewFullHistory,
  emergencyMode = false,
  showMedications = true,
  className,
}: CriticalAllergiesPanelProps) {
  const [expandedAllergy, setExpandedAllergy] = useState<string | null>(
    emergencyMode ? null : null
  );
  const [isVisible, setIsVisible] = useState(true);

  // Sort allergies by severity (life-threatening first)
  const sortedAllergies = [...allergies].sort((a, b) => {
    const severityOrder = { "life-threatening": 0, severe: 1, moderate: 2, mild: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const lifeThreatening = allergies.filter(a => a.severity === "life-threatening");
  const hasLifeThreatening = lifeThreatening.length > 0;

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="destructive"
          size="sm"
          className="shadow-lg"
          aria-label="Mostrar alergias críticas"
        >
          <Eye className="h-4 w-4 mr-1" />
          Alergias ({allergies.length})
        </Button>
      </div>
    );
  }  return (
    <Card
      className={cn(
        "w-full transition-all duration-200",
        hasLifeThreatening && "border-2 border-red-500 shadow-red-500/50 shadow-lg",
        emergencyMode && "shadow-2xl scale-[1.01]",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-labelledby="allergies-panel-title"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {hasLifeThreatening && (
                <Zap className="h-6 w-6 text-red-600 animate-bounce" aria-hidden="true" />
              )}
              {!hasLifeThreatening && (
                <Shield className="h-6 w-6 text-orange-600" aria-hidden="true" />
              )}
            </div>
            <div>
              <CardTitle
                id="allergies-panel-title"
                className="text-lg font-bold flex items-center gap-2"
              >
                Alergias Críticas
                <Badge
                  className={cn(
                    "text-xs",
                    hasLifeThreatening 
                      ? "bg-red-600 text-white animate-pulse" 
                      : "bg-orange-600 text-white"
                  )}
                >
                  {allergies.length}
                </Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Paciente: {patientName}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              aria-label="Minimizar painel de alergias"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            {hasLifeThreatening && (
              <Button
                onClick={onCallEmergency}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 font-bold animate-pulse"
                aria-label="Chamar emergência - Alergias com risco de vida"
              >
                <Phone className="h-4 w-4 mr-1" />
                EMERGÊNCIA
              </Button>
            )}
          </div>
        </div>
      </CardHeader>      <CardContent className="space-y-3">
        {/* Life-threatening Alert */}
        {hasLifeThreatening && (
          <div className="bg-red-100 dark:bg-red-950/30 border border-red-500 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-200 mb-2">
              <AlertTriangle className="h-5 w-5 animate-bounce" aria-hidden="true" />
              ATENÇÃO: ALERGIAS COM RISCO DE VIDA DETECTADAS
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {lifeThreatening.length} alergia{lifeThreatening.length > 1 ? 's' : ''} 
              pode{lifeThreatening.length === 1 ? '' : 'm'} causar reação fatal. 
              Verificar medicações e tratamentos antes de qualquer procedimento.
            </div>
          </div>
        )}

        {/* Allergies List */}
        <div className="space-y-3">
          {sortedAllergies.map((allergy) => {
            const severityStyles = getSeverityStyles(allergy.severity);
            const isExpanded = expandedAllergy === allergy.id;

            return (
              <div
                key={allergy.id}
                className={cn(
                  "border rounded-lg transition-all duration-200",
                  severityStyles.card,
                  allergy.severity === "life-threatening" && "shadow-lg"
                )}
              >
                {/* Allergy Header */}
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => setExpandedAllergy(isExpanded ? null : allergy.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedAllergy(isExpanded ? null : allergy.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`allergy-details-${allergy.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={severityStyles.icon}>
                        {allergy.severity === "life-threatening" && (
                          <Zap className="h-5 w-5" aria-hidden="true" />
                        )}
                        {allergy.severity === "severe" && (
                          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        )}
                        {allergy.severity === "moderate" && (
                          <Shield className="h-4 w-4" aria-hidden="true" />
                        )}
                        {allergy.severity === "mild" && (
                          <Shield className="h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{allergy.name}</div>
                        <Badge className={severityStyles.badge}>
                          {severityStyles.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {allergy.reactions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {allergy.reactions.length} reação{allergy.reactions.length > 1 ? 'ões' : ''}
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </div>                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    id={`allergy-details-${allergy.id}`}
                    className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3"
                  >
                    {/* Reactions */}
                    {allergy.reactions.length > 0 && (
                      <div>
                        <span className="font-semibold text-sm text-muted-foreground mb-2 block">
                          Reações:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {allergy.reactions.map((reaction, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={cn("text-xs", severityStyles.text)}
                            >
                              {reaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatments */}
                    {allergy.treatments.length > 0 && (
                      <div>
                        <span className="font-semibold text-sm text-green-700 dark:text-green-300 mb-2 block">
                          Tratamentos:
                        </span>
                        <div className="space-y-1">
                          {allergy.treatments.map((treatment, index) => (
                            <div key={index} className="text-sm bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                              • {treatment}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications to Avoid */}
                    {showMedications && allergy.medications && allergy.medications.length > 0 && (
                      <div>
                        <span className="font-semibold text-sm text-red-700 dark:text-red-300 mb-2 block">
                          Medicações a Evitar:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {allergy.medications.map((medication, index) => (
                            <Badge
                              key={index}
                              variant="destructive"
                              className="text-xs bg-red-100 text-red-800 border border-red-300"
                            >
                              {medication}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cross-reactivities */}
                    {allergy.crossReactivities && allergy.crossReactivities.length > 0 && (
                      <div>
                        <span className="font-semibold text-sm text-orange-700 dark:text-orange-300 mb-2 block">
                          Reatividade Cruzada:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {allergy.crossReactivities.map((item, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-orange-300 text-orange-700"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}                    {/* Last Known Reaction */}
                    {allergy.lastReaction && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span className="font-semibold text-sm text-muted-foreground">
                            Última Reação ({allergy.lastReaction.date}):
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Descrição:</strong> {allergy.lastReaction.description}</div>
                          <div><strong>Tratamento:</strong> {allergy.lastReaction.treatment}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onViewFullHistory}
            variant="outline"
            size="sm"
            className="text-primary hover:text-primary/80"
            aria-label="Ver histórico completo de alergias"
          >
            <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
            Histórico Completo
          </Button>

          {!hasLifeThreatening && (
            <Button
              onClick={onCallEmergency}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
              aria-label="Chamar suporte médico para alergias"
            >
              <Phone className="h-4 w-4 mr-1" aria-hidden="true" />
              Suporte Médico
            </Button>
          )}
        </div>

        {/* Summary Footer */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span>
              {allergies.filter(a => a.severity === "life-threatening").length} risco de vida • 
              {allergies.filter(a => a.severity === "severe").length} graves • 
              {allergies.filter(a => a.severity === "moderate").length} moderadas • 
              {allergies.filter(a => a.severity === "mild").length} leves
            </span>
            <span>LGPD: Dados médicos críticos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}