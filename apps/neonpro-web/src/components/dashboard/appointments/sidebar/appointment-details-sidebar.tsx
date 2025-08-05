// components/dashboard/appointments/sidebar/appointment-details-sidebar.tsx
// Main appointment details sidebar with view/edit modes
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

"use client";

import type { useState, useEffect } from "react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Edit,
  X,
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  History,
  Phone,
  Mail,
  Save,
  Loader2,
} from "lucide-react";
import type { toast } from "sonner";
import type { AppointmentWithDetails, AppointmentHistoryEntry } from "@/app/lib/types/appointments";
import AppointmentDetails from "./appointment-details";
import AppointmentEditForm from "./appointment-edit-form";
import AppointmentHistory from "./appointment-history";

interface AppointmentDetailsSidebarProps {
  isOpen: boolean;
  appointmentId: string | null;
  onClose: () => void;
  onUpdate?: (appointment: AppointmentWithDetails) => void;
  onDelete?: (appointmentId: string) => void;
}

export default function AppointmentDetailsSidebar({
  isOpen,
  appointmentId,
  onClose,
  onUpdate,
  onDelete,
}: AppointmentDetailsSidebarProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(null);
  const [history, setHistory] = useState<AppointmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch appointment details
  const fetchAppointmentDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error_message || "Failed to fetch appointment");
      }

      setAppointment(data.data);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast.error("Erro ao carregar agendamento");
    } finally {
      setLoading(false);
    }
  }; // Fetch appointment history
  const fetchAppointmentHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/history`);
      const data = await response.json();

      if (response.ok && data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      // Don't show error toast for history as it's not critical
    }
  };

  // Load appointment data when opened
  useEffect(() => {
    if (isOpen && appointmentId) {
      setMode("view");
      fetchAppointmentDetails(appointmentId);
      fetchAppointmentHistory(appointmentId);
    } else {
      setAppointment(null);
      setHistory([]);
    }
  }, [isOpen, appointmentId]);

  // Handle appointment update
  const handleUpdate = async (updatedAppointment: AppointmentWithDetails) => {
    setUpdating(true);
    try {
      // Update local state
      setAppointment(updatedAppointment);
      setMode("view");

      // Refresh history after update
      if (appointmentId) {
        await fetchAppointmentHistory(appointmentId);
      }

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedAppointment);
      }

      toast.success("Agendamento atualizado com sucesso");
    } catch (error) {
      console.error("Error handling update:", error);
      toast.error("Erro ao atualizar agendamento");
    } finally {
      setUpdating(false);
    }
  }; // Handle appointment deletion
  const handleDelete = async (reason: string) => {
    if (!appointmentId) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error_message || "Failed to delete appointment");
      }

      // Notify parent component
      if (onDelete) {
        onDelete(appointmentId);
      }

      // Close sidebar
      onClose();

      toast.success("Agendamento cancelado com sucesso");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  // Reset mode when closing
  const handleClose = () => {
    setMode("view");
    onClose();
  };

  if (!isOpen) return null;
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left">
                {mode === "edit" ? "Editar Agendamento" : "Detalhes do Agendamento"}
              </SheetTitle>
              {appointment && (
                <SheetDescription className="text-left">
                  {appointment.patient_name} - {appointment.service_name}
                </SheetDescription>
              )}
            </div>
            <div className="flex gap-2">
              {mode === "view" && appointment && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("edit")}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              {mode === "edit" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("view")}
                  disabled={updating}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        )}{" "}
        {!loading && appointment && (
          <>
            {mode === "view" ? (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <AppointmentDetails appointment={appointment} onDelete={handleDelete} />
                </TabsContent>

                <TabsContent value="history">
                  <AppointmentHistory history={history} isLoading={loading} />
                </TabsContent>
              </Tabs>
            ) : (
              <AppointmentEditForm
                appointment={appointment}
                onUpdate={handleUpdate}
                onCancel={() => setMode("view")}
                isUpdating={updating}
              />
            )}
          </>
        )}
        {!loading && !appointment && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Agendamento não encontrado</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
