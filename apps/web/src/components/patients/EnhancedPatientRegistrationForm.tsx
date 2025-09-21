'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@neonpro/ui';
import { cn } from '@neonpro/utils';

// Import our Brazilian validation schemas
import {
  type BasicPatient,
  BasicPatientSchema,
  type BrazilianAddress,
  BrazilianAddressSchema,
  type CompletePatientRegistration,
  CompletePatientRegistrationSchema,
  type PatientConsent,
  PatientConsentSchema,
  validateBrazilianPhone,
  validateCns,
  validateCpf,
} from './validation/brazilian-healthcare-schemas';

// Registration steps configuration
const REGISTRATION_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Dados pessoais do paciente',
    icon: User,
    required: true,
  },
  {
    id: 'address',
    title: 'Endereço',
    description: 'Endereço residencial',
    icon: MapPin,
    required: true,
  },
  {
    id: 'contact',
    title: 'Contato',
    description: 'Telefone e e-mail',
    icon: Phone,
    required: true,
  },
  {
    id: 'consent',
    title: 'Consentimento LGPD',
    description: 'Autorização para uso de dados',
    icon: Shield,
    required: true,
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Confirmar informações',
    icon: FileText,
    required: true,
  },
] as const;

type StepId = (typeof REGISTRATION_STEPS)[number]['id'];

interface EnhancedPatientRegistrationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompletePatientRegistration) => Promise<void>;
  initialData?: Partial<CompletePatientRegistration>;
  userRole: 'admin' | 'aesthetician' | 'coordinator';
  className?: string;
}

// Document formatting functions
const formatCpf = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCep = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

// Basic Information Step Component
const BasicInformationStep = () => {
  const form = useFormContext();

  const handleCpfChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    const formatted = formatCpf(value);
    if (formatted.length <= 14) onChange(formatted);
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='basicInfo.name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder='Ex: Maria Silva Santos' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='basicInfo.cpf'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input
                  placeholder='000.000.000-00'
                  value={field.value || ''}
                  onChange={e => handleCpfChange(e.target.value, field.onChange)}
                />
              </FormControl>
              {field.value && (
                <FormDescription
                  className={cn(
                    'text-xs flex items-center gap-1',
                    validateCpf(field.value)
                      ? 'text-green-600'
                      : 'text-red-600',
                  )}
                >
                  {validateCpf(field.value)
                    ? (
                      <>
                        <Check className='h-3 w-3' />
                        CPF válido
                      </>
                    )
                    : (
                      <>
                        <AlertTriangle className='h-3 w-3' />
                        CPF inválido
                      </>
                    )}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='basicInfo.birthDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento *</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='basicInfo.gender'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gênero *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o gênero' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='feminino'>Feminino</SelectItem>
                  <SelectItem value='masculino'>Masculino</SelectItem>
                  <SelectItem value='outro'>Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='cns'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNS (Cartão Nacional de Saúde)</FormLabel>
              <FormControl>
                <Input placeholder='000 0000 0000 0000' {...field} />
              </FormControl>
              <FormDescription>
                Número do Cartão Nacional de Saúde (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rg'
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input placeholder='Ex: 12.345.678-9' {...field} />
              </FormControl>
              <FormDescription>Registro Geral (opcional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Address Step Component
const AddressStep = () => {
  const form = useFormContext();

  const handleCepChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    const formatted = formatCep(value);
    if (formatted.length <= 9) onChange(formatted);
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='address.zipCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP *</FormLabel>
              <FormControl>
                <Input
                  placeholder='00000-000'
                  value={field.value || ''}
                  onChange={e => handleCepChange(e.target.value, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address.street'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Endereço *</FormLabel>
              <FormControl>
                <Input placeholder='Rua, Avenida, etc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='address.number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número *</FormLabel>
              <FormControl>
                <Input placeholder='123' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address.complement'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input placeholder='Apto, Bloco, etc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address.neighborhood'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro *</FormLabel>
              <FormControl>
                <Input placeholder='Centro, Vila...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='address.city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade *</FormLabel>
              <FormControl>
                <Input placeholder='São Paulo' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address.state'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o estado' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    'AC',
                    'AL',
                    'AP',
                    'AM',
                    'BA',
                    'CE',
                    'DF',
                    'ES',
                    'GO',
                    'MA',
                    'MT',
                    'MS',
                    'MG',
                    'PA',
                    'PB',
                    'PR',
                    'PE',
                    'PI',
                    'RJ',
                    'RN',
                    'RS',
                    'RO',
                    'RR',
                    'SC',
                    'SP',
                    'SE',
                    'TO',
                  ].map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Contact Step Component
const ContactStep = () => {
  const form = useFormContext();

  const handlePhoneChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    const formatted = formatPhone(value);
    if (formatted.length <= 15) onChange(formatted);
  };

  return (
    <div className='space-y-4'>
      <FormField
        control={form.control}
        name='basicInfo.phone'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input
                placeholder='(00) 00000-0000'
                value={field.value || ''}
                onChange={e => handlePhoneChange(e.target.value, field.onChange)}
              />
            </FormControl>
            {field.value && (
              <FormDescription
                className={cn(
                  'text-xs flex items-center gap-1',
                  validateBrazilianPhone(field.value)
                    ? 'text-green-600'
                    : 'text-red-600',
                )}
              >
                {validateBrazilianPhone(field.value)
                  ? (
                    <>
                      <Check className='h-3 w-3' />
                      Telefone válido
                    </>
                  )
                  : (
                    <>
                      <AlertTriangle className='h-3 w-3' />
                      Formato inválido
                    </>
                  )}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='basicInfo.email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail *</FormLabel>
            <FormControl>
              <Input type='email' placeholder='exemplo@email.com' {...field} />
            </FormControl>
            <FormDescription>
              E-mail para comunicações da clínica
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

// LGPD Consent Step Component
const ConsentStep = () => {
  const form = useFormContext();

  const consentPurposes = [
    {
      key: 'dataProcessing',
      title: 'Processamento de Dados Pessoais',
      description:
        'Autorizo o processamento dos meus dados pessoais para prestação de serviços estéticos, incluindo histórico médico, tratamentos realizados e agendamentos.',
      required: true,
      icon: Database,
    },
    {
      key: 'marketing',
      title: 'Marketing e Comunicação',
      description:
        'Autorizo o envio de materiais promocionais, informações sobre novos tratamentos, ofertas especiais e pesquisas de satisfação.',
      required: false,
      icon: Mail,
    },
    {
      key: 'thirdPartySharing',
      title: 'Compartilhamento com Terceiros',
      description:
        'Autorizo o compartilhamento de dados com laboratórios parceiros, fornecedores de equipamentos e profissionais de saúde quando necessário.',
      required: false,
      icon: Share,
    },
    {
      key: 'research',
      title: 'Pesquisa e Desenvolvimento',
      description:
        'Autorizo o uso de dados anonimizados para pesquisas científicas e desenvolvimento de novos tratamentos estéticos.',
      required: false,
      icon: FileText,
    },
    {
      key: 'telehealth',
      title: 'Telemedicina',
      description:
        'Autorizo consultas online, monitoramento remoto e acompanhamento de tratamentos através de plataformas digitais.',
      required: false,
      icon: Heart,
    },
  ];

  return (
    <div className='space-y-6'>
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          <strong>Lei Geral de Proteção de Dados (LGPD)</strong>
          <br />
          Em conformidade com a LGPD, precisamos do seu consentimento explícito para processar seus
          dados pessoais. Você pode revogar esses consentimentos a qualquer momento através do nosso
          sistema.
        </AlertDescription>
      </Alert>

      <div className='space-y-4'>
        {consentPurposes.map(purpose => (
          <Card
            key={purpose.key}
            className={cn(
              'border-2 transition-colors',
              form.watch(`consent.${purpose.key}`)
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200',
            )}
          >
            <CardContent className='p-4'>
              <FormField
                control={form.control}
                name={`consent.${purpose.key}`}
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='mt-1'
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none flex-1'>
                      <div className='flex items-center gap-2'>
                        <purpose.icon className='h-4 w-4 text-blue-600' />
                        <FormLabel className='text-sm font-medium'>
                          {purpose.title}
                          {purpose.required && (
                            <Badge variant='outline' className='ml-2 text-xs'>
                              Obrigatório
                            </Badge>
                          )}
                        </FormLabel>
                      </div>
                      <FormDescription className='text-xs text-muted-foreground'>
                        {purpose.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className='space-y-4'>
        <FormField
          control={form.control}
          name='termsAccepted'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel className='text-sm font-medium'>
                  Aceito os Termos de Uso *
                </FormLabel>
                <FormDescription className='text-xs'>
                  Li e concordo com os{' '}
                  <button
                    type='button'
                    className='text-blue-600 hover:underline'
                  >
                    Termos de Uso
                  </button>{' '}
                  da clínica estética.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='privacyPolicyAccepted'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel className='text-sm font-medium'>
                  Aceito a Política de Privacidade *
                </FormLabel>
                <FormDescription className='text-xs'>
                  Li e concordo com a{' '}
                  <button
                    type='button'
                    className='text-blue-600 hover:underline'
                  >
                    Política de Privacidade
                  </button>{' '}
                  sobre o tratamento dos meus dados pessoais.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep = () => {
  const form = useFormContext();
  const formData = form.getValues();

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Revisão das Informações</h3>
        <p className='text-sm text-muted-foreground'>
          Verifique se todas as informações estão corretas antes de finalizar o cadastro
        </p>
      </div>

      <div className='grid gap-4'>
        {/* Basic Information */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <User className='h-4 w-4' />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm space-y-2'>
            <div>
              <strong>Nome:</strong> {formData.basicInfo?.name}
            </div>
            <div>
              <strong>CPF:</strong> {formData.basicInfo?.cpf}
            </div>
            <div>
              <strong>Data de Nascimento:</strong> {formData.basicInfo?.birthDate
                && format(new Date(formData.basicInfo.birthDate), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
            </div>
            <div>
              <strong>Gênero:</strong> {formData.basicInfo?.gender}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm space-y-2'>
            <div>
              <strong>Endereço:</strong> {formData.address?.street}, {formData.address?.number}
              {formData.address?.complement
                && `, ${formData.address.complement}`}
            </div>
            <div>
              <strong>Bairro:</strong> {formData.address?.neighborhood}
            </div>
            <div>
              <strong>Cidade:</strong> {formData.address?.city} - {formData.address?.state}
            </div>
            <div>
              <strong>CEP:</strong> {formData.address?.zipCode}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Phone className='h-4 w-4' />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm space-y-2'>
            <div>
              <strong>Telefone:</strong> {formData.basicInfo?.phone}
            </div>
            <div>
              <strong>E-mail:</strong> {formData.basicInfo?.email}
            </div>
          </CardContent>
        </Card>

        {/* Consent Summary */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Shield className='h-4 w-4' />
              Consentimentos LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                {formData.consent?.dataProcessing
                  ? <Check className='h-3 w-3 text-green-600' />
                  : <X className='h-3 w-3 text-red-600' />}
                <span>Processamento de Dados Pessoais</span>
              </div>
              <div className='flex items-center gap-2'>
                {formData.consent?.marketing
                  ? <Check className='h-3 w-3 text-green-600' />
                  : <X className='h-3 w-3 text-red-600' />}
                <span>Marketing e Comunicação</span>
              </div>
              <div className='flex items-center gap-2'>
                {formData.consent?.thirdPartySharing
                  ? <Check className='h-3 w-3 text-green-600' />
                  : <X className='h-3 w-3 text-red-600' />}
                <span>Compartilhamento com Terceiros</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export function EnhancedPatientRegistrationForm({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  userRole,
  className,
}: EnhancedPatientRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompletePatientRegistration>({
    resolver: zodResolver(CompletePatientRegistrationSchema),
    defaultValues: {
      basicInfo: {
        name: '',
        cpf: '',
        birthDate: '',
        gender: 'feminino',
        phone: '',
        email: '',
      },
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: 'SP',
        zipCode: '',
      },
      consent: {
        dataProcessing: false,
        marketing: false,
        thirdPartySharing: false,
        research: false,
        telehealth: false,
        consentDate: new Date(),
        ipAddress: '',
        userAgent: '',
      },
      cns: '',
      rg: '',
      termsAccepted: false,
      privacyPolicyAccepted: false,
      ...initialData,
    },
  });

  const currentStepData = REGISTRATION_STEPS[currentStep];
  const progress = ((currentStep + 1) / REGISTRATION_STEPS.length) * 100;

  const handleNext = async () => {
    // Validate current step before proceeding
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields);

    if (isValid && currentStep < REGISTRATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: CompletePatientRegistration) => {
    setIsSubmitting(true);
    try {
      // Add consent metadata
      const enhancedData = {
        ...data,
        consent: {
          ...data.consent,
          consentDate: new Date(),
          ipAddress: '127.0.0.1', // This should be obtained from the request
          userAgent: navigator.userAgent,
        },
      };

      await onSubmit(enhancedData);
      onOpenChange(false);
      form.reset();
      setCurrentStep(0);
    } catch (_error) {
      console.error('Erro ao cadastrar paciente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepFields = (
    step: number,
  ): (keyof CompletePatientRegistration)[] => {
    switch (step) {
      case 0:
        return ['basicInfo']; // Basic info
      case 1:
        return ['address']; // Address
      case 2:
        return ['basicInfo']; // Contact (phone/email in basicInfo)
      case 3:
        return ['consent', 'termsAccepted', 'privacyPolicyAccepted']; // Consent
      case 4:
        return []; // Review
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInformationStep />;
      case 1:
        return <AddressStep />;
      case 2:
        return <ContactStep />;
      case 3:
        return <ConsentStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-4xl max-h-[90vh] overflow-y-auto', className)}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Cadastro de Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do paciente seguindo as etapas abaixo
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>
              Etapa {currentStep + 1} de {REGISTRATION_STEPS.length}
            </span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step Navigation */}
        <div className='flex justify-between'>
          {REGISTRATION_STEPS.map((step, _index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center space-y-2 text-center flex-1',
                  isActive && 'text-blue-600',
                  isCompleted && 'text-green-600',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2',
                    isActive && 'border-blue-600 bg-blue-50',
                    isCompleted && 'border-green-600 bg-green-50',
                    !isActive && !isCompleted && 'border-gray-300 bg-gray-50',
                  )}
                >
                  {isCompleted ? <Check className='w-4 h-4' /> : <Icon className='w-4 h-4' />}
                </div>
                <div className='text-xs font-medium hidden md:block'>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <currentStepData.icon className='h-5 w-5' />
                  {currentStepData.title}
                </CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className='mr-2 h-4 w-4' />
                Anterior
              </Button>

              {currentStep === REGISTRATION_STEPS.length - 1
                ? (
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting
                      ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Cadastrando...
                        </>
                      )
                      : (
                        <>
                          <Check className='mr-2 h-4 w-4' />
                          Finalizar Cadastro
                        </>
                      )}
                  </Button>
                )
                : (
                  <Button type='button' onClick={handleNext}>
                    Próximo
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </Button>
                )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedPatientRegistrationForm;
