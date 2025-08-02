/**
 * NEONPROV1 - Módulo Agenda
 * Gestão de agendamentos e consultas
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
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  Users,
  MapPin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Agenda - NEONPROV1',
  description: 'Gestão de agendamentos e consultas',
};

// Mock data para demonstração
const appointments = [
  {
    id: 1,
    patient: 'Maria Silva',
    time: '09:00',
    duration: 30,
    type: 'Consulta Rotina',
    status: 'scheduled' as const,
    location: 'Sala 101'
  },
  {
    id: 2,
    patient: 'João Santos',
    time: '10:30',
    duration: 45,
    type: 'Retorno',
    status: 'urgent' as const,
    location: 'Sala 102'
  },
  {
    id: 3,
    patient: 'Ana Costa',
    time: '14:00',
    duration: 60,
    type: 'Emergência',
    status: 'critical' as const,
    location: 'Sala 201'
  },
  {
    id: 4,
    patient: 'Pedro Lima',
    time: '15:30',
    duration: 30,
    type: 'Consulta',
    status: 'pending' as const,
    location: 'Sala 103'
  }
];

export default function AgendaPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Agenda
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gerencie agendamentos e consultas
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
              Novo Agendamento
            </ActionButton>
          </div>
        </div>

        {/* Filters */}
        <NeonCard>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-10 neon-input"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Hoje
              </Button>
              <Button variant="ghost" size="sm">
                Esta Semana
              </Button>
              <Button variant="ghost" size="sm">
                Este Mês
              </Button>
            </div>
          </div>
        </NeonCard>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Schedule */}
          <div className="xl:col-span-2 space-y-4">
            <NeonCard
              title="Agendamentos de Hoje"
              description="Segunda-feira, 15 de Janeiro de 2024"
            >
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-16">
                        <div className="text-lg font-bold text-neon-primary">
                          {appointment.time}
                        </div>
                        <div className="text-xs text-slate-500">
                          {appointment.duration}min
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {appointment.patient}
                          </h3>
                          <StatusBadge 
                            status={appointment.status} 
                            size="sm"
                            pulse={appointment.status === 'critical'}
                          />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {appointment.type}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ActionButton variant="ghost" size="sm">
                        Editar
                      </ActionButton>
                      <ActionButton variant="outline" size="sm">
                        Iniciar
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Nenhum agendamento hoje
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Comece criando um novo agendamento
                  </p>
                  <ActionButton variant="primary" icon={Plus}>
                    Novo Agendamento
                  </ActionButton>
                </div>
              )}
            </NeonCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <NeonCard
              title="Resumo do Dia"
              variant="metric"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-primary" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <span className="text-lg font-bold text-neon-primary">
                    {appointments.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-healthcare-pending" />
                    <span className="text-sm font-medium">Pendentes</span>
                  </div>
                  <span className="text-lg font-bold text-healthcare-pending">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-healthcare-completed" />
                    <span className="text-sm font-medium">Realizadas</span>
                  </div>
                  <span className="text-lg font-bold text-healthcare-completed">
                    0
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
                  Novo Agendamento
                </ActionButton>
                <ActionButton 
                  variant="outline" 
                  fullWidth 
                  icon={Calendar}
                >
                  Ver Calendário
                </ActionButton>
                <ActionButton 
                  variant="ghost" 
                  fullWidth 
                  icon={Users}
                >
                  Lista de Espera
                </ActionButton>
              </div>
            </NeonCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}