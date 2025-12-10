'use client';

import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { useCreatePatient } from '@/hooks/usePatients';
import { zodResolver } from '@hookform/resolvers/zod';
import {
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
  Textarea,
} from '@neonpro/ui';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Loader2,
  Phone,
  Shield,
  Upload,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FileUploadIntegration, type UploadedFile } from './FileUploadIntegration';

// Step 1: Basic Information Schema
const basicInfoSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  preferredName: z.string().optional(),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say'], {
    required_error: 'Selecione o gênero',
  }),
});

// Step 2: Contact & Address Schema
const contactAddressSchema = z.object({
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email deve ter um formato válido').optional().or(z.literal('')),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos').optional().or(z.literal('')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Step 3: Documents & Identity Schema
const documentsSchema = z.object({
  cpf: z.string().optional().or(z.literal('')),
  rg: z.string().optional().or(z.literal('')),
  insuranceProvider: z.string().optional().or(z.literal('')),
  insuranceNumber: z.string().optional().or(z.literal('')),
});

// Step 4: Medical Information Schema
const medicalInfoSchema = z.object({
  allergies: z.string().optional().or(z.literal('')),
  medications: z.string().optional().or(z.literal('')),
  medicalConditions: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactRelation: z.string().optional().or(z.literal('')),
});

// Step 5: LGPD Consent Schema
const consentSchema = z.object({
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: 'Consentimento para processamento de dados é obrigatório',
  }),
  marketingConsent: z.boolean().default(false),
  dataSharingConsent: z.boolean().default(false),
  photoVideoConsent: z.boolean().default(false),
  researchConsent: z.boolean().default(false),
});

// Combined schema for all steps
const patientRegistrationSchema = z.object({
  ...basicInfoSchema.shape,
  ...contactAddressSchema.shape,
  ...documentsSchema.shape,
  ...medicalInfoSchema.shape,
  ...consentSchema.shape,
});

type PatientRegistrationData = z.infer<typeof patientRegistrationSchema>;

interface PatientRegistrationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onPatientCreated?: (patient: any) => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Informações Básicas',
    description: 'Nome, data de nascimento e gênero',
    icon: User,
    schema: basicInfoSchema,
  },
  {
    id: 2,
    title: 'Contato e Endereço',
    description: 'Telefone, email e endereço',
    icon: Phone,
    schema: contactAddressSchema,
  },
  {
    id: 3,
    title: 'Documentos',
    description: 'CPF, RG e informações do convênio',
    icon: CreditCard,
    schema: documentsSchema,
  },
  {
    id: 4,
    title: 'Informações Médicas',
    description: 'Alergias, medicamentos e contato de emergência',
    icon: FileText,
    schema: medicalInfoSchema,
  },
  {
    id: 5,
    title: 'Documentos Médicos',
    description: 'Upload de exames e documentos',
    icon: Upload,
    schema: z.object({}), // No validation needed for file upload
  },
  {
    id: 6,
    title: 'Consentimento LGPD',
    description: 'Autorização para uso dos dados',
    icon: Shield,
    schema: consentSchema,
  },
];

export function PatientRegistrationWizard({
  open,
  onOpenChange,
  clinicId,
  onPatientCreated,
}: PatientRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const createPatientMutation = useCreatePatient();

  const form = useForm<PatientRegistrationData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      fullName: '',
      preferredName: '',
      birthDate: '',
      gender: undefined,
      phone: '',
      email: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cpf: '',
      rg: '',
      insuranceProvider: '',
      insuranceNumber: '',
      allergies: '',
      medications: '',
      medicalConditions: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      dataProcessingConsent: false,
      marketingConsent: false,
      dataSharingConsent: false,
      photoVideoConsent: false,
      researchConsent: false,
    },
    mode: 'onChange',
  });

  // Auto-save functionality (FR-004)
  const autoSave = useFormAutoSave('patient-registration-form');

  // Watch form values for auto-save
  const formValues = form.watch();

  // Auto-save form data when values change
  useEffect(() => {
    if (open) {
      autoSave.saveFormData(formValues);
    }
  }, [formValues, open, autoSave]);

  // Load saved data when dialog opens
  useEffect(() => {
    if (open && autoSave.hasSavedData && autoSave.savedData) {
      // Show recovery option
      if (
        autoSave.canRecover && autoSave.recoveryAge && autoSave.recoveryAge < 24 * 60 * 60 * 1000
      ) {
        const ageInMinutes = Math.floor(autoSave.recoveryAge / (1000 * 60));
        toast.info(
          `Dados salvos automaticamente há ${ageInMinutes} minutos. Deseja recuperar?`,
          {
            action: {
              label: 'Recuperar',
              onClick: () => {
                if (autoSave.savedData) {
                  form.reset(autoSave.savedData as PatientRegistrationData);
                  toast.success('Dados recuperados com sucesso!');
                }
              },
            },
            duration: 10000,
          },
        );
      }
    }
  }, [open, autoSave, form]);

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    const currentSchema = currentStepData?.schema;
    if (!currentSchema) return false;

    const result = await form.trigger(Object.keys(currentSchema.shape) as any);

    if (result && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    return result;
  }, [currentStep, currentStepData, form, completedSteps]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId <= currentStep || completedSteps.includes(stepId - 1)) {
      setCurrentStep(stepId);
    }
  };

  const onSubmit = async (data: PatientRegistrationData) => {
    setIsSubmitting(true);

    try {
      // Transform data for API
      const patientData = {
        fullName: data.fullName,
        preferredName: data.preferredName || undefined,
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone.replace(/\D/g, ''),
        email: data.email || undefined,
        cpf: data.cpf?.replace(/\D/g, '') || undefined,
        rg: data.rg || undefined,
        address: data.street
          ? {
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            cep: data.cep?.replace(/\D/g, ''),
          }
          : undefined,
        insuranceProvider: data.insuranceProvider || undefined,
        insuranceNumber: data.insuranceNumber || undefined,
        allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()) : undefined,
        medications: data.medications ? data.medications.split(',').map(m => m.trim()) : undefined,
        medicalConditions: data.medicalConditions
          ? data.medicalConditions.split(',').map(c => c.trim())
          : undefined,
        emergencyContact: data.emergencyContactName
          ? {
            name: data.emergencyContactName,
            phone: data.emergencyContactPhone,
            relationship: data.emergencyContactRelation,
          }
          : undefined,
        lgpdConsentGiven: data.dataProcessingConsent,
        marketingConsent: data.marketingConsent,
        dataSharingConsent: data.dataSharingConsent,
        photoVideoConsent: data.photoVideoConsent,
        researchConsent: data.researchConsent,
      };

      const newPatient = await createPatientMutation.mutateAsync({
        data: patientData,
        clinicId,
      });

      onPatientCreated?.(newPatient);
      onOpenChange(false);

      // Reset form and clear auto-saved data
      form.reset();
      setCurrentStep(1);
      setCompletedSteps([]);
      autoSave.clearSavedData();

      toast.success('Paciente cadastrado com sucesso!');
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao cadastrar paciente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep(1);
    setCompletedSteps([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            Cadastrar Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do paciente seguindo as etapas abaixo
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>Etapa {currentStep} de {STEPS.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step Navigation */}
        <div className='flex justify-between items-center py-4 border-b'>
          {STEPS.map((step, _index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isAccessible = step.id <= currentStep || completedSteps.includes(step.id - 1);

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : isAccessible
                    ? 'hover:bg-muted'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className='relative'>
                  {isCompleted
                    ? (
                      <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                        <Check className='w-4 h-4 text-white' />
                      </div>
                    )
                    : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-primary-foreground text-primary' : 'bg-muted'
                        }`}
                      >
                        <Icon className='w-4 h-4' />
                      </div>
                    )}
                </div>
                <div className='text-center'>
                  <div className='text-xs font-medium'>{step.title}</div>
                  <div className='text-xs opacity-70 hidden sm:block'>{step.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='min-h-[400px] overflow-y-auto'>
              {/* Step Content will be rendered here */}
              {currentStep === 1 && <BasicInformationStep form={form} />}
              {currentStep === 2 && <ContactAddressStep form={form} />}
              {currentStep === 3 && <DocumentsStep form={form} />}
              {currentStep === 4 && <MedicalInformationStep form={form} />}
              {currentStep === 5 && (
                <FileUploadStep
                  uploadedFiles={uploadedFiles}
                  onFilesUploaded={files => setUploadedFiles(prev => [...prev, ...files])}
                  onFileRemoved={fileId =>
                    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))}
                />
              )}
              {currentStep === 6 && <ConsentStep form={form} />}
            </div>

            {/* Navigation Buttons */}
            <div className='flex justify-between items-center pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className='w-4 h-4 mr-2' />
                Anterior
              </Button>

              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                >
                  Cancelar
                </Button>

                {currentStep < STEPS.length
                  ? (
                    <Button
                      type='button'
                      onClick={handleNext}
                    >
                      Próximo
                      <ChevronRight className='w-4 h-4 ml-2' />
                    </Button>
                  )
                  : (
                    <Button
                      type='submit'
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                      Cadastrar Paciente
                    </Button>
                  )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Basic Information Component
function BasicInformationStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='w-5 h-5' />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Digite o nome completo'
                    {...field}
                    aria-describedby='fullName-description'
                  />
                </FormControl>
                <FormDescription id='fullName-description'>
                  Nome completo como consta nos documentos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='preferredName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Preferido</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Como gostaria de ser chamado(a)'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Nome usado no atendimento (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='birthDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento *</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    {...field}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='gender'
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
                    <SelectItem value='male'>Masculino</SelectItem>
                    <SelectItem value='female'>Feminino</SelectItem>
                    <SelectItem value='non-binary'>Não-binário</SelectItem>
                    <SelectItem value='prefer-not-to-say'>Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContactAddressStep({ form }: { form: any }) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Format phone number as user types
  const formatPhone = (value: string) => {
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length <= 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Format CEP as user types
  const formatCep = (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Lookup address by CEP
  const lookupCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        form.setValue('street', data.logradouro || '');
        form.setValue('neighborhood', data.bairro || '');
        form.setValue('city', data.localidade || '');
        form.setValue('state', data.uf || '');
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (_error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Phone className='w-5 h-5' />
          Contato e Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Contact Information */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Informações de Contato</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='(11) 99999-9999'
                      {...field}
                      onChange={e => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Telefone principal para contato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='email@exemplo.com'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email para comunicações (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Endereço</h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='cep'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='00000-000'
                        {...field}
                        onChange={e => {
                          const formatted = formatCep(e.target.value);
                          field.onChange(formatted);
                          if (formatted.replace(/\D/g, '').length === 8) {
                            lookupCep(formatted);
                          }
                        }}
                      />
                      {isLoadingCep && (
                        <Loader2 className='absolute right-3 top-3 h-4 w-4 animate-spin' />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    CEP para busca automática do endereço
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Rua, Avenida, etc.'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <FormField
              control={form.control}
              name='number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='123'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='complement'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Apto, Sala, etc.'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='neighborhood'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Bairro'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Cidade'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem className='md:w-1/4'>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='UF' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='AC'>Acre</SelectItem>
                    <SelectItem value='AL'>Alagoas</SelectItem>
                    <SelectItem value='AP'>Amapá</SelectItem>
                    <SelectItem value='AM'>Amazonas</SelectItem>
                    <SelectItem value='BA'>Bahia</SelectItem>
                    <SelectItem value='CE'>Ceará</SelectItem>
                    <SelectItem value='DF'>Distrito Federal</SelectItem>
                    <SelectItem value='ES'>Espírito Santo</SelectItem>
                    <SelectItem value='GO'>Goiás</SelectItem>
                    <SelectItem value='MA'>Maranhão</SelectItem>
                    <SelectItem value='MT'>Mato Grosso</SelectItem>
                    <SelectItem value='MS'>Mato Grosso do Sul</SelectItem>
                    <SelectItem value='MG'>Minas Gerais</SelectItem>
                    <SelectItem value='PA'>Pará</SelectItem>
                    <SelectItem value='PB'>Paraíba</SelectItem>
                    <SelectItem value='PR'>Paraná</SelectItem>
                    <SelectItem value='PE'>Pernambuco</SelectItem>
                    <SelectItem value='PI'>Piauí</SelectItem>
                    <SelectItem value='RJ'>Rio de Janeiro</SelectItem>
                    <SelectItem value='RN'>Rio Grande do Norte</SelectItem>
                    <SelectItem value='RS'>Rio Grande do Sul</SelectItem>
                    <SelectItem value='RO'>Rondônia</SelectItem>
                    <SelectItem value='RR'>Roraima</SelectItem>
                    <SelectItem value='SC'>Santa Catarina</SelectItem>
                    <SelectItem value='SP'>São Paulo</SelectItem>
                    <SelectItem value='SE'>Sergipe</SelectItem>
                    <SelectItem value='TO'>Tocantins</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentsStep({ form }: { form: any }) {
  // Format CPF as user types
  const formatCpf = (value: string) => {
    const cleanCpf = value.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Validate CPF algorithm
  const validateCpf = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;

    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;

    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='w-5 h-5' />
          Documentos e Convênio
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Personal Documents */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Documentos Pessoais</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='cpf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='000.000.000-00'
                      {...field}
                      onChange={e => {
                        const formatted = formatCpf(e.target.value);
                        field.onChange(formatted);

                        // Validate CPF when complete
                        if (formatted.replace(/\D/g, '').length === 11) {
                          const isValid = validateCpf(formatted);
                          if (!isValid) {
                            form.setError('cpf', {
                              type: 'manual',
                              message: 'CPF inválido',
                            });
                          } else {
                            form.clearErrors('cpf');
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Cadastro de Pessoa Física (opcional)
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
                    <Input
                      placeholder='00.000.000-0'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Registro Geral (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Insurance Information */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Informações do Convênio</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='insuranceProvider'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Convênio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o convênio' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='particular'>Particular</SelectItem>
                      <SelectItem value='unimed'>Unimed</SelectItem>
                      <SelectItem value='bradesco'>Bradesco Saúde</SelectItem>
                      <SelectItem value='amil'>Amil</SelectItem>
                      <SelectItem value='sulamerica'>SulAmérica</SelectItem>
                      <SelectItem value='hapvida'>Hapvida</SelectItem>
                      <SelectItem value='notredame'>NotreDame Intermédica</SelectItem>
                      <SelectItem value='prevent'>Prevent Senior</SelectItem>
                      <SelectItem value='golden'>Golden Cross</SelectItem>
                      <SelectItem value='outros'>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Plano de saúde do paciente (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='insuranceNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Carteirinha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Número do cartão do convênio'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número identificador no convênio (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicalInformationStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='w-5 h-5' />
          Informações Médicas
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Medical History */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Histórico Médico</h4>
          <div className='grid grid-cols-1 gap-4'>
            <FormField
              control={form.control}
              name='allergies'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Liste as alergias conhecidas (separadas por vírgula)'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: Penicilina, Dipirona, Látex (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='medications'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos em Uso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Liste os medicamentos atuais (separados por vírgula)'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: Losartana 50mg, Metformina 850mg (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='medicalConditions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições Médicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Liste condições médicas relevantes (separadas por vírgula)'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: Diabetes, Hipertensão, Asma (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>Contato de Emergência</h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='emergencyContactName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nome do contato'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Pessoa para contatar em emergências (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='emergencyContactPhone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='(11) 99999-9999'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Telefone do contato de emergência
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='emergencyContactRelation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Relação' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='pai'>Pai</SelectItem>
                      <SelectItem value='mae'>Mãe</SelectItem>
                      <SelectItem value='conjuge'>Cônjuge</SelectItem>
                      <SelectItem value='filho'>Filho(a)</SelectItem>
                      <SelectItem value='irmao'>Irmão(ã)</SelectItem>
                      <SelectItem value='amigo'>Amigo(a)</SelectItem>
                      <SelectItem value='outros'>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Relação com o paciente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConsentStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='w-5 h-5' />
          Consentimento LGPD
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
          <h4 className='text-sm font-medium text-blue-900 dark:text-blue-100 mb-2'>
            Lei Geral de Proteção de Dados (LGPD)
          </h4>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            De acordo com a LGPD, precisamos do seu consentimento para coletar, processar e
            armazenar seus dados pessoais. Você pode retirar seu consentimento a qualquer momento.
          </p>
        </div>

        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='dataProcessingConsent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm font-medium'>
                    Consentimento para Processamento de Dados *
                  </FormLabel>
                  <FormDescription>
                    Autorizo o processamento dos meus dados pessoais para fins de atendimento
                    médico, agendamento de consultas e comunicações relacionadas ao tratamento.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='marketingConsent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm font-medium'>
                    Comunicações de Marketing
                  </FormLabel>
                  <FormDescription>
                    Autorizo o envio de comunicações promocionais, newsletters e informações sobre
                    novos tratamentos e serviços por email, SMS ou WhatsApp.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dataSharingConsent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm font-medium'>
                    Compartilhamento com Parceiros
                  </FormLabel>
                  <FormDescription>
                    Autorizo o compartilhamento dos meus dados com laboratórios, convênios e outros
                    profissionais de saúde quando necessário para o tratamento.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='photoVideoConsent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm font-medium'>
                    Uso de Imagem
                  </FormLabel>
                  <FormDescription>
                    Autorizo o uso da minha imagem (fotos e vídeos) para fins médicos, documentação
                    de tratamentos e casos clínicos.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='researchConsent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm font-medium'>
                    Pesquisa e Estudos
                  </FormLabel>
                  <FormDescription>
                    Autorizo o uso dos meus dados anonimizados para pesquisas científicas, estudos
                    estatísticos e melhoria dos serviços oferecidos.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className='bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800'>
          <p className='text-sm text-amber-800 dark:text-amber-200'>
            <strong>Importante:</strong>{' '}
            Você pode retirar seu consentimento a qualquer momento entrando em contato conosco.
            Alguns serviços podem ser limitados caso você retire consentimentos essenciais para o
            atendimento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FileUploadStep({
  uploadedFiles,
  onFilesUploaded,
  onFileRemoved,
}: {
  uploadedFiles: UploadedFile[];
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='w-5 h-5' />
          Documentos Médicos
        </CardTitle>
        <CardDescription>
          Faça upload de exames, laudos médicos, carteirinha do plano de saúde e outros documentos
          importantes. Esta etapa é opcional, mas recomendada para um atendimento mais completo.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
          <h4 className='text-sm font-medium text-blue-900 dark:text-blue-100 mb-2'>
            Tipos de Documentos Aceitos
          </h4>
          <ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
            <li>• Exames laboratoriais e de imagem</li>
            <li>• Laudos e relatórios médicos</li>
            <li>• Carteirinha do plano de saúde</li>
            <li>• Receitas médicas</li>
            <li>• Documentos de identidade (RG, CPF, CNH)</li>
            <li>• Outros documentos médicos relevantes</li>
          </ul>
        </div>

        <FileUploadIntegration
          category='medical'
          maxFiles={10}
          maxFileSize={15} // 15MB
          onFilesUploaded={onFilesUploaded}
          onFileRemoved={onFileRemoved}
          className='w-full'
        />

        {uploadedFiles.length > 0 && (
          <div className='bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800'>
            <p className='text-sm text-green-800 dark:text-green-200'>
              <strong>Sucesso!</strong> {uploadedFiles.length}{' '}
              arquivo(s) enviado(s) com segurança. Seus documentos estão protegidos e serão
              acessíveis apenas pela equipe médica autorizada.
            </p>
          </div>
        )}

        <div className='bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800'>
          <p className='text-sm text-amber-800 dark:text-amber-200'>
            <strong>Privacidade e Segurança:</strong>{' '}
            Todos os documentos são armazenados com criptografia e seguem as normas da LGPD. Apenas
            profissionais autorizados terão acesso aos seus documentos médicos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
