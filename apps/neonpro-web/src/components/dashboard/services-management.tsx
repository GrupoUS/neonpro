"use client";

import type { Clock, DollarSign, Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
import type {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { Textarea } from "@/components/ui/textarea";
import type { useBilling } from "@/hooks/use-billing";
import type { CreateServiceData, SERVICE_TYPES, Service, ServiceFilters } from "@/types/billing";

interface ServiceFormData {
  name: string;
  description: string;
  type: string;
  base_price: string;
  duration_minutes: string;
  category: string;
  requires_appointment: boolean;
  max_sessions: string;
}

export function ServicesManagement() {
  const { loading, services, fetchServices, createService, updateService, deleteService } =
    useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    type: "consultation",
    base_price: "",
    duration_minutes: "60",
    category: "",
    requires_appointment: true,
    max_sessions: "",
  });

  // Load services on component mount
  useEffect(() => {
    fetchServices(filters);
  }, [fetchServices, filters]);

  // Filter services based on search term
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "consultation",
      base_price: "",
      duration_minutes: "60",
      category: "",
      requires_appointment: true,
      max_sessions: "",
    });
    setEditingService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      type: service.type,
      base_price: service.base_price.toString(),
      duration_minutes: service.duration_minutes?.toString() || "60",
      category: service.category || "",
      requires_appointment: service.requires_appointment,
      max_sessions: service.max_sessions?.toString() || "",
    });
    setEditingService(service);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }

    if (!formData.base_price || parseFloat(formData.base_price) < 0) {
      toast.error("Preço base deve ser maior que zero");
      return;
    }

    const serviceData: CreateServiceData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type as any,
      base_price: parseFloat(formData.base_price),
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      category: formData.category.trim() || undefined,
      requires_appointment: formData.requires_appointment,
      max_sessions: formData.max_sessions ? parseInt(formData.max_sessions) : undefined,
    };

    let success = false;
    if (editingService) {
      success = (await updateService(editingService.id, serviceData)) !== null;
    } else {
      success = (await createService(serviceData)) !== null;
    }

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (service: Service) => {
    await deleteService(service.id);
  };

  const getServiceTypeLabel = (type: string) => {
    const serviceType = SERVICE_TYPES.find((t) => t.value === type);
    return serviceType?.label || type;
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "procedure":
        return "bg-purple-100 text-purple-800";
      case "package":
        return "bg-orange-100 text-orange-800";
      case "maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
          <p className="text-muted-foreground">Configure os serviços oferecidos pela clínica</p>
        </div>

        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.type?.[0] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: value === "all" ? undefined : [value as any],
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.is_active === undefined ? "all" : filters.is_active.toString()}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_active: value === "all" ? undefined : value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro serviço"}
            </p>
            {!searchTerm && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Serviço
              </Button>
            )}
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.category && <CardDescription>{service.category}</CardDescription>}
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Serviço</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o serviço "{service.name}"? Esta ação não
                            pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(service)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge className={getServiceTypeColor(service.type)}>
                    {getServiceTypeLabel(service.type)}
                  </Badge>

                  {!service.is_active && <Badge variant="secondary">Inativo</Badge>}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">R$ {service.base_price.toFixed(2)}</span>
                  </div>

                  {service.duration_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{service.duration_minutes}min</span>
                    </div>
                  )}
                </div>

                {service.max_sessions && (
                  <div className="text-sm text-muted-foreground">
                    Máximo de {service.max_sessions} sessões
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>
              {editingService
                ? "Altere as informações do serviço abaixo"
                : "Preencha as informações do novo serviço"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Consulta Dermatológica"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Serviço *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descreva o serviço oferecido..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Preço Base (R$) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      base_price: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duração (min)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_minutes: e.target.value,
                    }))
                  }
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_sessions">Máx. Sessões</Label>
                <Input
                  id="max_sessions"
                  type="number"
                  min="1"
                  value={formData.max_sessions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_sessions: e.target.value,
                    }))
                  }
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Dermatologia, Estética"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires_appointment"
                checked={formData.requires_appointment}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    requires_appointment: checked,
                  }))
                }
              />
              <Label htmlFor="requires_appointment">Requer agendamento</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {editingService ? "Atualizar" : "Criar"} Serviço
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
