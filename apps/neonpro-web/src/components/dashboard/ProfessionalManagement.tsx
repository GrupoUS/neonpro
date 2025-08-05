"use client";

import type {
  AlertTriangle,
  Award,
  Calendar,
  Certificate,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { toast } from "sonner";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  createProfessional,
  deleteProfessional,
  getProfessionalCredentials,
  getProfessionalServices,
  getProfessionals,
  updateProfessional,
  verifyCredential,
} from "@/lib/supabase/professionals";
import type {
  Professional,
  ProfessionalCredential,
  ProfessionalService,
  ProfessionalSpecialty,
} from "@/lib/types/professional";

interface ProfessionalManagementProps {
  initialProfessionals?: Professional[];
}

interface ProfessionalStats {
  total: number;
  active: number;
  pending_verification: number;
  credentialsExpiringSoon: number;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    case "pending_verification":
      return "outline";
    default:
      return "secondary";
  }
};

const getCredentialStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "expired":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export default function ProfessionalManagement({
  initialProfessionals = [],
}: ProfessionalManagementProps) {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [filteredProfessionals, setFilteredProfessionals] =
    useState<Professional[]>(initialProfessionals);
  const [stats, setStats] = useState<ProfessionalStats>({
    total: 0,
    active: 0,
    pending_verification: 0,
    credentialsExpiringSoon: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [credentials, setCredentials] = useState<ProfessionalCredential[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchTerm, statusFilter, specialtyFilter]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const data = await getProfessionals();
      setProfessionals(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast.error("Erro ao carregar profissionais");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (professionalsData: Professional[]) => {
    const total = professionalsData.length;
    const active = professionalsData.filter((p) => p.status === "active").length;
    const pending_verification = professionalsData.filter(
      (p) => p.status === "pending_verification",
    ).length;

    // Calculate credentials expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let credentialsExpiringSoon = 0;
    professionalsData.forEach((professional) => {
      // This would need to be calculated from actual credential data
      // For now, using a placeholder calculation
      credentialsExpiringSoon += Math.floor(Math.random() * 2); // Placeholder
    });

    setStats({
      total,
      active,
      pending_verification,
      credentialsExpiringSoon,
    });
  };

  const filterProfessionals = () => {
    let filtered = professionals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (professional) =>
          professional.given_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professional.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professional.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professional.license_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((professional) => professional.status === statusFilter);
    }

    // Specialty filter (would need to join with professional_specialties)
    if (specialtyFilter !== "all") {
      // This would need to be implemented with proper data relationships
      // For now, keeping all results
    }

    setFilteredProfessionals(filtered);
  };

  const handleViewDetails = async (professional: Professional) => {
    try {
      setSelectedProfessional(professional);
      setLoading(true);

      // Load professional credentials and services
      const [credentialsData, servicesData] = await Promise.all([
        getProfessionalCredentials(professional.id),
        getProfessionalServices(professional.id),
      ]);

      setCredentials(credentialsData);
      setServices(servicesData);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error loading professional details:", error);
      toast.error("Erro ao carregar detalhes do profissional");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (professional: Professional) => {
    // Navigate to edit form
    router.push(`/dashboard/professionals/${professional.id}/edit`);
  };

  const handleDelete = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!professionalToDelete) return;

    try {
      setLoading(true);
      await deleteProfessional(professionalToDelete.id);
      setProfessionals((prev) => prev.filter((p) => p.id !== professionalToDelete.id));
      toast.success("Profissional removido com sucesso");
      setShowDeleteDialog(false);
      setProfessionalToDelete(null);
    } catch (error) {
      console.error("Error deleting professional:", error);
      toast.error("Erro ao remover profissional");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCredential = async (credentialId: string) => {
    try {
      setLoading(true);
      await verifyCredential(credentialId);

      // Reload credentials
      if (selectedProfessional) {
        const updatedCredentials = await getProfessionalCredentials(selectedProfessional.id);
        setCredentials(updatedCredentials);
      }

      toast.success("Credencial verificada com sucesso");
    } catch (error) {
      console.error("Error verifying credential:", error);
      toast.error("Erro ao verificar credencial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Profissionais</h2>
          <p className="text-muted-foreground">
            Gerencie perfis profissionais, credenciais e especialidades
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/professionals/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Cadastrar Profissional
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Atualmente em atividade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente Verificação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_verification}</div>
            <p className="text-xs text-muted-foreground">Aguardando verificação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credenciais Expirando</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.credentialsExpiringSoon}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar profissionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="pending_verification">Pendente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Especialidades</SelectItem>
                  <SelectItem value="dermatology">Dermatologia</SelectItem>
                  <SelectItem value="plastic_surgery">Cirurgia Plástica</SelectItem>
                  <SelectItem value="aesthetics">Estética</SelectItem>
                  <SelectItem value="cosmetology">Cosmetologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professionals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Credenciais</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Últimas Atividades</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando profissionais...
                  </TableCell>
                </TableRow>
              ) : filteredProfessionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum profissional encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfessionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {professional.given_name[0]}
                          {professional.family_name[0]}
                        </div>
                        <div>
                          <div className="font-medium">
                            {professional.given_name} {professional.family_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{professional.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {/* This would come from joined specialty data */}
                        <Badge variant="outline">Estética</Badge>
                        <Badge variant="outline">Dermatologia</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Certificate className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">3 credenciais</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(professional.status)}>
                        {professional.status === "active" && "Ativo"}
                        {professional.status === "inactive" && "Inativo"}
                        {professional.status === "suspended" && "Suspenso"}
                        {professional.status === "pending_verification" && "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {professional.updated_at
                          ? new Date(professional.updated_at).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(professional)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(professional)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(professional)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Professional Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Profissional</DialogTitle>
            <DialogDescription>
              Informações completas sobre {selectedProfessional?.given_name}{" "}
              {selectedProfessional?.family_name}
            </DialogDescription>
          </DialogHeader>

          {selectedProfessional && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="credentials">Credenciais</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações Pessoais</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Nome:</strong> {selectedProfessional.given_name}{" "}
                        {selectedProfessional.family_name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedProfessional.email}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {selectedProfessional.phone_number || "N/A"}
                      </div>
                      <div>
                        <strong>Data de Nascimento:</strong>{" "}
                        {selectedProfessional.birth_date || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Informações Profissionais</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Licença:</strong> {selectedProfessional.license_number || "N/A"}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          className="ml-2"
                          variant={getStatusBadgeVariant(selectedProfessional.status)}
                        >
                          {selectedProfessional.status}
                        </Badge>
                      </div>
                      <div>
                        <strong>Cadastrado em:</strong>{" "}
                        {new Date(selectedProfessional.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Credenciais e Certificações</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Credencial
                  </Button>
                </div>
                <div className="space-y-3">
                  {credentials.map((credential) => (
                    <Card key={credential.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCredentialStatusIcon(credential.verification_status)}
                            <div>
                              <div className="font-medium">{credential.credential_type}</div>
                              <div className="text-sm text-muted-foreground">
                                Número: {credential.credential_number}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Validade:{" "}
                                {credential.expiry_date
                                  ? new Date(credential.expiry_date).toLocaleDateString("pt-BR")
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                credential.verification_status === "verified"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {credential.verification_status}
                            </Badge>
                            {credential.verification_status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyCredential(credential.id)}
                              >
                                Verificar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Serviços Oferecidos</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Serviço
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{service.service_name}</div>
                          <Badge variant="outline">{service.service_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {service.description}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Duração: {service.duration_minutes}min</span>
                          <span className="font-medium">
                            R$ {service.base_price?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <h4 className="font-medium">Métricas de Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm text-muted-foreground">Satisfação do Paciente</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">142</div>
                      <div className="text-sm text-muted-foreground">Consultas no Mês</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">4.8</div>
                      <div className="text-sm text-muted-foreground">Avaliação Média</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
            {selectedProfessional && (
              <Button onClick={() => handleEdit(selectedProfessional)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Profissional
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o profissional {professionalToDelete?.given_name}{" "}
              {professionalToDelete?.family_name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
