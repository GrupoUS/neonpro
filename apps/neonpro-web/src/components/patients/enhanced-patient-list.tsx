"use client";

import type {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  Grid,
  Heart,
  List,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Upload,
  User,
  UserPlus,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { toast } from "sonner";
import type { createClient } from "@/app/utils/supabase/client";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
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

interface Patient {
  id: string;
  email: string;
  phone: string;
  created_at: string;
  raw_user_meta_data: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    cpf?: string;
    profile_picture?: string;
  };
  patient_profiles_extended?: {
    risk_level: "low" | "medium" | "high" | "critical";
    risk_score: number;
    profile_completeness_score: number;
    chronic_conditions: string[];
    last_assessment_date: string;
    bmi?: number;
    allergies: string[];
  };
  patient_photos?: {
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
  }[];
  upcoming_appointments?: number;
  last_visit?: string;
}

interface EnhancedPatientListProps {
  onPatientSelect?: (patient: Patient) => void;
  onPatientCreate?: () => void;
  compact?: boolean;
}

export default function EnhancedPatientList({
  onPatientSelect,
  onPatientCreate,
  compact = false,
}: EnhancedPatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "phone" | "email" | "cpf">("name");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");

  // View and pagination states
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(compact ? 5 : 10);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());

  // Sort state
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const supabase = createClient();

  // Load patients from Supabase
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: patientsData, error: patientsError } = await supabase
        .from("profiles")
        .select(`
          *,
          patient_profiles_extended(*),
          patient_photos!inner(photo_url, photo_type, is_primary)
        `)
        .eq("role", "patient")
        .order("created_at", { ascending: false });

      if (patientsError) throw patientsError;

      // Get upcoming appointments count for each patient
      const patientsWithAppointments = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { count } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patient.id)
            .gte("appointment_date", new Date().toISOString())
            .limit(5);

          const { data: lastVisitData } = await supabase
            .from("medical_timeline")
            .select("event_date")
            .eq("patient_id", patient.id)
            .eq("event_type", "appointment")
            .order("event_date", { ascending: false })
            .limit(1)
            .single();

          return {
            ...patient,
            upcoming_appointments: count || 0,
            last_visit: lastVisitData?.event_date || null,
          };
        }),
      );

      setPatients(patientsWithAppointments);
      setFilteredPatients(patientsWithAppointments);

      toast.success(`${patientsWithAppointments.length} pacientes carregados`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar pacientes";
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      console.error("Load patients error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Filter and search patients
  useEffect(() => {
    let filtered = [...patients];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((patient) => {
        const query = searchQuery.toLowerCase();
        switch (searchType) {
          case "name":
            return patient.raw_user_meta_data?.full_name?.toLowerCase().includes(query);
          case "phone":
            return patient.phone?.toLowerCase().includes(query);
          case "email":
            return patient.email?.toLowerCase().includes(query);
          case "cpf":
            return patient.raw_user_meta_data?.cpf?.toLowerCase().includes(query);
          default:
            return false;
        }
      });
    }

    // Apply risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter(
        (patient) => patient.patient_profiles_extended?.risk_level === riskFilter,
      );
    }

    // Apply age range filter
    if (ageRangeFilter !== "all") {
      filtered = filtered.filter((patient) => {
        if (!patient.raw_user_meta_data?.date_of_birth) return false;

        const age = calculateAge(patient.raw_user_meta_data.date_of_birth);
        switch (ageRangeFilter) {
          case "child":
            return age < 18;
          case "adult":
            return age >= 18 && age < 65;
          case "senior":
            return age >= 65;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => {
        const lastVisit = patient.last_visit;
        const daysSinceLastVisit = lastVisit
          ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
          : 9999;

        switch (statusFilter) {
          case "active":
            return daysSinceLastVisit <= 30;
          case "inactive":
            return daysSinceLastVisit > 90;
          case "new":
            return daysSinceLastVisit <= 7;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.raw_user_meta_data?.full_name || "";
          bValue = b.raw_user_meta_data?.full_name || "";
          break;
        case "risk_score":
          aValue = a.patient_profiles_extended?.risk_score || 0;
          bValue = b.patient_profiles_extended?.risk_score || 0;
          break;
        case "completeness":
          aValue = a.patient_profiles_extended?.profile_completeness_score || 0;
          bValue = b.patient_profiles_extended?.profile_completeness_score || 0;
          break;
        case "last_visit":
          aValue = a.last_visit ? new Date(a.last_visit).getTime() : 0;
          bValue = b.last_visit ? new Date(b.last_visit).getTime() : 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [
    patients,
    searchQuery,
    searchType,
    riskFilter,
    statusFilter,
    ageRangeFilter,
    sortField,
    sortDirection,
  ]);

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Real-time subscriptions for patient updates
  useEffect(() => {
    const channel = supabase
      .channel("patients-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        console.log("Patient change received!", payload);
        loadPatients(); // Reload patients on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadPatients]);

  // Utility functions
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (patient: Patient) => {
    const lastVisit = patient.last_visit;
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 9999;

    if (daysSinceLastVisit <= 7) {
      return <Badge variant="default">Novo</Badge>;
    } else if (daysSinceLastVisit <= 30) {
      return <Badge variant="secondary">Ativo</Badge>;
    } else if (daysSinceLastVisit <= 90) {
      return <Badge variant="outline">Regular</Badge>;
    } else {
      return <Badge variant="destructive">Inativo</Badge>;
    }
  };

  const handlePatientSelection = (patientId: string, selected: boolean) => {
    const newSelection = new Set(selectedPatients);
    if (selected) {
      newSelection.add(patientId);
    } else {
      newSelection.delete(patientId);
    }
    setSelectedPatients(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const pagePatients = getCurrentPagePatients();
      setSelectedPatients(new Set(pagePatients.map((p) => p.id)));
    } else {
      setSelectedPatients(new Set());
    }
  };

  const getCurrentPagePatients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPatients.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  // Render functions
  const renderTableView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  getCurrentPagePatients().length > 0 &&
                  getCurrentPagePatients().every((p) => selectedPatients.has(p.id))
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (sortField === "name") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField("name");
                  setSortDirection("asc");
                }
              }}
            >
              Paciente
            </TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (sortField === "risk_score") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField("risk_score");
                  setSortDirection("desc");
                }
              }}
            >
              Risco
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (sortField === "completeness") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField("completeness");
                  setSortDirection("desc");
                }
              }}
            >
              Perfil
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (sortField === "last_visit") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField("last_visit");
                  setSortDirection("desc");
                }
              }}
            >
              Último Atendimento
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPagePatients().map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onPatientSelect?.(patient)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedPatients.has(patient.id)}
                  onCheckedChange={(checked) =>
                    handlePatientSelection(patient.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        patient.raw_user_meta_data?.profile_picture ||
                        patient.patient_photos?.find((p) => p.is_primary)?.photo_url
                      }
                    />
                    <AvatarFallback>
                      {patient.raw_user_meta_data?.full_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {patient.raw_user_meta_data?.full_name || "Nome não informado"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {patient.raw_user_meta_data?.date_of_birth
                        ? `${calculateAge(patient.raw_user_meta_data.date_of_birth)} anos`
                        : "Idade não informada"}
                      {patient.raw_user_meta_data?.gender &&
                        ` • ${patient.raw_user_meta_data.gender}`}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {patient.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {patient.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(patient)}
                  {patient.upcoming_appointments > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {patient.upcoming_appointments} agendados
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {patient.patient_profiles_extended?.risk_level && (
                  <Badge
                    className={getRiskColor(patient.patient_profiles_extended.risk_level)}
                    variant="outline"
                  >
                    {patient.patient_profiles_extended.risk_level === "low" && "Baixo"}
                    {patient.patient_profiles_extended.risk_level === "medium" && "Médio"}
                    {patient.patient_profiles_extended.risk_level === "high" && "Alto"}
                    {patient.patient_profiles_extended.risk_level === "critical" && "Crítico"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {patient.patient_profiles_extended?.profile_completeness_score && (
                  <div className="flex items-center gap-2">
                    <Progress
                      value={patient.patient_profiles_extended.profile_completeness_score * 100}
                      className="w-16"
                    />
                    <span className="text-sm">
                      {Math.round(
                        patient.patient_profiles_extended.profile_completeness_score * 100,
                      )}
                      %
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {patient.last_visit ? (
                  <div className="text-sm">
                    {new Date(patient.last_visit).toLocaleDateString("pt-BR")}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Nunca</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onPatientSelect?.(patient)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Consulta
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className={compact ? "" : "h-full"}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription>
              {filteredPatients.length} de {patients.length} pacientes
              {selectedPatients.size > 0 && ` • ${selectedPatients.size} selecionados`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onPatientCreate && (
              <Button onClick={onPatientCreate} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={loadPatients} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="search"
                placeholder={`Buscar por ${searchType === "name" ? "nome" : searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="risk-filter">Nível de Risco</Label>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger id="risk-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="age-filter">Faixa Etária</Label>
            <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
              <SelectTrigger id="age-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="child">Criança (&lt;18)</SelectItem>
                <SelectItem value="adult">Adulto (18-64)</SelectItem>
                <SelectItem value="senior">Idoso (65+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando pacientes...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum paciente encontrado</p>
            <p className="text-sm">Ajuste os filtros ou cadastre um novo paciente</p>
          </div>
        ) : (
          <>
            {viewMode === "table" && renderTableView()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {filteredPatients.length} pacientes
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
