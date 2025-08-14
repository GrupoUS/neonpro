'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Calendar, 
  Edit, 
  Archive, 
  MoreHorizontal, 
  Phone, 
  Mail,
  FileText,
  AlertTriangle,
  Heart,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import PatientCard from './patient-card';

// Types matching the main page
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
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    profile_completeness_score: number;
    chronic_conditions: string[];
    last_assessment_date: string;
    bmi?: number;
    allergies: string[];
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  patient_photos?: {
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
  }[];
  upcoming_appointments?: number;
  last_visit?: string;
  status: 'active' | 'inactive' | 'vip' | 'new';
}

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  viewMode: 'list' | 'grid';
  selectedPatients: Set<string>;
  onPatientSelect: (patientId: string) => void;
  onSelectAll: (selectAll: boolean) => void;
}

export default function PatientList({
  patients,
  loading,
  viewMode,
  selectedPatients,
  onPatientSelect,
  onSelectAll
}: PatientListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Calculate pagination
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = patients.slice(startIndex, endIndex);

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskLevelBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Baixo</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'vip':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">VIP ⭐</Badge>;
      case 'new':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Novo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePatientAction = (action: string, patientId: string) => {
    console.log(`Action: ${action} for patient: ${patientId}`);
    // Implement specific actions here
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Tente ajustar os filtros ou adicionar um novo paciente
        </p>
        <Button>Adicionar Paciente</Button>
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="space-y-6">
        {/* Grid Header with Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedPatients.size === patients.length && patients.length > 0}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
            />
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({patients.length})
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Patient Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              selected={selectedPatients.has(patient.id)}
              onSelect={() => onPatientSelect(patient.id)}
              onAction={handlePatientAction}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} até {Math.min(endIndex, patients.length)} de {patients.length} pacientes
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Table view (default)
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPatients.size === patients.length && patients.length > 0}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Consultas</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead className="w-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPatients.map((patient) => (
              <TableRow 
                key={patient.id}
                className={selectedPatients.has(patient.id) ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedPatients.has(patient.id)}
                    onCheckedChange={() => onPatientSelect(patient.id)}
                  />
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={patient.raw_user_meta_data.profile_picture} 
                        alt={patient.raw_user_meta_data.full_name}
                      />
                      <AvatarFallback>
                        {patient.raw_user_meta_data.full_name
                          .split(' ')
                          .map(name => name[0])
                          .join('')
                          .toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {patient.raw_user_meta_data.full_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CPF: {formatCPF(patient.raw_user_meta_data.cpf)}
                      </div>
                      {/* Medical Alerts */}
                      {patient.patient_profiles_extended?.chronic_conditions?.length > 0 && (
                        <div className="flex items-center mt-1">
                          <Heart className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-xs text-red-600">
                            {patient.patient_profiles_extended.chronic_conditions[0]}
                          </span>
                        </div>
                      )}
                      {patient.patient_profiles_extended?.allergies?.length > 0 && (
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                          <span className="text-xs text-orange-600">
                            {patient.patient_profiles_extended.allergies[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                      {formatPhone(patient.phone)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {patient.email}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {calculateAge(patient.raw_user_meta_data.date_of_birth)} anos
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {patient.raw_user_meta_data.gender === 'male' ? 'M' : 
                     patient.raw_user_meta_data.gender === 'female' ? 'F' : 'O'}
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusBadge(patient.status)}
                </TableCell>

                <TableCell>
                  {getRiskLevelBadge(patient.patient_profiles_extended?.risk_level)}
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {patient.upcoming_appointments || 0} agendadas
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {patient.last_visit ? formatDate(patient.last_visit) : 'Nunca'}
                  </div>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePatientAction('view', patient.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePatientAction('schedule', patient.id)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar Consulta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePatientAction('edit', patient.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handlePatientAction('archive', patient.id)}
                        className="text-red-600"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Arquivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} até {Math.min(endIndex, patients.length)} de {patients.length} pacientes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}