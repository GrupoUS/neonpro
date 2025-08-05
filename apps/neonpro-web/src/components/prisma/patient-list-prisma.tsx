"use client";

import {
  Calendar,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Heart,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

// Types based on our Prisma schema
interface PrismaPatient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  medical_record_number?: string;
  emergency_contact?: string;
  insurance_provider?: string;
  data_consent_given?: boolean;
  data_consent_date?: string;
  created_at: string;
  updated_at: string;
  clinic: {
    id: string;
    name: string;
  };
  created_by_profile: {
    id: string;
    full_name?: string;
  };
  appointments?: Array<{
    id: string;
    scheduled_at: string;
    appointment_type: string;
    status: string;
  }>;
  _count: {
    appointments: number;
    medical_records: number;
    prescriptions: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PrismaPatientListProps {
  clinicId?: string;
  onPatientSelect?: (patient: PrismaPatient) => void;
  showCreateButton?: boolean;
}

export default function PrismaPatientList({
  clinicId,
  onPatientSelect,
  showCreateButton = true,
}: PrismaPatientListProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<PrismaPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<string>(clinicId || "");
  const [pageSize, setPageSize] = useState(10);

  // Fetch patients from our Prisma API
  const fetchPatients = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (search.trim()) params.append("search", search.trim());
      if (selectedClinic) params.append("clinic_id", selectedClinic);

      const response = await fetch(`/api/prisma/patients?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPatients(data.patients || []);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch patients";
      setError(errorMessage);
      toast({
        title: "Error fetching patients",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load and search effect
  useEffect(() => {
    fetchPatients(1, searchTerm);
  }, [selectedClinic, pageSize]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPatients(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchPatients(newPage, searchTerm);
  };

  // Calculate age from birth_date
  const calculateAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Handle patient actions
  const handleViewPatient = (patient: PrismaPatient) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    } else {
      router.push(`/pacientes/${patient.id}`);
    }
  };

  const handleScheduleAppointment = (patient: PrismaPatient) => {
    router.push(`/agenda/novo?patient_id=${patient.id}`);
  };

  const handleEditPatient = (patient: PrismaPatient) => {
    router.push(`/pacientes/${patient.id}/editar`);
  };

  // Render loading state
  if (loading && patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Pacientes (Prisma)
            <Badge variant="secondary">{pagination.total}</Badge>
          </CardTitle>

          {showCreateButton && (
            <Button onClick={() => router.push("/pacientes/novo")} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
            <p className="font-medium">Erro ao carregar pacientes:</p>
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPatients(pagination.page, searchTerm)}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {patients.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Tente ajustar os filtros de busca."
                : "Comece cadastrando seu primeiro paciente."}
            </p>
            {showCreateButton && !searchTerm && (
              <Button onClick={() => router.push("/pacientes/novo")}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Paciente
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Prontuário</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>LGPD</TableHead>
                  <TableHead>Próxima Consulta</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const age = calculateAge(patient.birth_date);
                  const nextAppointment = patient.appointments?.find(
                    (apt) => apt.status === "scheduled" && new Date(apt.scheduled_at) > new Date(),
                  );

                  return (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.full_name}`}
                            />
                            <AvatarFallback>
                              {patient.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{patient.full_name}</p>
                            <p className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {patient.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-[150px]">{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {age !== null ? (
                          <Badge variant="outline">{age} anos</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {patient.medical_record_number ? (
                          <Badge variant="secondary">{patient.medical_record_number}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Não definido</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {patient._count.appointments} consultas
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {patient._count.medical_records} registros
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {patient._count.prescriptions} receitas
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={patient.data_consent_given ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {patient.data_consent_given ? "Consentimento ✓" : "Pendente"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {nextAppointment ? (
                          <div className="text-sm">
                            <p className="font-medium">
                              {formatDate(nextAppointment.scheduled_at)}
                            </p>
                            <p className="text-gray-500 capitalize">
                              {nextAppointment.appointment_type}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Nenhuma</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewPatient(patient)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditPatient(patient)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleScheduleAppointment(patient)}
                              className="gap-2"
                            >
                              <Calendar className="h-4 w-4" />
                              Agendar Consulta
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              Histórico Médico
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} pacientes
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                  >
                    Anterior
                  </Button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                  >
                    Próxima
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
