"use client";

import type { format } from "date-fns";
import type { pt } from "date-fns/locale";
import type { AlertTriangle, CheckCircle, Clock, RefreshCw, Shield, Users } from "lucide-react";
import type { useRef, useState } from "react";
import type { createClient } from "@/app/utils/supabase/client";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Separator } from "@/components/ui/separator";
import type { TimeSlot } from "@/hooks/use-realtime-availability";
import type { useToast } from "@/hooks/use-toast";

interface ConflictDetector {
  hasConflict: boolean;
  conflictType: "time_overlap" | "double_booking" | "professional_unavailable" | null;
  conflictingSlots: TimeSlot[];
  message: string;
}

interface BookingConflictPreventionProps {
  selectedSlot: TimeSlot | null;
  patientId: string;
  onConflictResolved?: () => void;
}

export function BookingConflictPrevention({
  selectedSlot,
  patientId,
  onConflictResolved,
}: BookingConflictPreventionProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [conflictDetector, setConflictDetector] = useState<ConflictDetector | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const supabase = createClient();
  const { toast } = useToast();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar conflitos
  const checkForConflicts = async (slot: TimeSlot): Promise<ConflictDetector> => {
    try {
      // 1. Verificar se o slot ainda está disponível
      const { data: currentSlot, error: slotError } = await supabase
        .from("time_slots")
        .select("*")
        .eq("id", slot.id)
        .single();

      if (slotError) {
        throw new Error(`Erro ao verificar slot: ${slotError.message}`);
      }

      if (!currentSlot.is_available) {
        return {
          hasConflict: true,
          conflictType: "double_booking",
          conflictingSlots: [currentSlot],
          message: "Este horário foi reservado por outro paciente",
        };
      }

      // 2. Verificar se o profissional tem outros compromissos no mesmo horário
      const { data: professionalSlots, error: profError } = await supabase
        .from("time_slots")
        .select(`
          *,
          appointments!inner(*)
        `)
        .eq("professional_id", slot.professional_id)
        .eq("date", slot.date)
        .neq("id", slot.id);

      if (profError) {
        throw new Error(`Erro ao verificar profissional: ${profError.message}`);
      }

      // Verificar sobreposição de horários
      const conflictingSlots = professionalSlots.filter((profSlot) => {
        const slotStart = new Date(`${slot.date}T${slot.start_time}`);
        const slotEnd = new Date(`${slot.date}T${slot.end_time}`);
        const profStart = new Date(`${profSlot.date}T${profSlot.start_time}`);
        const profEnd = new Date(`${profSlot.date}T${profSlot.end_time}`);

        return (
          (slotStart < profEnd && slotEnd > profStart) ||
          (profStart < slotEnd && profEnd > slotStart)
        );
      });

      if (conflictingSlots.length > 0) {
        return {
          hasConflict: true,
          conflictType: "time_overlap",
          conflictingSlots,
          message: "O profissional possui outro compromisso neste horário",
        };
      }

      // 3. Verificar se o paciente já tem agendamento no mesmo dia
      const { data: patientAppointments, error: patientError } = await supabase
        .from("appointments")
        .select(`
          *,
          time_slot:time_slots(*)
        `)
        .eq("patient_id", patientId)
        .eq("status", "confirmed");

      if (patientError) {
        throw new Error(`Erro ao verificar paciente: ${patientError.message}`);
      }

      const sameDayAppointments = patientAppointments.filter(
        (apt) => apt.time_slot?.date === slot.date,
      );

      if (sameDayAppointments.length > 0) {
        return {
          hasConflict: true,
          conflictType: "double_booking",
          conflictingSlots: sameDayAppointments.map((apt) => apt.time_slot),
          message: "Você já possui um agendamento neste dia",
        };
      }

      // Nenhum conflito encontrado
      return {
        hasConflict: false,
        conflictType: null,
        conflictingSlots: [],
        message: "Nenhum conflito detectado",
      };
    } catch (error) {
      console.error("Erro na verificação de conflitos:", error);
      return {
        hasConflict: true,
        conflictType: "professional_unavailable",
        conflictingSlots: [],
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  };

  // Função para executar verificação
  const runConflictCheck = async () => {
    if (!selectedSlot) return;

    setIsChecking(true);
    try {
      const detector = await checkForConflicts(selectedSlot);
      setConflictDetector(detector);
      setLastCheckedAt(new Date());

      // Notificar sobre conflitos
      if (detector.hasConflict) {
        toast({
          title: "Conflito detectado",
          description: detector.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verificação concluída",
          description: "Nenhum conflito encontrado",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar conflitos",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Função para resolver conflito
  const resolveConflict = async () => {
    if (!conflictDetector?.hasConflict) return;

    switch (conflictDetector.conflictType) {
      case "double_booking":
      case "time_overlap":
        // Sugerir horários alternativos
        toast({
          title: "Sugestão",
          description: "Selecione outro horário disponível",
        });
        onConflictResolved?.();
        break;

      case "professional_unavailable":
        // Atualizar dados
        await runConflictCheck();
        break;
    }
  };

  if (!selectedSlot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Prevenção de Conflitos
          </CardTitle>
          <CardDescription className="text-xs">
            Selecione um horário para verificar conflitos
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Prevenção de Conflitos
            </CardTitle>
            <CardDescription className="text-xs">
              Verificação automática de disponibilidade
            </CardDescription>
          </div>

          <Button size="sm" variant="outline" onClick={runConflictCheck} disabled={isChecking}>
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? "animate-spin" : ""}`} />
            Verificar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do slot selecionado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Horário selecionado:</span>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(selectedSlot.date + "T00:00:00"), "dd/MM/yyyy", { locale: pt })}
              {" às "}
              {format(new Date(`2000-01-01T${selectedSlot.start_time}`), "HH:mm")}
            </Badge>
          </div>

          {lastCheckedAt && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Última verificação:</span>
              <span>{format(lastCheckedAt, "HH:mm:ss")}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Status da verificação */}
        {isChecking && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Verificando conflitos...</span>
          </div>
        )}

        {conflictDetector && !isChecking && (
          <div className="space-y-3">
            {conflictDetector.hasConflict ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Conflito detectado:</strong> {conflictDetector.message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Disponível:</strong> {conflictDetector.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Detalhes dos conflitos */}
            {conflictDetector.conflictingSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Horários conflitantes:</p>
                {conflictDetector.conflictingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>
                        {slot.date} às {slot.start_time}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {slot.is_available ? "Disponível" : "Ocupado"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Ações de resolução */}
            {conflictDetector.hasConflict && (
              <Button size="sm" variant="outline" onClick={resolveConflict} className="w-full">
                Resolver Conflito
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
