'use client';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Calendar, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type {
  CancellationPolicies,
  PatientAppointment,
} from '@/hooks/patient/usePatientAppointments';

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
  { value: 'illness', label: 'Doença/Mal-estar', emergency: false },
  { value: 'work_conflict', label: 'Conflito de trabalho', emergency: false },
  {
    value: 'transportation',
    label: 'Problemas de transporte',
    emergency: false,
  },
  { value: 'family_emergency', label: 'Emergência familiar', emergency: true },
  { value: 'medical_emergency', label: 'Emergência médica', emergency: true },
  { value: 'forgot', label: 'Esqueci do agendamento', emergency: false },
  { value: 'schedule_change', label: 'Mudança na agenda', emergency: false },
  { value: 'other', label: 'Outro motivo', emergency: false },
] as const;

export function AppointmentCancellation({
  appointmentId,
  appointment,
  open,
  onOpenChange,
  onConfirm,
  cancellationPolicies,
}: AppointmentCancellationProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!appointment) return null;

  // Check if cancellation is allowed
  const canCancel = appointment.can_cancel;
  const hoursUntil = appointment.hours_until_appointment;
  const minimumHours = cancellationPolicies?.minimum_hours || 24;

  // Check if selected reason is emergency
  const selectedReasonData = CANCELLATION_REASONS.find(
    (r) => r.value === selectedReason
  );
  const isEmergencyReason = selectedReasonData?.emergency;

  // Calculate fees
  const feeApplies =
    cancellationPolicies?.fee_applies && !isEmergencyReason && !canCancel;
  const feeAmount = cancellationPolicies?.fee_amount || 0;

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, 'EEEE, dd MMMM yyyy', { locale: ptBR }),
        time: format(dateTime, 'HH:mm', { locale: ptBR }),
      };
    } catch (_error) {
      return { date, time };
    }
  };

  const handleConfirm = async () => {
    if (!selectedReason) return;

    const finalReason =
      selectedReason === 'other' && customReason
        ? customReason
        : selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirm(appointmentId, finalReason);

      // Reset form
      setSelectedReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error confirming cancellation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedReason('');
    setCustomReason('');
    onOpenChange(false);
  };

  const { date, time } = formatAppointmentDateTime(
    appointment.appointment_date,
    appointment.appointment_time
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Cancelar Agendamento
          </DialogTitle>
          <DialogDescription>
            Confirme o cancelamento do seu agendamento. Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="space-y-2 rounded-lg bg-muted/30 p-4">
            <h3 className="font-semibold">{appointment.service_name}</h3>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
              <div className="text-muted-foreground text-sm">
                Profissional: {appointment.professional_name}
              </div>
            )}
          </div>

          {/* Policy Warning */}
          {canCancel ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div>
                  <strong>Cancelamento permitido</strong>
                </div>
                <div className="mt-1 text-sm">
                  Você tem {hoursUntil}h até o agendamento, dentro do prazo de{' '}
                  {minimumHours}h exigido.
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Cancelamento fora do prazo</strong>
                  </div>
                  <div className="text-sm">
                    • Restam apenas {hoursUntil}h para o agendamento
                    <br />• Política da clínica exige {minimumHours}h de
                    antecedência
                    <br />• Apenas emergências médicas/familiares são aceitas
                  </div>
                  {feeApplies && feeAmount > 0 && (
                    <div className="mt-2 flex items-center gap-2 rounded bg-red-50 p-2 dark:bg-red-950">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">
                        Taxa de cancelamento tardio:{' '}
                        <strong>R$ {feeAmount.toFixed(2)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="font-medium text-sm">
              Motivo do cancelamento *
            </Label>
            <RadioGroup
              onValueChange={setSelectedReason}
              value={selectedReason}
            >
              {CANCELLATION_REASONS.map((reason) => (
                <div className="flex items-center space-x-2" key={reason.value}>
                  <RadioGroupItem id={reason.value} value={reason.value} />
                  <Label
                    className={`cursor-pointer text-sm ${reason.emergency ? 'font-medium text-orange-600' : ''}`}
                    htmlFor={reason.value}
                  >
                    {reason.label}
                    {reason.emergency && (
                      <span className="ml-1 text-xs">(Emergência)</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Custom reason field */}
            {selectedReason === 'other' && (
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="customReason">
                  Especifique o motivo:
                </Label>
                <Textarea
                  id="customReason"
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Descreva o motivo do cancelamento..."
                  rows={3}
                  value={customReason}
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
                <div className="mt-1 text-sm">
                  Emergências médicas e familiares são isentas da política de
                  cancelamento.
                  {feeApplies &&
                    feeAmount > 0 &&
                    ' Taxa de cancelamento não será aplicada.'}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Terms confirmation */}
          <div className="rounded bg-muted/30 p-3 text-muted-foreground text-xs">
            <div className="mb-1 font-medium">Importante:</div>
            <div>• O cancelamento será processado imediatamente</div>
            <div>• Você receberá uma confirmação por email</div>
            <div>
              • Para reagendar, será necessário fazer um novo agendamento
            </div>
            {feeApplies && feeAmount > 0 && !isEmergencyReason && (
              <div>
                • A taxa de cancelamento será cobrada na próxima consulta
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleCancel}
            variant="outline"
          >
            Manter Agendamento
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={
              !selectedReason ||
              (selectedReason === 'other' && !customReason.trim()) ||
              isSubmitting
            }
            onClick={handleConfirm}
            variant="destructive"
          >
            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
