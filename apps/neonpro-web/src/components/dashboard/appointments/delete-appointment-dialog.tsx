import type { AppointmentWithRelations } from "@/app/lib/types/appointments";
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
import type { Textarea } from "@/components/ui/textarea";
import type { differenceInHours, format, isAfter } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertTriangle, Calendar, Clock, Loader2, Stethoscope, User } from "lucide-react";
import type { useState } from "react";
import type { toast } from "sonner";

interface DeleteAppointmentDialogProps {
  appointment: AppointmentWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteAppointmentDialog({
  appointment,
  isOpen,
  onClose,
  onDelete,
}: DeleteAppointmentDialogProps) {
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!appointment) return null;

  // Calculate warnings based on appointment details
  const appointmentDate = new Date(appointment.start_time);
  const now = new Date();
  const isFutureAppointment = isAfter(appointmentDate, now);
  const hoursUntilAppointment = differenceInHours(appointmentDate, now);
  const isConfirmed = appointment.status === "confirmed";
  const isToday = appointmentDate.toDateString() === now.toDateString();
  const isUrgent = isFutureAppointment && hoursUntilAppointment <= 24;

  // Generate warning messages
  const warnings = [];

  if (isFutureAppointment) {
    warnings.push({
      icon: Calendar,
      message: `Este é um agendamento futuro (${format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      })})`,
      severity: "warning" as const,
    });
  }

  if (isConfirmed) {
    warnings.push({
      icon: AlertTriangle,
      message: "Agendamento confirmado - paciente pode estar a caminho",
      severity: "error" as const,
    });
  }

  if (isUrgent) {
    warnings.push({
      icon: Clock,
      message: `Agendamento em menos de 24h (${hoursUntilAppointment}h restantes)`,
      severity: "error" as const,
    });
  }

  if (isToday) {
    warnings.push({
      icon: AlertTriangle,
      message: "Agendamento para hoje - considere reagendar ao invés de cancelar",
      severity: "warning" as const,
    });
  }

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, informe o motivo do cancelamento");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        toast.success("Agendamento cancelado com sucesso");
        onDelete();
        handleClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error_message || "Erro ao cancelar agendamento");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Erro interno do servidor");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Agendamento
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O agendamento será marcado como cancelado e permanecerá
            no histórico para auditoria.
          </DialogDescription>
        </DialogHeader>

        {/* Appointment Details */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {appointment.patient?.full_name || "Paciente não informado"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4" />
                <span>{appointment.professional?.full_name || "Profissional não informado"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {appointment.service_type?.name || "Serviço não especificado"}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warning, index) => {
                const IconComponent = warning.icon;
                return (
                  <Alert
                    key={index}
                    variant={warning.severity === "error" ? "destructive" : "default"}
                  >
                    <IconComponent className="h-4 w-4" />
                    <AlertDescription>{warning.message}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo do cancelamento <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ex: Paciente solicitou reagendamento, conflito de horário, etc..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDeleting}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Este motivo será registrado no histórico para auditoria.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Manter Agendamento
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !reason.trim()}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
