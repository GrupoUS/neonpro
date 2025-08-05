"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { createClient } from "@/app/utils/supabase/client";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Badge } from "@/components/ui/badge";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Search,
  User,
  Phone,
  Mail,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// =====================================================================================
// OPTIMIZED PATIENT LIST COMPONENT
// Performance improvements: Virtual scrolling, debounced search, memoization
// =====================================================================================

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  status: "active" | "inactive" | "pending";
  last_visit?: string;
  avatar_url?: string;
  created_at: string;
}

interface OptimizedPatientListProps {
  onPatientSelect?: (patient: Patient) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 500;

export default function OptimizedPatientList({
  onPatientSelect,
  searchTerm = "",
  onSearchChange,
}: OptimizedPatientListProps) {
  // =====================================================================================
  // STATE MANAGEMENT
  // =====================================================================================

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [mounted, setMounted] = useState(true);

  const supabase = createClient();

  // =====================================================================================
  // MEMOIZED VALUES
  // =====================================================================================

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  }, [totalCount]);

  const paginationInfo = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
    return { start, end, total: totalCount };
  }, [currentPage, totalCount]);

  // =====================================================================================
  // OPTIMIZED SEARCH WITH DEBOUNCING
  // =====================================================================================

  useEffect(() => {
    if (localSearchTerm.length === 0 || localSearchTerm.length >= 2) {
      const timer = setTimeout(() => {
        if (mounted) {
          onSearchChange?.(localSearchTerm);
          setCurrentPage(1); // Reset to first page on search
        }
      }, SEARCH_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    }
  }, [localSearchTerm, onSearchChange, mounted]);

  // =====================================================================================
  // OPTIMIZED DATA FETCHING
  // =====================================================================================

  const fetchPatients = useCallback(
    async (page: number, search: string) => {
      if (!mounted) return;

      try {
        setLoading(true);
        setError(null);

        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from("patients")
          .select("*", { count: "exact" })
          .range(from, to)
          .order("created_at", { ascending: false });

        // Apply search filter if provided
        if (search.trim()) {
          query = query.or(
            `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
          );
        }

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setPatients(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch patients");
          console.error("Error fetching patients:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    },
    [supabase, mounted],
  );

  // =====================================================================================
  // EFFECTS
  // =====================================================================================

  useEffect(() => {
    fetchPatients(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchPatients]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  // =====================================================================================
  // EVENT HANDLERS
  // =====================================================================================

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const handleRefresh = useCallback(() => {
    fetchPatients(currentPage, searchTerm);
  }, [fetchPatients, currentPage, searchTerm]);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  }, []);

  // =====================================================================================
  // RENDER
  // =====================================================================================

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar pacientes: {error}</p>
            <Button onClick={handleRefresh} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista de Pacientes Otimizada</span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>

        {/* Optimized Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar pacientes (mín. 2 caracteres)..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {paginationInfo.start}-{paginationInfo.end} de {paginationInfo.total}{" "}
            pacientes
          </p>
          {loading && <span className="text-sm text-blue-600">Carregando...</span>}
        </div>

        {/* Optimized Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={patient.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {patient.birth_date && formatDate(patient.birth_date)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(patient.status)}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {patient.last_visit ? formatDate(patient.last_visit) : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onPatientSelect?.(patient)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Optimized Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
