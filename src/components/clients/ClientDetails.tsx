
import React, { useEffect, useState } from "react";
import { Client } from "@/types/database";
import { supabase } from "../../lib/supabase";
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

// Interface simplificada para agendamentos do cliente
interface ClientAppointment {
  id: string;
  data_hora: string;
  duracao: number;
  status: string;
  observacoes?: string;
  servico_id?: string;
  profissional_id?: string;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onEdit }) => {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientAppointments();
  }, []);

  const fetchClientAppointments = async () => {
    try {
      setIsLoading(true);
      // Buscar agendamentos usando a tabela 'agendamentos' que existe no schema
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("paciente_id", client.id)
        .order("data_hora", { ascending: false });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return;
      }
      
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
      agendado: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
      confirmado: { label: "Confirmado", className: "bg-green-100 text-green-800" },
      concluido: { label: "Concluído", className: "bg-indigo-100 text-indigo-800" },
      cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800" },
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
                          <span className="font-medium">{formatDateTime(appointment.data_hora)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Duração: {appointment.duracao || 60} minutos</span>
                        </div>
                      </div>
                      
                      <div>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(appointment.status).className}`}
                        >
                          {getStatusLabel(appointment.status).label}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.observacoes && (
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="text-gray-500">Observações:</p>
                        <p>{appointment.observacoes}</p>
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
