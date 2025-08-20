'use client';

import {
  Calendar,
  Edit,
  Eye,
  Filter,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePatients } from '@/hooks/use-patients';

interface PatientFilters {
  searchTerm: string;
  status: 'all' | 'active' | 'inactive';
}

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>({
    searchTerm: '',
    status: 'all',
  });

  // Use the API hook to fetch patients
  const { data: patients = [], isLoading, error, refetch } = usePatients();

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      patient.phone.includes(filters.searchTerm);

    const matchesStatus =
      filters.status === 'all' || patient.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Carregando pacientes...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Search className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                Erro ao carregar pacientes
              </h3>
              <p className="mb-6 text-gray-500">
                Ocorreu um erro ao buscar os dados dos pacientes.
              </p>
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Pacientes</h1>
            <p className="text-gray-600">
              Gerencie os pacientes da sua clínica
            </p>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Link className="flex items-center space-x-2" href="/patients/new">
              <Plus className="h-4 w-4" />
              <span>Novo Paciente</span>
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                  <Input
                    className="pl-10"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    placeholder="Buscar por nome, email ou telefone..."
                    value={filters.searchTerm}
                  />
                </div>
              </div>

              <div className="sm:w-48">
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  value={filters.status}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-2">
                  <div className="h-6 w-6 rounded bg-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">Total</p>
                  <p className="font-bold text-2xl text-gray-900">
                    {patients.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-green-100 p-2">
                  <div className="h-6 w-6 rounded bg-green-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">Ativos</p>
                  <p className="font-bold text-2xl text-gray-900">
                    {patients.filter((p) => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <div className="h-6 w-6 rounded bg-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">Este Mês</p>
                  <p className="font-bold text-2xl text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-100 p-2">
                  <div className="h-6 w-6 rounded bg-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">
                    Receita Total
                  </p>
                  <p className="font-bold text-2xl text-gray-900">
                    {/* TODO: Calculate from appointment data when available */}
                    R$ 0,00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients.length} paciente(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data de Nascimento</TableHead>
                    <TableHead>Gênero</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-gray-500 text-sm">
                            CPF: {patient.cpf}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {patient.email}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-900 text-sm">
                          {formatDate(patient.birth_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-900 text-sm">
                          {patient.gender === 'M'
                            ? 'Masculino'
                            : patient.gender === 'F'
                              ? 'Feminino'
                              : 'Outro'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadge(patient.status)}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/patients/${patient.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/patients/${patient.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="ghost">
                            <Link
                              href={`/appointments/new?patient=${patient.id}`}
                            >
                              <Calendar className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPatients.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  Nenhum paciente encontrado
                </h3>
                <p className="mb-6 text-gray-500">
                  {patients.length === 0
                    ? 'Ainda não há pacientes cadastrados.'
                    : 'Tente ajustar os filtros.'}
                </p>
                <Button asChild>
                  <Link href="/patients/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Paciente
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
