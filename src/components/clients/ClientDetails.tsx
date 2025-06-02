
import React, { useEffect, useState } from "react";
import { Client, Appointment } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onEdit }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientAppointments();
  }, []);

  const fetchClientAppointments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services(*),
          professional:professionals(*)
        `)
        .eq("client_id", client.id)
        .order("start_time", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Erro ao buscar agendamentos do cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "-";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "-";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, { label: string; className: string }> = {
      scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
      confirmed: { label: "Confirmado", className: "bg-green-100 text-green-800" },
      completed: { label: "Concluído", className: "bg-indigo-100 text-indigo-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
      no_show: { label: "Não Compareceu", className: "bg-orange-100 text-orange-800" },
    };

    return statusLabels[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <span className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {client.full_name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{client.email || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{client.phone || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Instagram</p>
                <p className="font-medium">{client.instagram_handle || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">{client.birthdate ? formatDate(client.birthdate) : "-"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Observações</p>
              <p className="font-medium whitespace-pre-line">{client.notes || "-"}</p>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-md p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">{formatDateTime(appointment.start_time)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Duração: {appointment.service?.duration_minutes} minutos</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Serviço: </span>
                          {appointment.service?.name}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Profissional: </span>
                          {appointment.professional?.full_name}
                        </div>
                      </div>
                      
                      <div>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(appointment.status).className}`}
                        >
                          {getStatusLabel(appointment.status).label}
                        </span>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Valor: </span>
                          R$ {appointment.price_at_booking.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="text-gray-500">Observações:</p>
                        <p>{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Este cliente ainda não possui agendamentos.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onEdit}>
            Editar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
