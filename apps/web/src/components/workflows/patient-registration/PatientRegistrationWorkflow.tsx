/**
 * Patient Registration Workflow (T057)
 * Multi-step patient registration system for Brazilian aesthetic clinics
 *
 * Features:
 * - Multi-step form with healthcare validation
 * - Brazilian data formatting (CPF, phone, CEP)
 * - LGPD compliance with granular consent management
 * - Medical history collection for aesthetic treatments
 * - WCAG 2.1 AA+ accessibility compliance
 * - Mobile-first responsive design
 * - Real-time validation and error handling
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ChevronLeft, ChevronRight, Save, Shield, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { HealthcareButton } from '@/components/ui/healthcare/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare/healthcare-input';
import { HealthcareLoading } from '@/components/ui/healthcare/healthcare-loading';
import { useScreenReaderAnnouncer } from '@/hooks/accessibility/use-focus-management';
import { useMobileOptimization } from '@/hooks/accessibility/use-mobile-optimization';
import { cn } from '@/lib/utils';
import { formatBRPhone, formatCEP, formatCPF } from '@/utils/brazilian-formatters';

// Brazilian healthcare validation schemas
const personalInfoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  birthDate: z.string().refine(date => {
    const age = new Date().getFullYear() - new Date(date).getFullYear();
    return age >= 18 && age <= 120;
  }, 'Idade deve ser entre 18 e 120 anos'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
});

const addressSchema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  street: z.string().min(5, 'Rua deve ter pelo menos 5 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(3, 'Bairro deve ter pelo menos 3 caracteres'),
  city: z.string().min(3, 'Cidade deve ter pelo menos 3 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
});

const medicalInfoSchema = z.object({
  hasAllergies: z.boolean(),
  allergies: z.array(z.string()).optional(),
  hasMedications: z.boolean(),
  medications: z.array(z.string()).optional(),
  hasConditions: z.boolean(),
  conditions: z.array(z.string()).optional(),
  previousTreatments: z.array(z.object({
    treatment: z.string(),
    year: z.string(),
    clinic: z.string(),
  })).optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(3, 'Nome do contato deve ter pelo menos 3 caracteres'),
  relationship: z.string().min(3, 'Grau de parentesco deve ter pelo menos 3 caracteres'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone do contato inválido'),
});

const lgpdConsentSchema = z.object({
  dataProcessing: z.boolean().refine(
    val => val === true,
    'Consentimento de processamento é obrigatório',
  ),
  dataSharing: z.boolean(),
  marketing: z.boolean(),
  analytics: z.boolean(),
  retentionPeriod: z.enum(['1', '5', '10']),
});

const patientRegistrationSchema = z.object({
  personalInfo: personalInfoSchema,
  address: addressSchema,
  medicalInfo: medicalInfoSchema,
  emergencyContact: emergencyContactSchema,
  lgpdConsent: lgpdConsentSchema,
});

type PatientRegistrationData = z.infer<typeof patientRegistrationSchema>;

interface PatientRegistrationWorkflowProps {
  onSubmit: (data: PatientRegistrationData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<PatientRegistrationData>;
  isLoading?: boolean;
  className?: string;
  testId?: string;
}

type Step = 'personal' | 'address' | 'medical' | 'emergency' | 'consent' | 'review';

export const PatientRegistrationWorkflow: React.FC<PatientRegistrationWorkflowProps> = (_{
  onSubmit,_onCancel,_initialData,_isLoading = false,_className,_testId = 'patient-registration-workflow',_}) => {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announcePolite } = useScreenReaderAnnouncer();
  const { touchTargetSize } = useMobileOptimization();

  const form = useForm<PatientRegistrationData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      personalInfo: {
        name: '',
        cpf: '',
        birthDate: '',
        gender: 'female',
        phone: '',
        email: '',
        ...initialData?.personalInfo,
      },
      address: {
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: '',
        ...initialData?.address,
      },
      medicalInfo: {
        hasAllergies: false,
        allergies: [],
        hasMedications: false,
        medications: [],
        hasConditions: false,
        conditions: [],
        previousTreatments: [],
        ...initialData?.medicalInfo,
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        ...initialData?.emergencyContact,
      },
      lgpdConsent: {
        dataProcessing: false,
        dataSharing: false,
        marketing: false,
        analytics: false,
        retentionPeriod: '5',
        ...initialData?.lgpdConsent,
      },
    },
  });

  const medicalInfoFieldArray = useFieldArray({
    control: form.control,
    name: 'medicalInfo.previousTreatments',
  });

  const watchedValues = useWatch({
    control: form.control,
    name: ['medicalInfo.hasAllergies', 'medicalInfo.hasMedications', 'medicalInfo.hasConditions'],
  });

  const steps: Step[] = ['personal', 'address', 'medical', 'emergency', 'consent', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Announce step changes for screen readers
  useEffect(_() => {
    const stepNames = {
      personal: 'Informações Pessoais',
      address: 'Endereço',
      medical: 'Informações Médicas',
      emergency: 'Contato de Emergência',
      consent: 'LGPD e Consentimentos',
      review: 'Revisão',
    };
    announcePolite(`Passo ${currentStepIndex + 1} de ${steps.length}: ${stepNames[currentStep]}`);
  }, [currentStep, steps.length, announcePolite]);

  const nextStep = useCallback(_async () => {
    const fieldsToValidate = {
      personal: ['personalInfo'],
      address: ['address'],
      medical: ['medicalInfo'],
      emergency: ['emergencyContact'],
      consent: ['lgpdConsent'],
      review: [],
    };

    const isValid = await form.trigger(fieldsToValidate[currentStep] as any);

    if (isValid) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    } else {
      setError('Por favor, corrija os erros antes de continuar');
      announcePolite('Erros encontrados no formulário');
    }
  }, [form, currentStep, currentStepIndex, steps, announcePolite]);

  const previousStep = useCallback(_() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      setError(null);
    }
  }, [currentStepIndex, steps]);

  const handleSubmit = useCallback(async (data: PatientRegistrationData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      announcePolite('Enviando cadastro de paciente...');
      await onSubmit(data);
      announcePolite('Cadastro de paciente concluído com sucesso');
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar paciente';
      setError(errorMessage);
      announcePolite(`Erro no cadastro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, announcePolite]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className='space-y-4' role='group' aria-labelledby='personal-info-title'>
            <h3 id='personal-info-title' className='text-lg font-semibold'>
              Informações Pessoais
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium mb-1'>
                  Nome Completo *
                </label>
                <HealthcareInput
                  id='name'
                  {...form.register('personalInfo.name')}
                  placeholder='Maria Silva Santos'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.personalInfo?.name && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.personalInfo.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='cpf' className='block text-sm font-medium mb-1'>
                  CPF *
                </label>
                <HealthcareInput
                  id='cpf'
                  {...form.register('personalInfo.cpf')}
                  placeholder='000.000.000-00'
                  type='cpf'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.personalInfo?.cpf && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.personalInfo.cpf.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='birthDate' className='block text-sm font-medium mb-1'>
                  Data de Nascimento *
                </label>
                <HealthcareInput
                  id='birthDate'
                  {...form.register('personalInfo.birthDate')}
                  type='date'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.personalInfo?.birthDate && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.personalInfo.birthDate.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='gender' className='block text-sm font-medium mb-1'>
                  Gênero *
                </label>
                <HealthcareInput
                  id='gender'
                  {...form.register('personalInfo.gender')}
                  type='select'
                  options={[
                    { value: 'female', label: 'Feminino' },
                    { value: 'male', label: 'Masculino' },
                    { value: 'other', label: 'Outro' },
                  ]}
                  healthcareContext='patient-registration'
                  accessibilityAction='select'
                  aria-required='true'
                />
              </div>

              <div>
                <label htmlFor='phone' className='block text-sm font-medium mb-1'>
                  Telefone *
                </label>
                <HealthcareInput
                  id='phone'
                  {...form.register('personalInfo.phone')}
                  placeholder='(00) 00000-0000'
                  type='phone'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.personalInfo?.phone && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.personalInfo.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-1'>
                  E-mail *
                </label>
                <HealthcareInput
                  id='email'
                  {...form.register('personalInfo.email')}
                  placeholder='maria.silva@email.com'
                  type='email'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.personalInfo?.email && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.personalInfo.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className='space-y-4' role='group' aria-labelledby='address-title'>
            <h3 id='address-title' className='text-lg font-semibold'>
              Endereço
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='md:col-span-2'>
                <label htmlFor='cep' className='block text-sm font-medium mb-1'>
                  CEP *
                </label>
                <HealthcareInput
                  id='cep'
                  {...form.register('address.cep')}
                  placeholder='00000-000'
                  type='cep'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.cep && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.cep.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='street' className='block text-sm font-medium mb-1'>
                  Rua *
                </label>
                <HealthcareInput
                  id='street'
                  {...form.register('address.street')}
                  placeholder='Rua das Flores'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.street && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.street.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='number' className='block text-sm font-medium mb-1'>
                  Número *
                </label>
                <HealthcareInput
                  id='number'
                  {...form.register('address.number')}
                  placeholder='123'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.number && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.number.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='complement' className='block text-sm font-medium mb-1'>
                  Complemento
                </label>
                <HealthcareInput
                  id='complement'
                  {...form.register('address.complement')}
                  placeholder='Apto 101'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                />
              </div>

              <div>
                <label htmlFor='neighborhood' className='block text-sm font-medium mb-1'>
                  Bairro *
                </label>
                <HealthcareInput
                  id='neighborhood'
                  {...form.register('address.neighborhood')}
                  placeholder='Centro'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.neighborhood && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.neighborhood.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='city' className='block text-sm font-medium mb-1'>
                  Cidade *
                </label>
                <HealthcareInput
                  id='city'
                  {...form.register('address.city')}
                  placeholder='São Paulo'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.city && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.city.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='state' className='block text-sm font-medium mb-1'>
                  Estado *
                </label>
                <HealthcareInput
                  id='state'
                  {...form.register('address.state')}
                  placeholder='SP'
                  maxLength={2}
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.address?.state && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.address.state.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'medical':
        return (
          <div className='space-y-4' role='group' aria-labelledby='medical-info-title'>
            <h3 id='medical-info-title' className='text-lg font-semibold'>
              Informações Médicas
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    {...form.register('medicalInfo.hasAllergies')}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>Possui alergias?</span>
                </label>
              </div>

              {watchedValues[0] && (
                <div>
                  <label htmlFor='allergies' className='block text-sm font-medium mb-1'>
                    Liste suas alergias
                  </label>
                  <HealthcareInput
                    id='allergies'
                    {...form.register('medicalInfo.allergies')}
                    placeholder='Ex: Penicilina, Látex, etc.'
                    healthcareContext='patient-registration'
                    accessibilityAction='input'
                  />
                </div>
              )}

              <div>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    {...form.register('medicalInfo.hasMedications')}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>Usa medicamentos contínuos?</span>
                </label>
              </div>

              {watchedValues[1] && (
                <div>
                  <label htmlFor='medications' className='block text-sm font-medium mb-1'>
                    Liste seus medicamentos
                  </label>
                  <HealthcareInput
                    id='medications'
                    {...form.register('medicalInfo.medications')}
                    placeholder='Ex: Losartana 50mg, Metformina 850mg'
                    healthcareContext='patient-registration'
                    accessibilityAction='input'
                  />
                </div>
              )}

              <div>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    {...form.register('medicalInfo.hasConditions')}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>Possui condições médicas?</span>
                </label>
              </div>

              {watchedValues[2] && (
                <div>
                  <label htmlFor='conditions' className='block text-sm font-medium mb-1'>
                    Liste suas condições médicas
                  </label>
                  <HealthcareInput
                    id='conditions'
                    {...form.register('medicalInfo.conditions')}
                    placeholder='Ex: Diabetes, Hipertensão, etc.'
                    healthcareContext='patient-registration'
                    accessibilityAction='input'
                  />
                </div>
              )}

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Tratamentos estéticos anteriores</label>
                {medicalInfoFieldArray.fields.map(_(field,_index) => (
                  <div
                    key={field.id}
                    className='grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg'
                  >
                    <HealthcareInput
                      {...form.register(`medicalInfo.previousTreatments.${index}.treatment`)}
                      placeholder='Tratamento'
                      healthcareContext='patient-registration'
                      accessibilityAction='input'
                    />
                    <HealthcareInput
                      {...form.register(`medicalInfo.previousTreatments.${index}.year`)}
                      placeholder='Ano'
                      type='number'
                      healthcareContext='patient-registration'
                      accessibilityAction='input'
                    />
                    <HealthcareInput
                      {...form.register(`medicalInfo.previousTreatments.${index}.clinic`)}
                      placeholder='Clínica'
                      healthcareContext='patient-registration'
                      accessibilityAction='input'
                    />
                  </div>
                ))}
                <HealthcareButton
                  type='button'
                  variant='outline'
                  onClick={() =>
                    medicalInfoFieldArray.append({ treatment: '', year: '', clinic: '' })}
                  className='w-full'
                  healthcareContext='patient-registration'
                  accessibilityAction='add'
                >
                  Adicionar Tratamento
                </HealthcareButton>
              </div>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className='space-y-4' role='group' aria-labelledby='emergency-contact-title'>
            <h3 id='emergency-contact-title' className='text-lg font-semibold'>
              Contato de Emergência
            </h3>

            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label htmlFor='emergencyName' className='block text-sm font-medium mb-1'>
                  Nome do Contato *
                </label>
                <HealthcareInput
                  id='emergencyName'
                  {...form.register('emergencyContact.name')}
                  placeholder='João Silva Santos'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.emergencyContact?.name && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.emergencyContact.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='relationship' className='block text-sm font-medium mb-1'>
                  Grau de Parentesco *
                </label>
                <HealthcareInput
                  id='relationship'
                  {...form.register('emergencyContact.relationship')}
                  placeholder='Esposo(a), Pai, Mãe, etc.'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.emergencyContact?.relationship && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.emergencyContact.relationship.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='emergencyPhone' className='block text-sm font-medium mb-1'>
                  Telefone do Contato *
                </label>
                <HealthcareInput
                  id='emergencyPhone'
                  {...form.register('emergencyContact.phone')}
                  placeholder='(00) 00000-0000'
                  type='phone'
                  healthcareContext='patient-registration'
                  accessibilityAction='input'
                  aria-required='true'
                />
                {form.formState.errors.emergencyContact?.phone && (
                  <p className='text-sm text-destructive mt-1'>
                    {form.formState.errors.emergencyContact.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className='space-y-4' role='group' aria-labelledby='lgpd-consent-title'>
            <h3 id='lgpd-consent-title' className='text-lg font-semibold flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              LGPD e Consentimentos
            </h3>

            <div className='space-y-4'>
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h4 className='font-medium text-blue-900 mb-2'>
                  Proteção de Dados (LGPD)
                </h4>
                <p className='text-sm text-blue-800'>
                  Seus dados serão protegidos conforme a Lei Geral de Proteção de Dados (Lei
                  13.709/2018).
                </p>
              </div>

              <div>
                <label className='flex items-start space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50'>
                  <input
                    type='checkbox'
                    {...form.register('lgpdConsent.dataProcessing')}
                    className='rounded border-gray-300 mt-1'
                  />
                  <div className='text-sm'>
                    <span className='font-medium'>Consentimento para processamento de dados *</span>
                    <p className='text-gray-600 mt-1'>
                      Autorizo o processamento de meus dados para atendimento médico e administração
                      da clínica.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className='flex items-start space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50'>
                  <input
                    type='checkbox'
                    {...form.register('lgpdConsent.dataSharing')}
                    className='rounded border-gray-300 mt-1'
                  />
                  <div className='text-sm'>
                    <span className='font-medium'>Compartilhamento com profissionais de saúde</span>
                    <p className='text-gray-600 mt-1'>
                      Autorizo o compartilhamento de informações médicas com profissionais
                      envolvidos no meu tratamento.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className='flex items-start space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50'>
                  <input
                    type='checkbox'
                    {...form.register('lgpdConsent.marketing')}
                    className='rounded border-gray-300 mt-1'
                  />
                  <div className='text-sm'>
                    <span className='font-medium'>Comunicação de marketing</span>
                    <p className='text-gray-600 mt-1'>
                      Aceito receber informações sobre tratamentos e promoções da clínica.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className='flex items-start space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50'>
                  <input
                    type='checkbox'
                    {...form.register('lgpdConsent.analytics')}
                    className='rounded border-gray-300 mt-1'
                  />
                  <div className='text-sm'>
                    <span className='font-medium'>Análise de dados para melhoria</span>
                    <p className='text-gray-600 mt-1'>
                      Autorizo uso de dados anônimos para melhorar os serviços da clínica.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label htmlFor='retentionPeriod' className='block text-sm font-medium mb-1'>
                  Período de retenção dos dados *
                </label>
                <HealthcareInput
                  id='retentionPeriod'
                  {...form.register('lgpdConsent.retentionPeriod')}
                  type='select'
                  options={[
                    { value: '1', label: '1 ano' },
                    { value: '5', label: '5 anos (recomendado)' },
                    { value: '10', label: '10 anos' },
                  ]}
                  healthcareContext='patient-registration'
                  accessibilityAction='select'
                  aria-required='true'
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        const values = form.getValues();
        return (
          <div className='space-y-6' role='group' aria-labelledby='review-title'>
            <h3 id='review-title' className='text-lg font-semibold'>
              Revisão do Cadastro
            </h3>

            <div className='space-y-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Informações Pessoais</h4>
                <div className='text-sm space-y-1'>
                  <p>
                    <span className='font-medium'>Nome:</span> {values.personalInfo.name}
                  </p>
                  <p>
                    <span className='font-medium'>CPF:</span> {values.personalInfo.cpf}
                  </p>
                  <p>
                    <span className='font-medium'>Data de Nascimento:</span>{' '}
                    {values.personalInfo.birthDate}
                  </p>
                  <p>
                    <span className='font-medium'>Telefone:</span> {values.personalInfo.phone}
                  </p>
                  <p>
                    <span className='font-medium'>E-mail:</span> {values.personalInfo.email}
                  </p>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Endereço</h4>
                <div className='text-sm space-y-1'>
                  <p>
                    {values.address.street}, {values.address.number} {values.address.complement}
                  </p>
                  <p>
                    {values.address.neighborhood}, {values.address.city} - {values.address.state}
                  </p>
                  <p>CEP: {values.address.cep}</p>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Contato de Emergência</h4>
                <div className='text-sm space-y-1'>
                  <p>
                    <span className='font-medium'>Nome:</span> {values.emergencyContact.name}
                  </p>
                  <p>
                    <span className='font-medium'>Parentesco:</span>{' '}
                    {values.emergencyContact.relationship}
                  </p>
                  <p>
                    <span className='font-medium'>Telefone:</span> {values.emergencyContact.phone}
                  </p>
                </div>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>LGPD e Consentimentos</h4>
                <div className='text-sm space-y-1'>
                  <p>
                    <span className='font-medium'>Processamento:</span>{' '}
                    {values.lgpdConsent.dataProcessing ? '✓' : '✗'}
                  </p>
                  <p>
                    <span className='font-medium'>Compartilhamento:</span>{' '}
                    {values.lgpdConsent.dataSharing ? '✓' : '✗'}
                  </p>
                  <p>
                    <span className='font-medium'>Marketing:</span>{' '}
                    {values.lgpdConsent.marketing ? '✓' : '✗'}
                  </p>
                  <p>
                    <span className='font-medium'>Análise:</span>{' '}
                    {values.lgpdConsent.analytics ? '✓' : '✗'}
                  </p>
                  <p>
                    <span className='font-medium'>Retenção:</span>{' '}
                    {values.lgpdConsent.retentionPeriod} anos
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
              <div className='text-sm text-yellow-800'>
                <p className='font-medium'>Confirmação de cadastro</p>
                <p>
                  Ao confirmar, você declara que todas as informações fornecidas são verdadeiras e
                  autoriza o processamento de seus dados conforme os termos acima.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)} data-testid={testId}>
      {/* Progress Header */}
      <div
        className='mb-8'
        role='progressbar'
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={currentStepIndex + 1}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold'>Cadastro de Paciente</h2>
          <span className='text-sm text-muted-foreground'>
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
        </div>

        <div className='flex items-center space-x-2'>
          {steps.map(_(step,_index) => (
            <div
              key={step}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                index <= currentStepIndex ? 'bg-primary' : 'bg-gray-200',
              )}
              aria-hidden='true'
            />
          ))}
        </div>

        <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
          <span>Pessoal</span>
          <span>Endereço</span>
          <span>Médico</span>
          <span>Emergência</span>
          <span>LGPD</span>
          <span>Revisão</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className='mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg'
          role='alert'
        >
          <p className='text-sm text-destructive font-medium'>{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className='bg-white border rounded-lg p-6 mb-6'>
        {isSubmitting
          ? (
            <div className='flex items-center justify-center py-12'>
              <HealthcareLoading
                variant='spinner'
                size='lg'
                text='Processando cadastro...'
                healthcareContext='patient-registration'
              />
            </div>
          )
          : (
            renderStepContent()
          )}
      </div>

      {/* Navigation Buttons */}
      <div className='flex justify-between'>
        <HealthcareButton
          variant='outline'
          onClick={previousStep}
          disabled={currentStepIndex === 0 || isSubmitting}
          healthcareContext='patient-registration'
          accessibilityAction='previous'
          className={cn(
            touchTargetSize === 'large' && 'h-12 px-6',
          )}
        >
          <ChevronLeft className='h-4 w-4 mr-2' />
          Anterior
        </HealthcareButton>

        <div className='flex space-x-2'>
          {onCancel && (
            <HealthcareButton
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
              healthcareContext='patient-registration'
              accessibilityAction='cancel'
              className={cn(
                touchTargetSize === 'large' && 'h-12 px-6',
              )}
            >
              Cancelar
            </HealthcareButton>
          )}

          {currentStep === 'review'
            ? (
              <HealthcareButton
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting}
                healthcareContext='patient-registration'
                accessibilityAction='submit'
                className={cn(
                  touchTargetSize === 'large' && 'h-12 px-6',
                )}
              >
                <Save className='h-4 w-4 mr-2' />
                Confirmar Cadastro
              </HealthcareButton>
            )
            : (
              <HealthcareButton
                onClick={nextStep}
                disabled={isSubmitting}
                healthcareContext='patient-registration'
                accessibilityAction='next'
                className={cn(
                  touchTargetSize === 'large' && 'h-12 px-6',
                )}
              >
                Próximo
                <ChevronRight className='h-4 w-4 ml-2' />
              </HealthcareButton>
            )}
        </div>
      </div>
    </div>
  );
};

PatientRegistrationWorkflow.displayName = 'PatientRegistrationWorkflow';

export default PatientRegistrationWorkflow;
