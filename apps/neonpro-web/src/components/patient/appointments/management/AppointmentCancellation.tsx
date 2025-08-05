"use client";

import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Label } from "@/components/ui/label";
import type { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Textarea } from "@/components/ui/textarea";
import type {
  CancellationPolicies,
  PatientAppointment,
} from "@/hooks/patient/usePatientAppointments";
import type { format, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertTriangle, Calendar, Clock, DollarSign } from "lucide-react";
import type { useState } from "react";

/**
 * Appointment Cancellation Dialog for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React dialog patterns and form validation
 * - Tavily: Healthcare cancellation best practices (27% avg no-show rate)
 * - Exa: Industry-standard cancellation policies (24-48h rules, fee structures)
 */

interface AppointmentCancellationProps {
  appointmentId: string;
  appointment: PatientAppointment | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (appointmentId: string, reason: string) => Promise<void>;
  cancellationPolicies: CancellationPolicies | null;
}

const CANCELLATION_REASONS = [
  { value: "illness", label: "Doença/Mal-estar", emergency: false },
  { value: "work_conflict", label: "Conflito de trabalho", emergency: false },
  { value: "transportation", label: "Problemas de transporte", emergency: false },
  { value: "family_emergency", label: "Emergência familiar", emergency: true },
  { value: "medical_emergency", label: "Emergência médica", emergency: true },
  { value: "forgot", label: "Esqueci do agendamento", emergency: false },
  { value: "schedule_change", label: "Mudança na agenda", emergency: false },
  { value: "other", label: "Outro motivo", emergency: false },
] as const;

export function AppointmentCancellation({
  appointmentId,
  appointment,
  open,
  onOpenChange,
  onConfirm,
  cancellationPolicies,
}: AppointmentCancellationProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!appointment) return null;

  // Check if cancellation is allowed
  const canCancel = appointment.can_cancel;
  const hoursUntil = appointment.hours_until_appointment;
  const minimumHours = cancellationPolicies?.minimum_hours || 24;

  // Check if selected reason is emergency
  const selectedReasonData = CANCELLATION_REASONS.find((r) => r.value === selectedReason);
  const isEmergencyReason = selectedReasonData?.emergency || false;

  // Calculate fees
  const feeApplies = cancellationPolicies?.fee_applies && !isEmergencyReason && !canCancel;
  const feeAmount = cancellationPolicies?.fee_amount || 0;

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, "EEEE, dd MMMM yyyy", { locale: ptBR }),
        time: format(dateTime, "HH:mm", { locale: ptBR }),
      };
    } catch (error) {
      return { date, time };
    }
  };

  const handleConfirm = async () => {
    if (!selectedReason) return;

    const finalReason = selectedReason === "other" && customReason ? customReason : selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirm(appointmentId, finalReason);

      // Reset form
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error("Error confirming cancellation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedReason("");
    setCustomReason("");
    onOpenChange(false);
  };

  const { date, time } = formatAppointmentDateTime(
    appointment.appointment_date,
    appointment.appointment_time,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Cancelar Agendamento
          </DialogTitle>
          <DialogDescription>
            Confirme o cancelamento do seu agendamento. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">{appointment.service_name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{time}</span>
              </div>
            </div>
            {appointment.professional_name && (
              <div className="text-sm text-muted-foreground">
                Profissional: {appointment.professional_name}
              </div>
            )}
          </div>

          {/* Policy Warning */}
          {!canCancel ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Cancelamento fora do prazo</strong>
                  </div>
                  <div className="text-sm">
                    • Restam apenas {hoursUntil}h para o agendamento
                    <br />• Política da clínica exige {minimumHours}h de antecedência
                    <br />• Apenas emergências médicas/familiares são aceitas
                  </div>
                  {feeApplies && feeAmount > 0 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">
                        Taxa de cancelamento tardio: <strong>R$ {feeAmount.toFixed(2)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div>
                  <strong>Cancelamento permitido</strong>
                </div>
                <div className="text-sm mt-1">
                  Você tem {hoursUntil}h até o agendamento, dentro do prazo de {minimumHours}h
                  exigido.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Motivo do cancelamento *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {CANCELLATION_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label
                    htmlFor={reason.value}
                    className={`text-sm cursor-pointer ${reason.emergency ? "font-medium text-orange-600" : ""}`}
                  >
                    {reason.label}
                    {reason.emergency && <span className="ml-1 text-xs">(Emergência)</span>}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Custom reason field */}
            {selectedReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason" className="text-sm">
                  Especifique o motivo:
                </Label>
                <Textarea
                  id="customReason"
                  placeholder="Descreva o motivo do cancelamento..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Emergency Override Info */}
          {!canCancel && isEmergencyReason && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div>
                  <strong>Exceção por emergência</strong>
                </div>
                <div className="text-sm mt-1">
                  Emergências médicas e familiares são isentas da política de cancelamento.
                  {feeApplies && feeAmount > 0 && " Taxa de cancelamento não será aplicada."}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Terms confirmation */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <div className="font-medium mb-1">Importante:</div>
            <div>• O cancelamento será processado imediatamente</div>
            <div>• Você receberá uma confirmação por email</div>
            <div>• Para reagendar, será necessário fazer um novo agendamento</div>
            {feeApplies && feeAmount > 0 && !isEmergencyReason && (
              <div>• A taxa de cancelamento será cobrada na próxima consulta</div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Manter Agendamento
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={
              !selectedReason ||
              (selectedReason === "other" && !customReason.trim()) ||
              isSubmitting
            }
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
