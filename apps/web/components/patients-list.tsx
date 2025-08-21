/**
 * 👥 Patients List - NeonPro Healthcare
 * ===================================
 * 
 * Main patients list with search, filters,
 * and role-based actions.
 */

'use client';

import React from 'react';
import { useSearch, Link } from '@tanstack/react-router';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PatientsList() {
  const search = useSearch({ from: '/patients' });
  
  // Mock data - replace with actual data fetching
  const patients = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-9999',
      status: 'active',
      lastVisit: '2024-01-15',
      treatments: 3,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      status: 'active',
      lastVisit: '2024-01-10',
      treatments: 1,
    },
    {
      id: '3',
      name: 'João Oliveira',
      email: 'joao.oliveira@email.com',
      phone: '(11) 77777-7777',
      status: 'inactive',
      lastVisit: '2023-12-20',
      treatments: 5,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e prontuários
          </p>
        </div>
        <Button asChild>
          <Link to="/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            className="pl-10"
            defaultValue={search?.search || ''}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                  </div>
                </div>
                {getStatusBadge(patient.status)}
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="truncate ml-2">{patient.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{patient.phone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Última visita:</span>
                  <span>{new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Tratamentos:</span>
                  <Badge variant="outline">{patient.treatments}</Badge>
                </p>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/patients/${patient.id}`}>
                    Ver Detalhes
                  </Link>
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {patients.length} de {patients.length} pacientes
        </p>
      </div>
    </div>
  );
}