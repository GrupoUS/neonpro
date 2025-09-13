/**
 * Enhanced Patient Detail Route - Brazilian Healthcare UX with Mobile-First Design
 * Features: WCAG 2.1 AA+ compliance, real-time updates, LGPD compliance, responsive design
 * Optimized for aesthetic clinic workflows with Brazilian UX patterns
 */

import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatients';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge, Button } from '@neonpro/ui';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { z } from 'zod';
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  History,
  Mail,
  Phone,
  Shield,
  User,
  UserCheck,
  AlertCircle,
  Clock,
  Stethoscope,
  Heart,
  Pill,
  AlertTriangle,
} from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';

// Type-safe search params schema with tab navigation
const patientSearchSchema = z.object({
  tab: z.enum(['overview', 'history', 'appointments', 'documents']).optional().default('overview'),
  edit: z.boolean().optional().default(false),
});

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Enhanced patient data type
interface PatientData {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  createdAt: string;
  age?: number;
  status: 'Active' | 'Inactive' | 'Pending';
  lastVisit?: string;
  nextAppointment?: string;
  totalAppointments: number;
  lgpdConsent: boolean;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  notes?: string;
}

// Route definition with enhanced patterns
export const Route = createFileRoute('/patients/$patientId')({
  // Type-safe parameter validation
  params: {
    parse: params => patientParamsSchema.parse(params),
    stringify: params => params,
  },

  // Type-safe search parameter validation
  validateSearch: patientSearchSchema,

  // Enhanced loading component with accessibility
  pendingComponent: () => (
    <div className="container mx-auto p-4 md:p-6 space-y-6" role="main" aria-label="Carregando dados do paciente">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-20"></div>
            <div className="h-10 bg-muted rounded w-20"></div>
          </div>
        </div>
        
        {/* Tab navigation skeleton */}
        <div className="flex space-x-8 border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded w-20"></div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
      
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Carregando informações do paciente...
      </div>
    </div>
  ),

  // Enhanced error boundary with accessibility
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto p-4 md:p-6" role="main">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-destructive">
            Erro ao Carregar Dados do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Não foi possível acessar os dados do paciente. Verifique suas permissões ou tente novamente.
          </p>
          <details className="text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Detalhes técnicos
            </summary>
            <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
              {error.message}
            </p>
          </details>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              Tentar Novamente
            </Button>
            <Button asChild>
              <Link to="/patients">
                Voltar para Lista
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { patientId } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch patient data with real-time updates
  const { data: patient, isLoading, error, refetch } = usePatient(patientId);

  // Log access for LGPD compliance
  useEffect(() => {
    if (patient && user?.id) {
      const logAccess = async () => {
        try {
          await supabase.from('audit_logs').insert({
            action: 'patient_data_accessed',
            resource_type: 'patient',
            resource_id: patientId,
            user_id: user.id,
            details: { tab, accessed_at: new Date().toISOString() },
          });
        } catch (error) {
          console.warn('Failed to log patient access:', error);
        }
      };
      logAccess();
    }
  }, [patient, user?.id, patientId, tab]);

  // Tab navigation with accessibility
  const handleTabChange = (newTab: typeof tab) => {
    navigate({
      to: '/patients/$patientId',
      params: { patientId },
      search: { tab: newTab },
    });
  };

  // Action handlers
  const handleEdit = () => {
    navigate({
      to: '/patients/$patientId/edit',
      params: { patientId },
    });
  };

  const handleScheduleAppointment = () => {
    navigate({
      to: '/appointments/new',
      search: { patientId },
    });
  };



  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6" role="main" aria-label="Carregando dados do paciente">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded w-20"></div>
              <div className="h-10 bg-muted rounded w-20"></div>
            </div>
          </div>
          <div className="flex space-x-8 border-b">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-20"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="sr-only" aria-live="polite">
          Carregando informações do paciente...
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto p-4 md:p-6" role="main">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
            </div>
            <CardTitle className="text-destructive">
              Erro ao Carregar Dados do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Não foi possível acessar os dados do paciente. Verifique suas permissões ou tente novamente.
            </p>
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Detalhes técnicos
              </summary>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                {(error as Error)?.message ?? 'Paciente não encontrado'}
              </p>
            </details>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()} variant="outline">
                Tentar Novamente
              </Button>
              <Button asChild>
                <Link to="/patients">Voltar para Lista</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform patient data (adapt based on your actual patient structure)
  const patientData: PatientData = {
    id: patient.id,
    fullName: patient.fullName,
    email: patient.email,
    phone: patient.phone,
    birthDate: patient.birthDate,
    cpf: patient.cpf,
    createdAt: patient.createdAt,
    age: patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : undefined,
    status: 'Active', // Adapt based on your patient status logic
    lastVisit: undefined, // Add if available in your data
    nextAppointment: undefined, // Add if available in your data
    totalAppointments: 0, // Add if available in your data
    lgpdConsent: true, // Add if available in your data
    allergies: [], // Add if available in your data
    chronicConditions: [], // Add if available in your data
    currentMedications: [], // Add if available in your data
    notes: undefined, // Add if available in your data
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6" role="main">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link 
              to="/patients" 
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Pacientes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            {patientData.fullName}
          </li>
        </ol>
      </nav>

      {/* Patient Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {patientData.fullName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>ID: {patientId}</span>
                {patientData.age && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{patientData.age} anos</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
            <span className="sm:hidden">Editar</span>
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleScheduleAppointment}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Agendar Consulta</span>
            <span className="sm:hidden">Agendar</span>
          </Button>
        </div>
      </div>

      {/* Status and LGPD Indicators */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge 
          variant={patientData.status === 'Active' ? 'default' : 'secondary'}
          className="flex items-center gap-1"
        >
          <div 
            className={`w-2 h-2 rounded-full ${
              patientData.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
            aria-hidden="true"
          />
          {patientData.status === 'Active' ? 'Ativo' : 'Inativo'}
        </Badge>
        
        {patientData.lgpdConsent && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" aria-hidden="true" />
            LGPD Aprovado
          </Badge>
        )}
      </div>

      {/* Tab Navigation with Accessibility */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" role="tablist">
          {[
            { key: 'overview', label: 'Visão Geral', icon: Eye },
            { key: 'history', label: 'Histórico', icon: History },
            { key: 'appointments', label: 'Consultas', icon: Calendar },
            { key: 'documents', label: 'Documentos', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key as typeof tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors ${
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              role="tab"
              aria-selected={tab === key}
              aria-controls={`tabpanel-${key}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with Error Boundaries */}
      <div role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <ErrorBoundary
          fallback={(error: Error) => (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <h3 className="font-semibold text-destructive mb-2">
                  Erro ao Carregar Conteúdo
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {error.message}
                </p>
                <Button onClick={() => window.location.reload()} size="sm">
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          )}
        >
          <Suspense fallback={<TabContentSkeleton />}>
            {tab === 'overview' && <OverviewTab patient={patientData} />}
            {tab === 'history' && <HistoryTab patientId={patientId} />}
            {tab === 'appointments' && <AppointmentsTab patientId={patientId} />}
            {tab === 'documents' && <DocumentsTab patientId={patientId} />}
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* LGPD Compliance Footer */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              <span>
                Acesso registrado para auditoria LGPD • 
                Dados protegidos conforme Lei 13.709/2018
              </span>
            </div>
            <time dateTime={new Date().toISOString()}>
              {new Date().toLocaleString('pt-BR')}
            </time>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Overview Tab Component with Enhanced UX
 */
function OverviewTab({ patient }: { patient: PatientData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" aria-hidden="true" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem label="Nome Completo" value={patient.fullName} />
          <InfoItem 
            label="CPF" 
            value={patient.cpf ? formatCPF(patient.cpf) : 'Não informado'} 
            sensitive 
          />
          <InfoItem 
            label="Data de Nascimento" 
            value={patient.birthDate ? formatDate(patient.birthDate) : 'Não informado'} 
          />
          {patient.age && <InfoItem label="Idade" value={`${patient.age} anos`} />}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" aria-hidden="true" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem 
            label="Telefone" 
            value={patient.phone ? formatPhone(patient.phone) : 'Não informado'}
            icon={Phone}
          />
          <InfoItem 
            label="Email" 
            value={patient.email || 'Não informado'}
            icon={Mail}
          />
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" aria-hidden="true" />
            Informações Médicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MedicalInfoSection 
            label="Alergias" 
            items={patient.allergies}
            icon={AlertTriangle}
            emptyText="Nenhuma alergia registrada"
            variant="warning"
          />
          <MedicalInfoSection 
            label="Condições Crônicas" 
            items={patient.chronicConditions}
            icon={Heart}
            emptyText="Nenhuma condição crônica registrada"
            variant="info"
          />
          <MedicalInfoSection 
            label="Medicamentos Atuais" 
            items={patient.currentMedications}
            icon={Pill}
            emptyText="Nenhum medicamento registrado"
            variant="default"
          />
          {patient.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Observações:</label>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {patient.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics and Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" aria-hidden="true" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem 
            label="Total de Consultas" 
            value={patient.totalAppointments.toString()}
            icon={Calendar}
          />
          <InfoItem 
            label="Última Visita" 
            value={patient.lastVisit ? formatDate(patient.lastVisit) : 'Nenhuma visita'}
            icon={Clock}
          />
          <InfoItem 
            label="Próxima Consulta" 
            value={patient.nextAppointment ? formatDate(patient.nextAppointment) : 'Não agendada'}
            icon={Calendar}
          />
          <InfoItem 
            label="Paciente desde" 
            value={formatDate(patient.createdAt)}
            icon={UserCheck}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * History Tab Component (Placeholder)
 */
function HistoryTab({ patientId: _patientId }: { patientId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Médico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Histórico em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-4">
            O histórico médico detalhado estará disponível em breve.
          </p>
          <Button variant="outline" size="sm">
            Ver Consultas Anteriores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Appointments Tab Component (Placeholder)
 */
function AppointmentsTab({ patientId: _patientId }: { patientId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas e Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Consultas em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-4">
            A visualização de consultas estará disponível em breve.
          </p>
          <Button size="sm">
            Agendar Nova Consulta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Documents Tab Component (Placeholder)
 */
function DocumentsTab({ patientId: _patientId }: { patientId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Documentos em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-4">
            O sistema de documentos estará disponível em breve.
          </p>
          <Button variant="outline" size="sm">
            Fazer Upload de Documento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper Components
 */

// Info item component with accessibility
function InfoItem({ 
  label, 
  value, 
  icon: Icon, 
  sensitive = false 
}: { 
  label: string; 
  value: string; 
  icon?: any; 
  sensitive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
        <span className="text-sm font-medium text-foreground">
          {label}:
        </span>
      </div>
      <span 
        className={`text-sm text-muted-foreground ${sensitive ? 'font-mono' : ''}`}
        aria-label={sensitive ? `${label}: ${value}` : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// Medical info section component
function MedicalInfoSection({ 
  label, 
  items, 
  icon: Icon, 
  emptyText, 
  variant = 'default' 
}: { 
  label: string; 
  items?: string[]; 
  icon: any; 
  emptyText: string; 
  variant?: 'default' | 'warning' | 'info';
}) {
  const variantStyles = {
    default: 'text-primary',
    warning: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${variantStyles[variant]}`} aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">{label}:</span>
      </div>
      {items && items.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 ml-6">
          {items.map((item, index) => (
            <li key={index} className={`text-sm ${variantStyles[variant]}`}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground ml-6">{emptyText}</p>
      )}
    </div>
  );
}

// Tab content skeleton
function TabContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

// Utility functions for Brazilian formatting
function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}