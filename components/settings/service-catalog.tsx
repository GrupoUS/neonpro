"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Loader2,
  Tag
} from "lucide-react";
import { toast } from "sonner";

const serviceCategories = [
  { value: "facial", label: "Tratamentos Faciais", color: "bg-blue-100 text-blue-800" },
  { value: "corporal", label: "Tratamentos Corporais", color: "bg-green-100 text-green-800" },
  { value: "depilacao", label: "Depilação", color: "bg-purple-100 text-purple-800" },
  { value: "massagem", label: "Massoterapia", color: "bg-yellow-100 text-yellow-800" },
  { value: "estetico", label: "Procedimentos Estéticos", color: "bg-pink-100 text-pink-800" },
  { value: "consulta", label: "Consultas", color: "bg-gray-100 text-gray-800" },
  { value: "manutencao", label: "Manutenção", color: "bg-orange-100 text-orange-800" },
];

const durationOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2h" },
  { value: 150, label: "2h 30min" },
  { value: 180, label: "3h" },
];

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  duration: z.number().min(15, "Duração mínima é 15 minutos"),
  price: z.number().min(0, "Preço deve ser maior que zero"),
  cost: z.number().min(0, "Custo deve ser maior ou igual a zero").optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  requiresSpecialist: z.boolean().default(false),
  allowOnlineBooking: z.boolean().default(true),
  maxAdvanceBookingDays: z.number().min(0).max(365).optional(),
  minAdvanceBookingHours: z.number().min(0).max(168).optional(),
  sessionPackages: z.array(z.object({
    sessions: z.number().min(2),
    discountPercent: z.number().min(0).max(50),
  })).optional(),
  tags: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service extends ServiceFormData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  totalBookings?: number;
  averageRating?: number;
  revenue?: number;
}

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      duration: 60,
      price: 0,
      cost: 0,
      active: true,
      featured: false,
      requiresSpecialist: false,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      sessionPackages: [],
      tags: "",
    },
  });

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/settings/services");
        // const data = await response.json();
        // setServices(data);
        
        // Mock data for demonstration
        setServices([
          {
            id: "1",
            name: "Limpeza de Pele Profunda",
            description: "Limpeza completa com extração e hidratação",
            category: "facial",
            duration: 90,
            price: 150.00,
            cost: 45.00,
            active: true,
            featured: true,
            requiresSpecialist: true,
            allowOnlineBooking: true,
            maxAdvanceBookingDays: 30,
            minAdvanceBookingHours: 24,
            tags: "limpeza, extração, hidratação",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalBookings: 45,
            averageRating: 4.8,
            revenue: 6750.00,
          },
          {
            id: "2",
            name: "Depilação a Laser - Face",
            description: "Remoção de pelos faciais com laser diodo",
            category: "depilacao",
            duration: 30,
            price: 80.00,
            cost: 15.00,
            active: true,
            featured: false,
            requiresSpecialist: true,
            allowOnlineBooking: true,
            maxAdvanceBookingDays: 60,
            minAdvanceBookingHours: 4,
            sessionPackages: [
              { sessions: 6, discountPercent: 15 },
              { sessions: 10, discountPercent: 25 },
            ],
            tags: "depilação, laser, face",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalBookings: 120,
            averageRating: 4.9,
            revenue: 9600.00,
          },
        ]);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Erro ao carregar catálogo de serviços");
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        // Update existing service
        const updatedService: Service = {
          ...editingService,
          ...data,
          updatedAt: new Date(),
        };
        setServices(prev => prev.map(service => 
          service.id === editingService.id ? updatedService : service
        ));
        toast.success("Serviço atualizado com sucesso!");
      } else {
        // Add new service
        const newService: Service = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setServices(prev => [...prev, newService]);
        toast.success("Serviço adicionado com sucesso!");
      }
      
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Erro ao salvar serviço");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      ...service,
      tags: service.tags || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm("Tem certeza que deseja remover este serviço?")) {
      try {
        setServices(prev => prev.filter(service => service.id !== serviceId));
        toast.success("Serviço removido com sucesso!");
      } catch (error) {
        console.error("Erro ao remover serviço:", error);
        toast.error("Erro ao remover serviço");
      }
    }
  };

  const handleToggleActive = async (serviceId: string) => {
    try {
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { 
          ...service, 
          active: !service.active,
          updatedAt: new Date()
        } : service
      ));
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleToggleFeatured = async (serviceId: string) => {
    try {
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { 
          ...service, 
          featured: !service.featured,
          updatedAt: new Date()
        } : service
      ));
      toast.success("Destaque atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar destaque:", error);
      toast.error("Erro ao atualizar destaque");
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (service.tags && service.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || service.category === filterCategory;
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && service.active) ||
                         (filterStatus === "inactive" && !service.active) ||
                         (filterStatus === "featured" && service.featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const calculateProfit = (price: number, cost: number = 0) => {
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return { profit, margin };
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Catálogo de Serviços ({services.length})
          </h2>
          <p className="text-gray-600">
            Gerenciar serviços, preços e configurações
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingService(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Adicionar Serviço"}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do serviço oferecido pela clínica
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Serviço *</FormLabel>
                          <FormControl>
                            <Input placeholder="Limpeza de Pele Profunda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descrição detalhada do serviço..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Máximo 500 caracteres. Descrição exibida aos pacientes.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceCategories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração *</FormLabel>
                            <Select 
                              value={field.value?.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a duração" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {durationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="limpeza, extração, hidratação" {...field} />
                          </FormControl>
                          <FormDescription>
                            Separar tags com vírgulas para facilitar a busca
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Precificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Venda *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="150.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Preço cobrado do paciente (R$)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custo Operacional</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="45.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Custo para realizar o serviço (R$)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Profit calculation display */}
                    {form.watch("price") > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Análise de Lucratividade</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Lucro por Sessão:</span>
                            <div className="font-bold text-green-700">
                              {formatCurrency(calculateProfit(form.watch("price"), form.watch("cost")).profit)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Margem de Lucro:</span>
                            <div className="font-bold text-green-700">
                              {calculateProfit(form.watch("price"), form.watch("cost")).margin.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Serviço Ativo</FormLabel>
                              <FormDescription>
                                Disponível para agendamento
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Serviço em Destaque</FormLabel>
                              <FormDescription>
                                Destacar nas listagens
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiresSpecialist"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Requer Especialista</FormLabel>
                              <FormDescription>
                                Apenas profissionais habilitados
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowOnlineBooking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Agendamento Online</FormLabel>
                              <FormDescription>
                                Permitir agendamento pelo portal
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Booking restrictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxAdvanceBookingDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antecedência Máxima (dias)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="365"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Máximo de dias para agendar (0 = sem limite)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minAdvanceBookingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antecedência Mínima (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="168"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Mínimo de horas para agendar
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingService(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingService ? "Atualizar" : "Adicionar"} Serviço
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="featured">Destaque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
          <CardDescription>
            Lista completa do catálogo de serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center p-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Adicione o primeiro serviço ao catálogo"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => {
                    const category = serviceCategories.find(cat => cat.value === service.category);
                    const { profit, margin } = calculateProfit(service.price, service.cost);

                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{service.name}</span>
                              {service.featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            {service.description && (
                              <div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                                {service.description}
                              </div>
                            )}
                            {service.tags && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {service.tags.split(',').slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category && (
                            <Badge className={category.color}>
                              {category.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDuration(service.duration)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(service.price)}
                          </div>
                          {service.cost && service.cost > 0 && (
                            <div className="text-sm text-gray-600">
                              Custo: {formatCurrency(service.cost)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {formatCurrency(profit)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {margin.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleToggleActive(service.id)}
                              className="flex items-center gap-1 text-sm"
                            >
                              {service.active ? (
                                <>
                                  <Eye className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600">Ativo</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600">Inativo</span>
                                </>
                              )}
                            </button>
                            {service.featured && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {service.totalBookings !== undefined && (
                            <div className="text-sm">
                              <div className="font-medium">
                                {service.totalBookings} agendamentos
                              </div>
                              {service.averageRating && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                                  {service.averageRating.toFixed(1)}
                                </div>
                              )}
                              {service.revenue && (
                                <div className="text-green-600 font-medium">
                                  {formatCurrency(service.revenue)}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(service.id)}
                              className={service.featured ? "text-yellow-600" : ""}
                            >
                              <Star className={`h-4 w-4 ${service.featured ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(service.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}