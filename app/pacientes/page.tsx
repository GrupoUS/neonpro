/**
 * NEONPROV1 - Módulo Pacientes
 * Gestão de pacientes e prontuários
 */
import React from 'react';
import { Metadata } from 'next';
import { 
  AppLayout, 
  NeonCard, 
  StatusBadge, 
  ActionButton 
} from '@/components/neonpro';
import { 
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pacientes - NEONPROV1',
  description: 'Gestão de pacientes e prontuários',
};

// Mock data para demonstração
const patients = [
  {
    id: 1,
    name: 'Maria Silva',
    age: 45,
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    lastVisit: '2024-01-10',
    status: 'normal' as const,
    nextAppointment: '2024-01-20'
  },
  {
    id: 2,
    name: 'João Santos',
    age: 38,
    email: 'joao.santos@email.com',
    phone: '(11) 88888-8888',
    lastVisit: '2024-01-08',
    status: 'urgent' as const,
    nextAppointment: '2024-01-15'
  },
  {
    id: 3,
    name: 'Ana Costa',
    age: 52,
    email: 'ana.costa@email.com',
    phone: '(11) 77777-7777',
    lastVisit: '2024-01-05',
    status: 'critical' as const,
    nextAppointment: '2024-01-14'
  },
  {
    id: 4,
    name: 'Pedro Lima',
    age: 29,
    email: 'pedro.lima@email.com',
    phone: '(11) 66666-6666',
    lastVisit: '2024-01-12',
    status: 'normal' as const,
    nextAppointment: null
  }
];

export default function PacientesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Pacientes
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gerencie pacientes e prontuários
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ActionButton
              variant="outline"
              icon={Filter}
            >
              Filtros
            </ActionButton>
            <ActionButton
              variant="primary"
              icon={Plus}
            >
              Novo Paciente
            </ActionButton>
          </div>
        </div>

        {/* Filters and Search */}
        <NeonCard>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente por nome, email ou telefone..."
                  className="pl-10 neon-input"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Todos
              </Button>
              <Button variant="ghost" size="sm">
                Ativos
              </Button>
              <Button variant="ghost" size="sm">
                Inativos
              </Button>
            </div>
          </div>
        </NeonCard>

        {/* Patients List */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main List */}
          <div className="xl:col-span-3">
            <NeonCard
              title="Lista de Pacientes"
              description={`${patients.length} pacientes cadastrados`}
            >
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-neon-primary rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {patient.name}
                          </h3>
                          <span className="text-sm text-slate-500">
                            ({patient.age} anos)
                          </span>
                          <StatusBadge 
                            status={patient.status} 
                            size="sm"
                            pulse={patient.status === 'critical'}
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Última consulta: {patient.lastVisit}</span>
                          </div>
                          {patient.nextAppointment && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Próxima: {patient.nextAppointment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <ActionButton 
                        variant="ghost" 
                        size="sm"
                        icon={Eye}
                      >
                        Ver
                      </ActionButton>
                      <ActionButton 
                        variant="outline" 
                        size="sm"
                        icon={FileText}
                      >
                        Prontuário
                      </ActionButton>
                      <ActionButton 
                        variant="secondary" 
                        size="sm"
                        icon={Calendar}
                      >
                        Agendar
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {patients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Comece cadastrando um novo paciente
                  </p>
                  <ActionButton variant="primary" icon={Plus}>
                    Novo Paciente
                  </ActionButton>
                </div>
              )}
            </NeonCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Stats */}
            <NeonCard
              title="Estatísticas"
              variant="metric"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neon-primary" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <span className="text-lg font-bold text-neon-primary">
                    {patients.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-healthcare-normal rounded-full" />
                    <span className="text-sm font-medium">Normais</span>
                  </div>
                  <span className="text-lg font-bold text-healthcare-normal">
                    {patients.filter(p => p.status === 'normal').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-healthcare-urgent rounded-full" />
                    <span className="text-sm font-medium">Urgentes</span>
                  </div>
                  <span className="text-lg font-bold text-healthcare-urgent">
                    {patients.filter(p => p.status === 'urgent').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-healthcare-critical rounded-full" />
                    <span className="text-sm font-medium">Críticos</span>
                  </div>
                  <span className="text-lg font-bold text-healthcare-critical">
                    {patients.filter(p => p.status === 'critical').length}
                  </span>
                </div>
              </div>
            </NeonCard>

            {/* Quick Actions */}
            <NeonCard title="Ações Rápidas">
              <div className="space-y-3">
                <ActionButton 
                  variant="primary" 
                  fullWidth 
                  icon={Plus}
                >
                  Novo Paciente
                </ActionButton>
                <ActionButton 
                  variant="outline" 
                  fullWidth 
                  icon={FileText}
                >
                  Relatórios
                </ActionButton>
                <ActionButton 
                  variant="ghost" 
                  fullWidth 
                  icon={Search}
                >
                  Busca Avançada
                </ActionButton>
              </div>
            </NeonCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}