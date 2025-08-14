// =====================================================================================
// FOLLOW-UP MANAGEMENT COMPONENT
// Epic 7.3: Component for managing individual follow-ups
// =====================================================================================

"use client";

import {
  useCreateFollowup,
  useDeleteFollowup,
  useFollowups,
  useUpdateFollowup,
} from "@/app/hooks/use-treatment-followups";
import type {
  CommunicationMethod,
  FollowupStatus,
  TreatmentFollowup,
} from "@/app/types/treatment-followups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  EditIcon,
  FilterIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

interface FollowupManagementProps {
  clinicId: string;
}

const STATUS_COLORS: Record<FollowupStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  rescheduled: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<FollowupStatus, string> = {
  pending: "Pendente",
  sent: "Enviado",
  completed: "Concluído",
  failed: "Falhado",
  cancelled: "Cancelado",
  rescheduled: "Reagendado",
};

const CHANNEL_ICONS: Record<CommunicationMethod, any> = {
  whatsapp: MessageSquareIcon,
  sms: PhoneIcon,
  email: MailIcon,
  call: PhoneIcon,
  in_person: CalendarIcon,
};

const CHANNEL_LABELS: Record<CommunicationMethod, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  call: "Ligação",
  in_person: "Presencial",
};

export default function FollowupManagement({
  clinicId,
}: FollowupManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FollowupStatus | "all">(
    "all"
  );
  const [channelFilter, setChannelFilter] = useState<
    CommunicationMethod | "all"
  >("all");
  const [selectedFollowup, setSelectedFollowup] =
    useState<TreatmentFollowup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Use individual hooks instead of combined hook
  const {
    data: followups,
    isLoading,
    error,
  } = useFollowups({ clinic_id: clinicId });

  const createFollowup = useCreateFollowup();
  const updateFollowup = useUpdateFollowup();
  const deleteFollowup = useDeleteFollowup();

  // Filter followups based on search and filters
  const filteredFollowups = ((followups as TreatmentFollowup[]) || []).filter(
    (followup: TreatmentFollowup) => {
      const matchesSearch =
        followup.patient?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        followup.template?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || followup.status === statusFilter;
      const matchesChannel =
        channelFilter === "all" ||
        followup.communication_method === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    }
  );

  if (isLoading) {
    return <FollowupManagementSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar follow-ups: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Follow-ups Ativos</h3>
          <p className="text-sm text-muted-foreground">
            {filteredFollowups.length} follow-ups encontrados
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Follow-up</DialogTitle>
              <DialogDescription>
                Configure um novo follow-up de tratamento para um paciente
              </DialogDescription>
            </DialogHeader>
            {/* TODO: Implement CreateFollowupForm */}
            <div className="py-8 text-center text-gray-500">
              <p>Formulário de criação em desenvolvimento</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente ou tratamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as FollowupStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="responded">Respondido</SelectItem>
                <SelectItem value="failed">Falhado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={channelFilter}
              onValueChange={(value) =>
                setChannelFilter(value as CommunicationMethod | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Ligação</SelectItem>
                <SelectItem value="in_person">Presencial</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setChannelFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFollowups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum follow-up encontrado</p>
              <p className="text-sm">
                Ajuste os filtros ou crie um novo follow-up
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tratamento</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agendado Para</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowups.map((followup: TreatmentFollowup) => {
                  const ChannelIcon =
                    CHANNEL_ICONS[followup.communication_method];

                  return (
                    <TableRow key={followup.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {followup.patient?.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {followup.patient?.phone ||
                              followup.patient?.email ||
                              "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {followup.template?.name || "Follow-up Manual"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tipo: {followup.followup_type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ChannelIcon className="h-4 w-4" />
                          <span>
                            {CHANNEL_LABELS[followup.communication_method]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[followup.status]}>
                          {STATUS_LABELS[followup.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(
                              new Date(followup.scheduled_date),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(followup.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFollowup(followup)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "Tem certeza que deseja excluir este follow-up?"
                                )
                              ) {
                                deleteFollowup.mutate(followup.id);
                              }
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Follow-up Dialog */}
      <Dialog
        open={!!selectedFollowup}
        onOpenChange={() => setSelectedFollowup(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Follow-up</DialogTitle>
            <DialogDescription>
              Modifique as configurações do follow-up selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedFollowup && (
            <div className="py-4">
              {/* TODO: Implement EditFollowupForm */}
              <div className="text-center py-8 text-gray-500">
                <p>Formulário de edição em desenvolvimento</p>
                <p className="text-sm">Follow-up ID: {selectedFollowup.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading skeleton
function FollowupManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
