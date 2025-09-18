import { AnimatedModal } from '@components/ui/animated-modal';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { EnhancedTable } from '@components/ui/enhanced-table';
import { FocusCards } from '@components/ui/focus-cards';
import { Input } from '@components/ui/input';
import { Progress } from '@components/ui/progress';
import { UniversalButton } from '@components/ui/universal-button';
import { useToast } from '@hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

export const Route = createFileRoute('/patients/dashboard')({
  component: PatientDashboard,
});

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  riskScore?: number;
  lastVisit?: string;
  nextAppointment?: {
    date: string;
    time: string;
  };
  healthInsurance?: {
    provider: string;
  };
}

interface PatientDashboardStats {
  totalPatients: number;
  newThisMonth: number;
  highRiskPatients: number;
  appointmentsToday: number;
  noShowRate: number;
}

interface PatientCardProps {
  patient: Patient;
  onClick: (patientId: string) => void;
}

function PatientCard({ patient, onClick }: PatientCardProps) {
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'destructive';
    if (riskScore >= 0.6) return 'warning';
    return 'default';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.8) return 'Alto Risco';
    if (riskScore >= 0.6) return 'Médio Risco';
    return 'Baixo Risco';
  };

  return (
    <Card
      className='hover:shadow-lg transition-shadow cursor-pointer'
      onClick={() => onClick(patient.id)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>{patient.name}</CardTitle>
          <Badge variant={getRiskColor(patient.riskScore || 0)}>
            {getRiskLabel(patient.riskScore || 0)}
          </Badge>
        </div>
        <CardDescription>
          {patient.email} • {patient.phone}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex justify-between text-sm'>
          <span>Última consulta:</span>
          <span>
            {patient.lastVisit
              ? format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: ptBR })
              : 'Nunca'}
          </span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Plano de saúde:</span>
          <span>{patient.healthInsurance?.provider || 'Particular'}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Status:</span>
          <Badge variant='outline'>{patient.status}</Badge>
        </div>
        {patient.nextAppointment && (
          <div className='pt-2 border-t'>
            <div className='text-sm font-medium'>Próxima consulta:</div>
            <div className='text-sm text-muted-foreground'>
              {format(new Date(patient.nextAppointment.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for development
  const mockStats: PatientDashboardStats = {
    totalPatients: 1250,
    newThisMonth: 45,
    highRiskPatients: 89,
    appointmentsToday: 24,
    noShowRate: 8.5,
  };

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+55 11 99999-8888',
      status: 'Ativo',
      riskScore: 0.3,
      lastVisit: '2024-01-15',
      nextAppointment: {
        date: '2024-02-01',
        time: '14:30',
      },
      healthInsurance: {
        provider: 'Unimed',
      },
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+55 11 98888-7777',
      status: 'Ativo',
      riskScore: 0.7,
      lastVisit: '2024-01-10',
      healthInsurance: {
        provider: 'Amil',
      },
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '+55 11 97777-6666',
      status: 'Inativo',
      riskScore: 0.9,
      lastVisit: '2023-12-20',
      healthInsurance: {
        provider: 'Bradesco Saúde',
      },
    },
  ];

  const stats = mockStats;
  const patients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    || patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patientId: string) => {
    navigate({ to: '/patients/$patientId', params: { patientId } });
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    toast({
      title: 'Paciente excluído com sucesso',
      description: 'O paciente foi removido do sistema.',
    });
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const tableColumns = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: (info: any) => <div className='font-medium'>{info.getValue()}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <Badge variant='outline'>{info.getValue()}</Badge>,
    },
    {
      accessorKey: 'riskScore',
      header: 'Risco',
      cell: (info: any) => {
        const score = info.getValue();
        let variant: 'default' | 'destructive' | 'outline' = 'default';
        let label = 'Baixo';

        if (score >= 0.8) {
          variant = 'destructive';
          label = 'Alto';
        } else if (score >= 0.6) {
          variant = 'outline';
          label = 'Médio';
        }

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: 'lastVisit',
      header: 'Última Consulta',
      cell: (info: any) => {
        const date = info.getValue();
        return date ? format(new Date(date), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca';
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (info: any) => {
        const patient = info.row.original;
        return (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePatientClick(patient.id)}
            >
              Ver
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                navigate({ to: '/patients/$patientId/edit', params: { patientId: patient.id } })}
            >
              Editar
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => handleDeletePatient(patient)}
            >
              Excluir
            </Button>
          </div>
        );
      },
    },
  ];

  const statsCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients,
      change: stats.newThisMonth,
      changeType: 'increase' as const,
      description: 'Novos este mês',
    },
    {
      title: 'Consultas Hoje',
      value: stats.appointmentsToday,
      change: '+12%',
      changeType: 'increase' as const,
      description: 'Comparado ontem',
    },
    {
      title: 'Pacientes de Alto Risco',
      value: stats.highRiskPatients,
      change: '-5%',
      changeType: 'decrease' as const,
      description: 'Melhoria este mês',
    },
    {
      title: 'Taxa de Não Comparecimento',
      value: `${stats.noShowRate.toFixed(1)}%`,
      change: '-2.1%',
      changeType: 'decrease' as const,
      description: 'Redução este mês',
    },
  ];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard de Pacientes</h1>
          <p className='text-muted-foreground'>
            Gerencie pacientes, consultas e acompanhamento em tempo real
          </p>
        </div>
        <div className='flex gap-3'>
          <UniversalButton
            variant='primary'
            onClick={() => navigate({ to: '/patients/register' })}
            className='bg-blue-600 hover:bg-blue-700'
          >
            Novo Paciente
          </UniversalButton>
          <UniversalButton
            variant='outline'
            onClick={() => navigate({ to: '/ai/insights' })}
          >
            Insights de IA
          </UniversalButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map(stat => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>
                <span
                  className={`inline-flex items-center ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? '↑' : '↓'} {stat.change}
                </span>{' '}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
          <CardDescription>
            Busque e gerencie todos os pacientes cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2 mb-4'>
            <Input
              placeholder='Buscar pacientes por nome, email ou CPF...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>

          <EnhancedTable
            columns={tableColumns}
            data={patients}
            searchable={false}
            pagination={true}
            itemsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Focus Cards for Quick Actions */}
      <FocusCards
        cards={[
          {
            title: 'Novo Paciente',
            description: 'Cadastre um novo paciente no sistema',
            action: () => navigate({ to: '/patients/register' }),
            icon: '👥',
          },
          {
            title: 'Agendar Consulta',
            description: 'Agende uma nova consulta para um paciente',
            action: () => navigate({ to: '/appointments/new' }),
            icon: '📅',
          },
          {
            title: 'AI Insights',
            description: 'Visualize insights e previsões de IA',
            action: () => navigate({ to: '/ai/insights' }),
            icon: '🤖',
          },
          {
            title: 'Relatórios',
            description: 'Gere relatórios e análises',
            action: () => navigate({ to: '/reports' }),
            icon: '📊',
          },
        ]}
      />

      {/* Delete Confirmation Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        title='Confirmar Exclusão'
        description={`Tem certeza que deseja excluir o paciente "${selectedPatient?.name}"? Esta ação não pode ser desfeita.`}
      >
        <div className='flex justify-end gap-3 mt-6'>
          <UniversalButton
            variant='outline'
            onClick={() => {
              setIsModalOpen(false);
              setSelectedPatient(null);
            }}
          >
            Cancelar
          </UniversalButton>
          <UniversalButton
            variant='destructive'
            onClick={confirmDelete}
          >
            Excluir Paciente
          </UniversalButton>
        </div>
      </AnimatedModal>
    </div>
  );
}
