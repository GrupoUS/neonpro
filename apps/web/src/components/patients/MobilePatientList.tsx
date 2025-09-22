'use client';

import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  Filter,
  Info,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
} from '@/components/ui';
import { cn, formatBRPhone } from '@/utils';

// Types for LGPD-compliant patient data
interface MobilePatientData {
  id: string;
  name: string;
  maskedCpf: string; // Always masked by default for LGPD compliance
  phone: string;
  email: string;
  birthDate: Date;
  status: 'active' | 'inactive' | 'pending';
  lastVisit?: Date;
  consentStatus: 'granted' | 'pending' | 'withdrawn';
  dataVisibilityLevel: 'minimal' | 'standard' | 'full'; // Progressive disclosure
}

interface MobilePatientListProps {
  patients: MobilePatientData[];
  isLoading?: boolean;
  onPatientSelect: (patientId: string) => void;
  onCreatePatient?: () => void;
  userRole: 'admin' | 'aesthetician' | 'coordinator';
}

// Brazilian CPF masking function for LGPD compliance
const maskCpf = (
  cpf: string,
  visibilityLevel: 'minimal' | 'standard' | 'full',
): string => {
  if (visibilityLevel === 'minimal') return '***.***.***-**';
  if (visibilityLevel === 'standard') {
    return cpf.replace(/(\d{3})\d{3}(\d{3})(\d{2})/, '$1.***.***-$3');
  }
  return cpf;
};

// Status badge component with Brazilian Portuguese
const StatusBadge = ({ status }: { status: MobilePatientData['status'] }) => {
  const statusConfig = {
    active: {
      label: 'Ativo',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800',
    },
    inactive: {
      label: 'Inativo',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800',
    },
    pending: {
      label: 'Pendente',
      variant: 'outline' as const,
      className: 'bg-yellow-100 text-yellow-800',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('text-xs', config.className)}>
      {config.label}
    </Badge>
  );
};

// LGPD consent indicator component
const ConsentIndicator = ({
  consentStatus,
}: {
  consentStatus: MobilePatientData['consentStatus'];
}) => {
  const consentConfig = {
    granted: {
      icon: Shield,
      color: 'text-green-600',
      label: 'Consentimento concedido',
    },
    pending: {
      icon: Info,
      color: 'text-yellow-600',
      label: 'Consentimento pendente',
    },
    withdrawn: {
      icon: EyeOff,
      color: 'text-red-600',
      label: 'Consentimento retirado',
    },
  };

  const { icon: Icon, color, label } = consentConfig[consentStatus];

  return (
    <div className='flex items-center gap-1' title={label}>
      <Icon className={cn('h-3 w-3', color)} />
      <span className={cn('text-xs', color)}>
        {consentStatus === 'granted' && 'LGPD ✓'}
        {consentStatus === 'pending' && 'LGPD ⏳'}
        {consentStatus === 'withdrawn' && 'LGPD ✗'}
      </span>
    </div>
  );
};

// Mobile-optimized patient card with touch targets ≥44px
const MobilePatientCard = ({
  patient,
  onSelect,
  userRole,
  onVisibilityToggle,
}: {
  patient: MobilePatientData;
  onSelect: (id: string) => void;
  userRole: string;
  onVisibilityToggle: (
    id: string,
    newLevel: MobilePatientData['dataVisibilityLevel'],
  ) => void;
}) => {
  const navigate = useNavigate();

  const canViewFullData = userRole === 'admin' || patient.consentStatus === 'granted';
  const maskedPhone = formatBRPhone(patient.phone);
  const displayCpf = maskCpf(patient.maskedCpf, patient.dataVisibilityLevel);

  return (
    <Card className='mb-3 touch-manipulation'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            {/* Patient name and status */}
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='font-medium text-base truncate'>{patient.name}</h3>
              <StatusBadge status={patient.status} />
            </div>

            {/* Contact information with progressive disclosure */}
            <div className='space-y-1 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <User className='h-3 w-3' />
                <span className='font-mono text-xs'>{displayCpf}</span>
                {canViewFullData && patient.dataVisibilityLevel !== 'full' && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() => onVisibilityToggle(patient.id, 'full')}
                  >
                    <Eye className='h-3 w-3' />
                  </Button>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <Phone className='h-3 w-3' />
                <span>{maskedPhone}</span>
              </div>

              {patient.lastVisit && (
                <div className='flex items-center gap-2'>
                  <Calendar className='h-3 w-3' />
                  <span>
                    Última consulta: {format(patient.lastVisit, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            {/* LGPD compliance indicator */}
            <div className='mt-3 flex items-center justify-between'>
              <ConsentIndicator consentStatus={patient.consentStatus} />

              {/* Age calculation for aesthetic context */}
              <span className='text-xs text-muted-foreground'>
                {new Date().getFullYear() - patient.birthDate.getFullYear()} anos
              </span>
            </div>
          </div>

          {/* Action menu with 44px+ touch target */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='h-10 w-10 p-0 ml-2'
                aria-label={`Ações para ${patient.name}`}
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={() => onSelect(patient.id)}>
                <Eye className='mr-2 h-4 w-4' />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: `/patients/${patient.id}/edit` })}
              >
                <User className='mr-2 h-4 w-4' />
                Editar paciente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: `/appointments/new`,
                    search: { patientId: patient.id },
                  })}
              >
                <Calendar className='mr-2 h-4 w-4' />
                Agendar consulta
              </DropdownMenuItem>
              {patient.consentStatus === 'granted' && (
                <DropdownMenuItem>
                  <Mail className='mr-2 h-4 w-4' />
                  Enviar mensagem
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Touch-friendly patient selection button */}
        <Button
          variant='outline'
          className='w-full mt-3 h-12 touch-manipulation'
          onClick={() => onSelect(patient.id)}
        >
          Abrir prontuário
        </Button>
      </CardContent>
    </Card>
  );
};

export function MobilePatientList({
  patients,
  isLoading = false,
  onPatientSelect,
  onCreatePatient,
  userRole,
}: MobilePatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | MobilePatientData['status']
  >('all');
  const [consentFilter, setConsentFilter] = useState<
    'all' | MobilePatientData['consentStatus']
  >('all');
  const [visibilityLevels, setVisibilityLevels] = useState<
    Record<string, MobilePatientData['dataVisibilityLevel']>
  >({});

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        || patient.maskedCpf.includes(searchTerm)
        || patient.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      const matchesConsent = consentFilter === 'all' || patient.consentStatus === consentFilter;

      return matchesSearch && matchesStatus && matchesConsent;
    });
  }, [patients, searchTerm, statusFilter, consentFilter]);

  const handleVisibilityToggle = (
    patientId: string,
    newLevel: MobilePatientData['dataVisibilityLevel'],
  ) => {
    setVisibilityLevels(prev => ({
      ...prev,
      [patientId]: newLevel,
    }));
  };

  const getPatientWithVisibility = (patient: MobilePatientData) => ({
    ...patient,
    dataVisibilityLevel: visibilityLevels[patient.id] || patient.dataVisibilityLevel,
  });

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='p-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
              <Skeleton className='h-3 w-2/3' />
              <Skeleton className='h-10 w-full' />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Mobile-optimized header with search and filters */}
      <div className='space-y-3'>
        {/* Search bar with large touch target */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nome, CPF ou telefone...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10 h-12 text-base'
          />
        </div>

        {/* Filter sheet for mobile */}
        <div className='flex gap-2'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' className='flex-1 h-12'>
                <Filter className='mr-2 h-4 w-4' />
                Filtros
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </SheetTrigger>
            <SheetContent side='bottom' className='max-h-[80vh]'>
              <SheetHeader>
                <SheetTitle>Filtros de Pacientes</SheetTitle>
              </SheetHeader>
              <div className='space-y-4 mt-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Status do Paciente
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: any) => setStatusFilter(value)}
                  >
                    <SelectTrigger className='h-12'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Todos os status</SelectItem>
                      <SelectItem value='active'>Ativo</SelectItem>
                      <SelectItem value='inactive'>Inativo</SelectItem>
                      <SelectItem value='pending'>Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Status LGPD
                  </label>
                  <Select
                    value={consentFilter}
                    onValueChange={(value: any) => setConsentFilter(value)}
                  >
                    <SelectTrigger className='h-12'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>
                        Todos os consentimentos
                      </SelectItem>
                      <SelectItem value='granted'>
                        Consentimento concedido
                      </SelectItem>
                      <SelectItem value='pending'>
                        Consentimento pendente
                      </SelectItem>
                      <SelectItem value='withdrawn'>
                        Consentimento retirado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Create patient button */}
          {onCreatePatient && (
            <Button onClick={onCreatePatient} className='h-12 px-4'>
              <Plus className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Results summary */}
      <div className='text-sm text-muted-foreground'>
        {filteredPatients.length} {filteredPatients.length === 1
          ? 'paciente encontrado'
          : 'pacientes encontrados'}
      </div>

      {/* Patient list */}
      <div className='space-y-3'>
        {filteredPatients.length === 0
          ? (
            <Card className='p-8 text-center'>
              <div className='text-muted-foreground'>
                <User className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p className='text-lg font-medium'>Nenhum paciente encontrado</p>
                <p className='text-sm mt-1'>
                  Tente ajustar os filtros ou criar um novo paciente
                </p>
                {onCreatePatient && (
                  <Button onClick={onCreatePatient} className='mt-4'>
                    <Plus className='mr-2 h-4 w-4' />
                    Cadastrar primeiro paciente
                  </Button>
                )}
              </div>
            </Card>
          )
          : (
            filteredPatients.map(patient => (
              <MobilePatientCard
                key={patient.id}
                patient={getPatientWithVisibility(patient)}
                onSelect={onPatientSelect}
                userRole={userRole}
                onVisibilityToggle={handleVisibilityToggle}
              />
            ))
          )}
      </div>

      {/* LGPD compliance notice */}
      <div className='mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
        <div className='flex items-start gap-2'>
          <Shield className='h-4 w-4 text-blue-600 mt-0.5' />
          <div className='text-xs text-blue-800'>
            <p className='font-medium'>Proteção de Dados - LGPD</p>
            <p className='mt-1'>
              Os dados pessoais são exibidos com base no consentimento do paciente e nível de acesso
              do usuário. Dados sensíveis são mascarados por padrão para garantir a privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobilePatientList;
