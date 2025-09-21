'use client';

import { PatientRegistrationWizard } from '@/components/patients/PatientRegistrationWizard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Save,
  Shield,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/patients/register')({
  component: PatientRegister,
});

interface RegistrationProgress {
  currentStep: number;
  completedSteps: number[];
  draftSaved: boolean;
  lastSaved: Date | null;
  validationErrors: string[];
}

function PatientRegister() {
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const [registrationProgress, setRegistrationProgress] = useState<RegistrationProgress>({
    currentStep: 1,
    completedSteps: [],
    draftSaved: false,
    lastSaved: null,
    validationErrors: [],
  });
  const [recentlyCreated, setRecentlyCreated] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle successful patient creation
  const handlePatientCreated = (_patient: any) => {
    setRecentlyCreated(patient.id);
    setIsWizardOpen(false);

    toast({
      title: 'Paciente cadastrado com sucesso!',
      description: `O paciente ${patient.name} foi cadastrado no sistema conforme LGPD.`,
      duration: 5000,
    });

    // Update progress
    setRegistrationProgress(prev => ({
      ...prev,
      completedSteps: [1, 2, 3, 4, 5],
      currentStep: 5,
      draftSaved: false,
      lastSaved: new Date(),
      validationErrors: [],
    }));
  };

  // Handle wizard step changes
  const handleStepChange = (step: number, completedSteps: number[]) => {
    setRegistrationProgress(prev => ({
      ...prev,
      currentStep: step,
      completedSteps,
    }));
  };

  // Handle draft save
  const handleDraftSave = () => {
    setRegistrationProgress(prev => ({
      ...prev,
      draftSaved: true,
      lastSaved: new Date(),
    }));

    toast({
      title: 'Rascunho salvo',
      description: 'As informações foram salvas como rascunho.',
      duration: 3000,
    });
  };

  // Handle validation errors
  const handleValidationError = (errors: string[]) => {
    setRegistrationProgress(prev => ({
      ...prev,
      validationErrors: errors,
    }));
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate({ to: '/patients/dashboard' });
  };

  // Navigate to patient details
  const handleViewPatient = () => {
    if (recentlyCreated) {
      navigate({
        to: '/patients/$patientId',
        params: { patientId: recentlyCreated },
      });
    }
  };

  // Reset form for new registration
  const handleRegisterAnother = () => {
    setRecentlyCreated(null);
    setIsWizardOpen(true);
    setRegistrationProgress({
      currentStep: 1,
      completedSteps: [],
      draftSaved: false,
      lastSaved: null,
      validationErrors: [],
    });
  };

  // Mock clinic ID - in real app this would come from context/auth
  const clinicId = 'default-clinic-id';

  return (
    <div className='container mx-auto p-4 sm:p-6 max-w-6xl'>
      {/* Header with CFM compliance */}
      <header className='space-y-4 sm:space-y-6 mb-6 sm:mb-8'>
        {/* CFM Header */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-600' />
              <span className='text-sm sm:text-base font-medium text-blue-900'>
                CRM/SP 123456 - Dr. João Silva
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-blue-600' />
              <span className='text-xs sm:text-sm text-blue-700'>
                Cadastro conforme LGPD - Resolução CFM 2.314/2022
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
              Cadastro de Pacientes
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0'>
              Cadastre novos pacientes com todas as informações necessárias para tratamento
            </p>
          </div>

          <Button
            variant='outline'
            onClick={handleBackToDashboard}
            className='h-11 sm:h-10 text-base sm:text-sm font-medium'
            aria-label='Voltar para o dashboard de pacientes'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
        </div>
      </header>

      {/* Progress Overview */}
      {!recentlyCreated && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-blue-600' />
              Status do Cadastro
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso do cadastro do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Progress Steps */}
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-5'>
              {[
                { id: 1, title: 'Informações Básicas', icon: UserPlus },
                { id: 2, title: 'Contato e Endereço', icon: Heart },
                { id: 3, title: 'Documentos', icon: FileText },
                { id: 4, title: 'Informações Médicas', icon: Heart },
                { id: 5, title: 'Consentimento LGPD', icon: Shield },
              ].map(step => {
                const isCompleted = registrationProgress.completedSteps.includes(step.id);
                const isCurrent = registrationProgress.currentStep === step.id;
                const isError = registrationProgress.validationErrors.length > 0 && isCurrent;

                return (
                  <div key={step.id} className='text-center'>
                    <div
                      className={cn(
                        'w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all',
                        isCompleted
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : isCurrent
                          ? isError
                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300',
                      )}
                      aria-label={`${step.title} - ${
                        isCompleted
                          ? 'Concluído'
                          : isCurrent
                          ? 'Em andamento'
                          : 'Pendente'
                      }`}
                    >
                      {isCompleted
                        ? <CheckCircle className='h-6 w-6' />
                        : <step.icon className='h-6 w-6' />}
                    </div>
                    <div className='mt-2'>
                      <div className='text-xs sm:text-sm font-medium text-gray-900'>
                        {step.title}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {isCompleted
                          ? 'Concluído'
                          : isCurrent
                          ? 'Atual'
                          : 'Pendente'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Information */}
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-3'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-blue-600' />
                <span className='text-sm text-gray-700'>
                  Passo atual: {registrationProgress.currentStep}/5
                </span>
              </div>

              {registrationProgress.draftSaved
                && registrationProgress.lastSaved && (
                <div className='flex items-center gap-2'>
                  <Save className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-gray-700'>
                    Rascunho salvo às {registrationProgress.lastSaved.toLocaleTimeString(
                      'pt-BR',
                    )}
                  </span>
                </div>
              )}

              {registrationProgress.validationErrors.length > 0 && (
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-red-600' />
                  <span className='text-sm text-red-700'>
                    {registrationProgress.validationErrors.length} erro(s) de validação
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {recentlyCreated
        ? (
          /* Success State */
          <Card>
            <CardHeader className='text-center'>
              <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <CheckCircle className='h-8 w-8 text-green-600' />
              </div>
              <CardTitle className='text-xl sm:text-2xl text-green-900'>
                Paciente Cadastrado com Sucesso!
              </CardTitle>
              <CardDescription className='text-base'>
                O paciente foi cadastrado no sistema e já está disponível para agendamento de
                consultas.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Compliance Information */}
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Shield className='h-5 w-5 text-green-600' />
                  <span className='font-medium text-green-900'>
                    Conformidade LGPD Verificada
                  </span>
                </div>
                <ul className='text-sm text-green-800 space-y-1'>
                  <li>• Consentimento de processamento de dados obtido</li>
                  <li>
                    • Informações criptografadas e armazenadas com segurança
                  </li>
                  <li>
                    • Audit trail registrado conforme resolução CFM 2.314/2022
                  </li>
                  <li>• Direitos do paciente garantidos e documentados</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  variant='default'
                  onClick={handleViewPatient}
                  className='h-12 sm:h-11 text-base sm:text-sm font-medium flex-1'
                  aria-label='Visualizar detalhes do paciente recém-cadastrado'
                >
                  <Users className='h-4 w-4 mr-2' />
                  Visualizar Paciente
                </Button>

                <Button
                  variant='outline'
                  onClick={handleRegisterAnother}
                  className='h-12 sm:h-11 text-base sm:text-sm font-medium flex-1'
                  aria-label='Cadastrar outro paciente'
                >
                  <UserPlus className='h-4 w-4 mr-2' />
                  Cadastrar Outro
                </Button>

                <Button
                  variant='outline'
                  onClick={handleBackToDashboard}
                  className='h-12 sm:h-11 text-base sm:text-sm font-medium flex-1'
                  aria-label='Voltar para o dashboard'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )
        : (
          /* Registration Wizard */
          <PatientRegistrationWizard
            open={isWizardOpen}
            onOpenChange={setIsWizardOpen}
            clinicId={clinicId}
            onPatientCreated={handlePatientCreated}
            onStepChange={handleStepChange}
            onDraftSave={handleDraftSave}
            onValidationError={handleValidationError}
          />
        )}

      {/* LGPD Information Footer */}
      <footer className='mt-8 sm:mt-12'>
        <Card className='bg-gray-50'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <Shield className='h-6 w-6 text-blue-600' />
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Proteção de Dados LGPD
                  </h3>
                  <p className='text-xs text-gray-600'>
                    Todos os dados são processados conforme Lei Geral de Proteção de Dados
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  Criptografia AES-256
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Audit Trail Completo
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Conforme CFM
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}

// Helper function for conditional class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
