"use client";

import type { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Calendar,
  Clock,
  FileText,
  Filter,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  User,
  Video,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface CommunicationLog {
  id: string;
  vendor_id: string;
  vendor_name: string;
  user_id: string;
  user_name: string;
  communication_type: "email" | "phone" | "meeting" | "video_call" | "message" | "document";
  subject: string;
  content: string;
  status: "pending" | "completed" | "follow_up_required";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  due_date?: string;
  attachments?: string[];
  follow_up_date?: string;
}

const communicationTypes = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "phone", label: "Telefone", icon: Phone },
  { value: "meeting", label: "Reunião", icon: Calendar },
  { value: "video_call", label: "Video Chamada", icon: Video },
  { value: "message", label: "Mensagem", icon: MessageCircle },
  { value: "document", label: "Documento", icon: FileText },
];

const statusOptions = [
  {
    value: "pending",
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "completed",
    label: "Concluída",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "follow_up_required",
    label: "Requer Acompanhamento",
    color: "bg-blue-100 text-blue-800",
  },
];

const priorityOptions = [
  { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-800" },
];

interface CommunicationLogProps {
  vendorId?: string;
  vendorName?: string;
}

export default function CommunicationLog({ vendorId, vendorName }: CommunicationLogProps) {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLogDialog, setShowNewLogDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New log form state
  const [newLog, setNewLog] = useState({
    vendor_id: vendorId || "",
    communication_type: "email",
    subject: "",
    content: "",
    priority: "normal",
    status: "pending",
    due_date: "",
    follow_up_date: "",
  });

  // Mock data - In real implementation, this would come from API
  const mockLogs: CommunicationLog[] = [
    {
      id: "1",
      vendor_id: vendorId || "vendor1",
      vendor_name: vendorName || "Fornecedor Exemplo",
      user_id: "user1",
      user_name: "João Silva",
      communication_type: "email",
      subject: "Confirmação de pedido #001",
      content: "Enviado e-mail solicitando confirmação do pedido e prazo de entrega.",
      status: "completed",
      priority: "normal",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      vendor_id: vendorId || "vendor1",
      vendor_name: vendorName || "Fornecedor Exemplo",
      user_id: "user2",
      user_name: "Maria Santos",
      communication_type: "phone",
      subject: "Negociação de preços",
      content: "Ligação para discussão dos novos preços para o contrato de 2024.",
      status: "follow_up_required",
      priority: "high",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      vendor_id: vendorId || "vendor1",
      vendor_name: vendorName || "Fornecedor Exemplo",
      user_id: "user1",
      user_name: "João Silva",
      communication_type: "meeting",
      subject: "Reunião de alinhamento Q1",
      content: "Reunião presencial para alinhamento das metas do primeiro trimestre.",
      status: "pending",
      priority: "normal",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((log) => log.communication_type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, typeFilter, statusFilter]);

  const handleNewLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newLogEntry: CommunicationLog = {
        id: Date.now().toString(),
        ...newLog,
        communication_type: newLog.communication_type as
          | "email"
          | "phone"
          | "meeting"
          | "video_call"
          | "message"
          | "document",
        status: newLog.status as "pending" | "completed" | "follow_up_required",
        priority: newLog.priority as "low" | "normal" | "high" | "urgent",
        vendor_name: vendorName || "Fornecedor",
        user_id: "current_user",
        user_name: "Usuário Atual",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLogs((prev) => [newLogEntry, ...prev]);
      setShowNewLogDialog(false);
      setNewLog({
        vendor_id: vendorId || "",
        communication_type: "email",
        subject: "",
        content: "",
        priority: "normal",
        status: "pending",
        due_date: "",
        follow_up_date: "",
      });

      toast.success("Log de comunicação adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar log de comunicação");
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = communicationTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.icon : MessageCircle;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return statusConfig || statusOptions[0];
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorityOptions.find((p) => p.value === priority);
    return priorityConfig || priorityOptions[0];
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Log de Comunicação</h3>
          <p className="text-sm text-muted-foreground">
            {vendorName ? `Comunicações com ${vendorName}` : "Todas as comunicações"}
          </p>
        </div>

        <Button onClick={() => setShowNewLogDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunicação
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunicações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {communicationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ações</Label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Logs */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma comunicação encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const IconComponent = getTypeIcon(log.communication_type);
            const statusBadge = getStatusBadge(log.status);
            const priorityBadge = getPriorityBadge(log.priority);

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{log.subject}</h4>
                            <Badge className={`text-xs ${statusBadge.color}`}>
                              {statusBadge.label}
                            </Badge>
                            <Badge className={`text-xs ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {log.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(log.created_at)}
                            </div>
                            {log.due_date && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <Calendar className="h-3 w-3" />
                                Vence: {new Date(log.due_date).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                            {log.follow_up_date && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Calendar className="h-3 w-3" />
                                Follow-up:{" "}
                                {new Date(log.follow_up_date).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {log.user_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* New Communication Dialog */}
      <Dialog open={showNewLogDialog} onOpenChange={setShowNewLogDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Comunicação</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleNewLogSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communication_type">Tipo de Comunicação</Label>
                <Select
                  value={newLog.communication_type}
                  onValueChange={(value) =>
                    setNewLog((prev) => ({
                      ...prev,
                      communication_type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {communicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newLog.priority}
                  onValueChange={(value) => setNewLog((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={newLog.subject}
                onChange={(e) => setNewLog((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto da comunicação"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={newLog.content}
                onChange={(e) => setNewLog((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Descreva o conteúdo da comunicação..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento (opcional)</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={newLog.due_date}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow_up_date">Data de Follow-up (opcional)</Label>
                <Input
                  id="follow_up_date"
                  type="datetime-local"
                  value={newLog.follow_up_date}
                  onChange={(e) =>
                    setNewLog((prev) => ({
                      ...prev,
                      follow_up_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewLogDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNewLogSubmit}>Salvar Comunicação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
