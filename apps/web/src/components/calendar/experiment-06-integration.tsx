/**
 * LGPD-Compliant Calendar Integration Component
 * Implements comprehensive LGPD compliance for healthcare calendar operations
 */

import { useMemo, useState, useEffect } from "react";
import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import {
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar/types";
import { type CalendarAppointment } from "@/services/appointments.service";
import {
  calendarLGPDConsentService,
  type MinimizedCalendarAppointment,
  type ConsentValidationResult,
  DataMinimizationLevel,
} from "@/services/lgpd/calendar-consent.service";
import { calendarDataMinimizationService } from "@/services/lgpd/data-minimization.service";
import {
  calendarLGPDAuditService,
  LGPDAuditAction,
} from "@/services/lgpd/audit-logging.service";

interface Experiment06CalendarIntegrationProps {
  appointments: CalendarAppointment[];
  onEventUpdate: (
    event: CalendarEvent,
    updates?: Partial<CalendarEvent>,
  ) => void;
  onEventDelete: (eventId: string) => void;
  onNewConsultation?: () => void;
  className?: string;
  userId?: string;
  userRole?: string;
  clinicId?: string;
}

// LGPD compliance status
interface ComplianceStatus {
  isCompliant: boolean;
  consentValidations: ConsentValidationResult[];
  minimizationLevel: DataMinimizationLevel;
  hasIssues: boolean;
  blockedAppointments: string[];
}

// Map appointment status/colors to experiment-06 colors
function mapAppointmentColorToEventColor(
  color: string | undefined,
): EventColor {
  const colorMap: Record<string, EventColor> = {
    "#3b82f6": "blue",
    "#f59e0b": "orange",
    "#8b5cf6": "violet",
    "#f43f5e": "rose",
    "#10b981": "emerald",
    "#f97316": "orange",
    blue: "blue",
    yellow: "orange",
    purple: "violet",
    red: "rose",
    green: "emerald",
    orange: "orange",
  };

  return colorMap[color || "blue"] || "blue";
}

// Convert minimized appointments to calendar events
function mapMinimizedAppointmentToCalendarEvent(
  appointment: MinimizedCalendarAppointment,
): CalendarEvent {
  return {
    id: appointment.id,
    title: appointment.title,
    description: appointment.description,
    start: new Date(appointment.start),
    end: new Date(appointment.end),
    color: mapAppointmentColorToEventColor(appointment.color),
    allDay: false,
  };
}

export function Experiment06CalendarIntegration({
  appointments,
  onEventUpdate,
  onEventDelete,
  onNewConsultation,
  className,
  userId = "current_user",
  userRole = "user",
  clinicId = "default_clinic",
}: Experiment06CalendarIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    isCompliant: false,
    consentValidations: [],
    minimizationLevel: DataMinimizationLevel.MINIMAL,
    hasIssues: false,
    blockedAppointments: [],
  });
  const [minimizedAppointments, setMinimizedAppointments] = useState<
    MinimizedCalendarAppointment[]
  >([]);

  // Process appointments with LGPD compliance
  useEffect(() => {
    const processAppointmentsWithCompliance = async () => {
      if (!appointments.length) {
        setMinimizedAppointments([]);
        setComplianceStatus((prev) => ({
          ...prev,
          isCompliant: true,
          hasIssues: false,
        }));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Process appointments with LGPD compliance
        const result =
          await calendarLGPDConsentService.processAppointmentsWithCompliance(
            appointments,
            userId,
            userRole,
          );

        setMinimizedAppointments(result.compliantAppointments);

        // Update compliance status
        const hasIssues = result.consentIssues.length > 0;
        const blockedAppointments = result.consentIssues
          .filter((issue) => !issue.isValid)
          .map((issue) => issue.patientId);

        setComplianceStatus({
          isCompliant: !hasIssues,
          consentValidations: result.consentIssues,
          minimizationLevel:
            result.compliantAppointments[0]?.consentLevel ||
            DataMinimizationLevel.MINIMAL,
          hasIssues,
          blockedAppointments,
        });

        // Log audit trail for batch processing
        if (result.auditLogId) {
          console.log(
            "LGPD: Calendar appointments processed with audit ID:",
            result.auditLogId,
          );
        }

        // Log consent issues for monitoring
        if (result.consentIssues.length > 0) {
          console.warn("LGPD: Consent issues detected:", {
            totalIssues: result.consentIssues.length,
            blockedAppointments: blockedAppointments.length,
            issues: result.consentIssues.map((issue) => ({
              patientId: issue.patientId,
              error: issue.error,
              recommendation: issue.recommendation,
            })),
          });
        }
      } catch (err) {
        console.error(
          "LGPD: Error processing appointments with compliance:",
          err,
        );
        setError("Erro ao processar agendamentos com conformidade LGPD");

        // Fallback to minimal data on error
        const fallbackAppointments = appointments.map((apt) => ({
          id: apt.id,
          title: "Agendamento Reservado",
          start: apt.start,
          end: apt.end,
          color: apt.color,
          status: apt.status,
          consentLevel: DataMinimizationLevel.MINIMAL,
          requiresConsent: true,
        }));

        setMinimizedAppointments(fallbackAppointments);
        setComplianceStatus({
          isCompliant: false,
          consentValidations: [],
          minimizationLevel: DataMinimizationLevel.MINIMAL,
          hasIssues: true,
          blockedAppointments: appointments.map((a) => a.id),
        });
      } finally {
        setIsLoading(false);
      }
    };

    processAppointmentsWithCompliance();
  }, [appointments, userId, userRole]);

  // Convert minimized appointments to calendar events
  const calendarEvents = useMemo(() => {
    try {
      return minimizedAppointments.map(mapMinimizedAppointmentToCalendarEvent);
    } catch (err) {
      setError("Erro ao converter agendamentos para eventos do calendário");
      console.error(
        "Error mapping minimized appointments to calendar events:",
        err,
      );
      return [];
    }
  }, [minimizedAppointments]);

  // Handle event updates with LGPD compliance
  const handleEventUpdate = async (
    event: CalendarEvent,
    updates?: Partial<CalendarEvent>,
  ) => {
    setIsLoading(true);

    try {
      // Find the original appointment
      const originalAppointment = appointments.find(
        (apt) => apt.id === event.id,
      );
      if (!originalAppointment) {
        throw new Error("Appointment not found");
      }

      // Validate consent for update operation
      const consentResult =
        await calendarLGPDConsentService.validateCalendarConsent(
          event.id,
          "appointment_management" as any,
          userId,
          userRole,
        );

      if (!consentResult.isValid) {
        setError(
          `LGPD: ${consentResult.error || "Consentimento não válido para atualização"}`,
        );
        return;
      }

      // Log audit trail for update
      await calendarLGPDAuditService.logAppointmentAccess(
        originalAppointment,
        userId,
        userRole,
        consentResult,
        complianceStatus.minimizationLevel,
        "edit",
        { updateDetails: updates },
      );

      // Proceed with update
      onEventUpdate(event, updates);
    } catch (err) {
      console.error("Error in LGPD-compliant event update:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar evento");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event deletions with LGPD compliance
  const handleEventDelete = async (eventId: string) => {
    setIsLoading(true);

    try {
      // Find the original appointment
      const originalAppointment = appointments.find(
        (apt) => apt.id === eventId,
      );
      if (!originalAppointment) {
        throw new Error("Appointment not found");
      }

      // Validate consent for delete operation
      const consentResult =
        await calendarLGPDConsentService.validateCalendarConsent(
          eventId,
          "appointment_management" as any,
          userId,
          userRole,
        );

      if (!consentResult.isValid) {
        setError(
          `LGPD: ${consentResult.error || "Consentimento não válido para exclusão"}`,
        );
        return;
      }

      // Log audit trail for deletion
      await calendarLGPDAuditService.logAppointmentAccess(
        originalAppointment,
        userId,
        userRole,
        consentResult,
        complianceStatus.minimizationLevel,
        "edit",
        { deletionReason: "User initiated deletion" },
      );

      // Proceed with deletion
      onEventDelete(eventId);
    } catch (err) {
      console.error("Error in LGPD-compliant event deletion:", err);
      setError(err instanceof Error ? err.message : "Erro ao excluir evento");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new consultation with LGPD compliance
  const handleNewConsultation = async () => {
    if (onNewConsultation) {
      setIsLoading(true);

      try {
        // Log audit trail for new consultation creation
        await calendarLGPDAuditService.logBatchOperation(
          [],
          userId,
          userRole,
          LGPDAuditAction.APPOINTMENT_CREATED,
          "appointment_scheduling" as any,
          [],
          [],
          { action: "NEW_CONSULTATION_INITIATED" },
        );

        onNewConsultation();
      } catch (err) {
        console.error("Error logging new consultation audit:", err);
        // Don't block the action for audit logging failures
        onNewConsultation();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (error) {
    return (
      <div
        className={`p-4 border border-red-200 rounded-md bg-red-50 ${className}`}
      >
        <p className="text-red-800 font-medium">Erro de Conformidade LGPD</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        {complianceStatus.hasIssues && (
          <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
            <p className="text-red-800 text-sm font-medium">
              {complianceStatus.blockedAppointments.length} agendamento(s)
              bloqueado(s) por conformidade LGPD
            </p>
            <p className="text-red-700 text-xs mt-1">
              Verifique os consentimentos dos pacientes ou contate a equipe de
              compliance.
            </p>
          </div>
        )}
      </div>
    );
  }

  const { isColorVisible } = useCalendarContext();

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return calendarEvents.filter((event) => isColorVisible(event.color));
  }, [calendarEvents, isColorVisible]);

  // Compliance status indicator
  const ComplianceIndicator = () => (
    <div
      className={`p-2 rounded-md text-xs font-medium ${
        complianceStatus.isCompliant
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
      }`}
    >
      {complianceStatus.isCompliant ? (
        <span>✓ Conformidade LGPD</span>
      ) : (
        <span>
          ⚠ {complianceStatus.blockedAppointments.length} bloqueado(s) por LGPD
        </span>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* LGPD Compliance Status */}
      <div className="mb-4 flex items-center justify-between">
        <ComplianceIndicator />
        <div className="text-xs text-gray-500">
          Nível de minimização: {complianceStatus.minimizationLevel}
        </div>
      </div>

      {/* LGPD Notice */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800 text-sm">
          <strong>LGPD:</strong> Este calendário opera em conformidade com a Lei
          Geral de Proteção de Dados. Dados dos pacientes são minimizados e
          processados apenas com consentimento válido.
        </p>
        {complianceStatus.hasIssues && (
          <p className="text-blue-700 text-xs mt-1">
            Alguns agendamentos podem estar restritos por falta de
            consentimento.
          </p>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              Processando com conformidade LGPD...
            </p>
          </div>
        </div>
      )}

      <EventCalendar
        events={visibleEvents}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onEventAdd={handleNewConsultation}
        className="relative"
        initialView="week"
      />

      {/* LGPD Compliance Details */}
      {complianceStatus.hasIssues && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-yellow-800 font-medium text-sm mb-2">
            Detalhes de Conformidade LGPD
          </h4>
          <div className="space-y-1">
            {complianceStatus.consentValidations
              .slice(0, 3)
              .map((issue, index) => (
                <div key={index} className="text-yellow-700 text-xs">
                  • {issue.error || "Issue sem descrição"}
                </div>
              ))}
            {complianceStatus.consentValidations.length > 3 && (
              <div className="text-yellow-600 text-xs">
                + {complianceStatus.consentValidations.length - 3} problemas
                adicionais
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
