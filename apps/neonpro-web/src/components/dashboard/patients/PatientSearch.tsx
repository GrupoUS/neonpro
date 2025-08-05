import type { debounce } from "lodash";
import type { Calendar, Clock, Filter, Search, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { getPatientStats, searchPatients } from "@/lib/supabase/patients";
import type { PatientTable } from "./PatientTable";

interface PatientRecord {
  id: number;
  medical_record_number: string;
  fhir_data: {
    name: Array<{ text: string }>;
    gender: string;
    birthDate: string;
    telecom?: Array<{ value: string; system: string }>;
  };
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface PatientStats {
  total_patients: number;
  active_patients: number;
  new_this_month: number;
  avg_age: number;
}

interface SearchFilters {
  query: string;
  status: "all" | "active" | "inactive";
  gender: "all" | "male" | "female" | "other";
  ageRange: "all" | "0-18" | "19-40" | "41-65" | "65+";
  page: number;
  limit: number;
}

export function PatientSearch() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    gender: "all",
    ageRange: "all",
    page: 1,
    limit: 20,
  });

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchFilters: SearchFilters) => {
        setLoading(true);
        try {
          const result = await searchPatients({
            query: searchFilters.query,
            status: searchFilters.status === "all" ? undefined : searchFilters.status,
            gender: searchFilters.gender === "all" ? undefined : searchFilters.gender,
            ageRange: searchFilters.ageRange === "all" ? undefined : searchFilters.ageRange,
            page: searchFilters.page,
            limit: searchFilters.limit,
          });

          if (result.success && result.data) {
            setPatients(result.data.patients);
            setTotalCount(result.data.total);
          }
        } catch (error) {
          console.error("Error searching patients:", error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [],
  );

  // Load patient statistics
  useEffect(() => {
    const loadStats = async () => {
      const result = await getPatientStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    };
    loadStats();
  }, []);

  // Trigger search when filters change
  useEffect(() => {
    debouncedSearch(filters);
    return () => {
      debouncedSearch.cancel();
    };
  }, [filters, debouncedSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when other filters change
    }));
  };

  const handlePageChange = (page: number) => {
    handleFilterChange("page", page);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const formatPhoneNumber = (telecom?: Array<{ value: string; system: string }>): string => {
    const phone = telecom?.find((t) => t.system === "phone");
    if (!phone) return "N/A";

    const digits = phone.value.replace(/\D/g, "");
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return phone.value;
  };

  const getGenderLabel = (gender: string): string => {
    const labels = {
      male: "Masculino",
      female: "Feminino",
      other: "Outro",
      unknown: "Não informado",
    };
    return labels[gender as keyof typeof labels] || "Não informado";
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Ativo
        </Badge>
      );
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  // Prepare table data
  const tableData = patients.map((patient) => ({
    id: patient.id,
    medical_record_number: patient.medical_record_number,
    name: patient.fhir_data.name[0]?.text || "Nome não informado",
    age: calculateAge(patient.fhir_data.birthDate),
    gender: getGenderLabel(patient.fhir_data.gender),
    phone: formatPhoneNumber(patient.fhir_data.telecom),
    status: getStatusBadge(patient.status),
    created_at: new Date(patient.created_at).toLocaleDateString("pt-BR"),
    actions: patient.id,
  }));

  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patients}</div>
              <p className="text-xs text-muted-foreground">{stats.active_patients} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_this_month}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados em {new Date().toLocaleDateString("pt-BR", { month: "long" })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Idade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avg_age)} anos</div>
              <p className="text-xs text-muted-foreground">Média geral dos pacientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.active_patients / stats.total_patients) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Pacientes ativos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
          <CardDescription>
            Encontre pacientes por nome, CPF, telefone ou número do prontuário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone ou prontuário..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gênero</label>
              <Select
                value={filters.gender}
                onValueChange={(value) => handleFilterChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa Etária</label>
              <Select
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange("ageRange", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="0-18">0-18 anos</SelectItem>
                  <SelectItem value="19-40">19-40 anos</SelectItem>
                  <SelectItem value="41-65">41-65 anos</SelectItem>
                  <SelectItem value="65+">65+ anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{loading ? "Carregando..." : `${totalCount} paciente(s) encontrado(s)`}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  query: "",
                  status: "all",
                  gender: "all",
                  ageRange: "all",
                  page: 1,
                  limit: 20,
                })
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <PatientTable
        data={tableData}
        loading={loading}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
