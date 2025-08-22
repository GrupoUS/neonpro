'use client';

import { Calendar, Mail, Phone, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatients } from '@/hooks/usePatients';

export default function PatientsPage() {
  const { patients, loading, error, searchPatients, totalCount } =
    usePatients();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchPatients(query);
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="rounded-lg border p-4 text-destructive">
          Erro ao carregar pacientes: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Pacientes</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Paciente
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar pacientes..."
            value={searchQuery}
          />
        </div>
        <div className="text-muted-foreground text-sm">
          {loading ? 'Carregando...' : `${totalCount} pacientes`}
        </div>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          // Loading skeleton
          [...new Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : patients.length > 0 ? (
          // Patients cards
          patients.map((patient) => (
            <Card
              className="transition-shadow hover:shadow-md"
              key={patient.id}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-primary text-lg">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </span>
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Cadastrado em{' '}
                      {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {patient.date_of_birth && (
                      <div className="mt-1">
                        Nascimento:{' '}
                        {new Date(patient.date_of_birth).toLocaleDateString(
                          'pt-BR'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {patient.address && (
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    <strong>Endereço:</strong> {patient.address}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          // Empty state
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted" />
                <h3 className="mt-2 font-semibold text-foreground text-sm">
                  {searchQuery
                    ? 'Nenhum paciente encontrado'
                    : 'Nenhum paciente cadastrado'}
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {searchQuery
                    ? 'Tente buscar com outros termos.'
                    : 'Comece adicionando seu primeiro paciente.'}
                </p>
                {!searchQuery && (
                  <div className="mt-6">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Paciente
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
