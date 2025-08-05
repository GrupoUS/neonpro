// ============================================================================
// Supplier Form Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier creation and editing form with validation,
// multi-step wizard, and real-time validation for NeonPro
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';

import {
  Supplier,
  SupplierStatus,
  SupplierCategory,
  PaymentTerms,
  RiskLevel,
  ContactInfo,
  Address,
  Certification,
  SupplierFormData,
  SupplierSchemas
} from '@/lib/types/supplier';
import { useSuppliers } from '@/lib/hooks/use-supplier';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SupplierFormProps {
  supplier?: Supplier;
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (supplier: Supplier) => void;
  mode?: 'create' | 'edit';
}

interface FormStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length !== 14) return false;
  
  // Basic CNPJ validation algorithm
  let sum = 0;
  let multiplier = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  const remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCNPJ.charAt(12)) !== firstDigit) return false;
  
  sum = 0;
  multiplier = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  
  const remainder2 = sum % 11;
  const secondDigit = remainder2 < 2 ? 0 : 11 - remainder2;
  
  return parseInt(cleanCNPJ.charAt(13)) === secondDigit;
};

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Check for same digits
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// ============================================================================
// FORM STEPS CONFIGURATION
// ============================================================================

const FORM_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Nome, categoria e informações legais',
    icon: <Building2 className="h-5 w-5" />,
    fields: ['name', 'legal_name', 'cnpj', 'cpf', 'category', 'subcategories']
  },
  {
    id: 'contact',
    title: 'Contatos',
    description: 'Contatos principais e secundários',
    icon: <User className="h-5 w-5" />,
    fields: ['primary_contact', 'secondary_contacts']
  },
  {
    id: 'address',
    title: 'Endereços',
    description: 'Endereço principal e de cobrança',
    icon: <MapPin className="h-5 w-5" />,
    fields: ['address', 'billing_address']
  },
  {
    id: 'business',
    title: 'Negócios',
    description: 'Termos comerciais e financeiros',
    icon: <TrendingUp className="h-5 w-5" />,
    fields: ['payment_terms', 'currency', 'early_payment_discount', 'credit_rating']
  },
  {
    id: 'compliance',
    title: 'Compliance',
    description: 'Certificações e conformidade',
    icon: <Shield className="h-5 w-5" />,
    fields: ['certifications', 'regulatory_compliance', 'anvisa_registration']
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SupplierForm({
  supplier,
  clinicId,
  open,
  onOpenChange,
  onSuccess,
  mode = 'create'
}: SupplierFormProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data management
  const {
    createSupplier,
    updateSupplier,
    isCreating,
    isUpdating
  } = useSuppliers(clinicId);

  // Form setup
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchemas.Supplier),
    defaultValues: {
      name: supplier?.name || '',
      legal_name: supplier?.legal_name || '',
      cnpj: supplier?.cnpj || '',
      cpf: supplier?.cpf || '',
      category: supplier?.category || SupplierCategory.MEDICAL_EQUIPMENT,
      subcategories: supplier?.subcategories || [],
      status: supplier?.status || SupplierStatus.PENDING_VERIFICATION,
      primary_contact: supplier?.primary_contact || {
        id: '',
        name: '',
        email: '',
        phone: '',
        is_primary: true,
        preferred_contact_method: 'email'
      },
      secondary_contacts: supplier?.secondary_contacts || [],
      website: supplier?.website || '',
      registration_number: supplier?.registration_number || '',
      tax_id: supplier?.tax_id || '',
      address: supplier?.address || {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Brasil'
      },
      billing_address: supplier?.billing_address,
      performance_score: supplier?.performance_score || 0,
      quality_rating: supplier?.quality_rating || 0,
      reliability_score: supplier?.reliability_score || 0,
      cost_competitiveness: supplier?.cost_competitiveness || 0,
      credit_rating: supplier?.credit_rating || '',
      payment_terms: supplier?.payment_terms || PaymentTerms.NET_30,
      currency: supplier?.currency || 'BRL',
      early_payment_discount: supplier?.early_payment_discount || 0,
      risk_level: supplier?.risk_level || RiskLevel.MEDIUM,
      risk_factors: supplier?.risk_factors || [],
      certifications: supplier?.certifications || [],
      regulatory_compliance: supplier?.regulatory_compliance || false,
      anvisa_registration: supplier?.anvisa_registration || '',
      created_by: supplier?.created_by || '',
      clinic_id: clinicId,
      tags: supplier?.tags || [],
      notes: supplier?.notes || ''
    }
  });

  const { control, handleSubmit, formState, watch, setValue, trigger } = form;
  const { errors, isValid } = formState;

  // Field arrays for dynamic forms
  const {
    fields: secondaryContactFields,
    append: appendSecondaryContact,
    remove: removeSecondaryContact
  } = useFieldArray({
    control,
    name: 'secondary_contacts'
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  });

  const {
    fields: riskFactorFields,
    append: appendRiskFactor,
    remove: removeRiskFactor
  } = useFieldArray({
    control,
    name: 'risk_factors'
  });

  // Watch form values for validation
  const watchedValues = watch();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentStepConfig = FORM_STEPS[currentStep];
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const canProceed = completedSteps.includes(currentStep) || validateCurrentStep();
  const formProgress = ((completedSteps.length + (canProceed ? 1 : 0)) / FORM_STEPS.length) * 100;

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  function validateCurrentStep(): boolean {
    const stepFields = FORM_STEPS[currentStep].fields;
    const currentStepErrors = Object.keys(errors).filter(field => 
      stepFields.some(stepField => field.startsWith(stepField))
    );
    return currentStepErrors.length === 0;
  }

  function validateBusinessRules(): string[] {
    const validationErrors: string[] = [];

    // CNPJ validation
    if (watchedValues.cnpj && !validateCNPJ(watchedValues.cnpj)) {
      validationErrors.push('CNPJ inválido');
    }

    // CPF validation
    if (watchedValues.cpf && !validateCPF(watchedValues.cpf)) {
      validationErrors.push('CPF inválido');
    }

    // Primary contact validation
    if (!watchedValues.primary_contact?.name || !watchedValues.primary_contact?.email) {
      validationErrors.push('Contato principal é obrigatório');
    }

    // Address validation
    if (!watchedValues.address?.street || !watchedValues.address?.city) {
      validationErrors.push('Endereço principal é obrigatório');
    }

    return validationErrors;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStepChange = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
      return;
    }

    // Validate current step before proceeding
    const stepFields = FORM_STEPS[currentStep].fields;
    const isStepValid = await trigger(stepFields as any);

    if (isStepValid) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = async () => {
    const stepFields = FORM_STEPS[currentStep].fields;
    const isStepValid = await trigger(stepFields as any);

    if (isStepValid) {
      setCompletedSteps(prev => [...prev, currentStep]);
      if (!isLastStep) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);

    try {
      // Validate business rules
      const businessErrors = validateBusinessRules();
      if (businessErrors.length > 0) {
        businessErrors.forEach(error => toast.error(error));
        return;
      }

      // Prepare data for submission
      const submissionData = {
        ...data,
        updated_at: new Date().toISOString(),
        ...(mode === 'create' && {
          created_at: new Date().toISOString(),
          created_by: 'current_user_id' // This should come from auth context
        })
      };

      if (mode === 'create') {
        await createSupplier(submissionData);
      } else if (supplier) {
        await updateSupplier({ id: supplier.id, ...submissionData });
      }

      toast.success(
        mode === 'create' 
          ? 'Fornecedor criado com sucesso!' 
          : 'Fornecedor atualizado com sucesso!'
      );

      onSuccess?.(submissionData as Supplier);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast.error('Erro ao salvar fornecedor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSecondaryContact = () => {
    appendSecondaryContact({
      id: `temp_${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      is_primary: false,
      preferred_contact_method: 'email'
    });
  };

  const addCertification = () => {
    appendCertification({
      id: `temp_${Date.now()}`,
      name: '',
      issuing_authority: '',
      certificate_number: '',
      issue_date: '',
      verification_status: 'pending'
    });
  };

  const addRiskFactor = () => {
    appendRiskFactor('');
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [open]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
        </h2>
        <Badge variant="secondary" className="text-xs">
          Etapa {currentStep + 1} de {FORM_STEPS.length}
        </Badge>
      </div>
      
      <Progress value={formProgress} className="mb-4" />
      
      <div className="flex items-center justify-between">
        {FORM_STEPS.map((step, index) => {
          const isComplete = completedSteps.includes(index);
          const isActive = index === currentStep;
          
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center cursor-pointer transition-colors",
                isActive && "text-blue-600",
                isComplete && "text-green-600",
                !isActive && !isComplete && "text-gray-400"
              )}
              onClick={() => handleStepChange(index)}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 mr-2",
                isActive && "border-blue-600 bg-blue-50",
                isComplete && "border-green-600 bg-green-50",
                !isActive && !isComplete && "border-gray-300"
              )}>
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Fornecedor *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Empresa Médica Ltda" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Empresa Médica Ltda" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="00.000.000/0000-00"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.replace(
                      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                      '$1.$2.$3/$4-$5'
                    );
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.replace(
                      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
                      '$1.$2.$3-$4'
                    );
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SupplierCategory).map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://exemplo.com" type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Informações adicionais sobre o fornecedor..."
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Contato Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="primary_contact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: João Silva" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="primary_contact.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Gerente Comercial" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="primary_contact.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="contato@empresa.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="primary_contact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="(11) 99999-9999"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(
                          /^(\d{2})(\d{4,5})(\d{4})$/,
                          '($1) $2-$3'
                        );
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="primary_contact.preferred_contact_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Contato Preferido</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Secondary Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Contatos Secundários</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSecondaryContact}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Contato
          </Button>
        </CardHeader>
        <CardContent>
          {secondaryContactFields.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum contato secundário adicionado.</p>
          ) : (
            <div className="space-y-4">
              {secondaryContactFields.map((contact, index) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Contato {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSecondaryContact(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`secondary_contacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome do contato" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name={`secondary_contacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="email@empresa.com" type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      {/* Main Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Rua das Flores" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Apto 101, Bloco A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Centro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="São Paulo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SP" maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="01234-567"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Informações Comerciais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PaymentTerms).map(term => (
                        <SelectItem key={term} value={term}>
                          {term.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="early_payment_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto Pgto Antecipado (%)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0" 
                      max="100"
                      step="0.1"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="risk_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Risco</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(RiskLevel).map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplianceStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conformidade e Certificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <FormField
              control={control}
              name="regulatory_compliance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Conformidade Regulatória</FormLabel>
                    <FormDescription>
                      Indica se o fornecedor está em conformidade com as regulamentações
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="anvisa_registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registro ANVISA</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número do registro na ANVISA" />
                </FormControl>
                <FormDescription>
                  Necessário para fornecedores de produtos médicos e farmacêuticos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Certificações</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCertification}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Certificação
          </Button>
        </CardHeader>
        <CardContent>
          {certificationFields.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma certificação adicionada.</p>
          ) : (
            <div className="space-y-4">
              {certificationFields.map((cert, index) => (
                <Card key={cert.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Certificação {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Certificação</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: ISO 9001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name={`certifications.${index}.issuing_authority`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autoridade Emissora</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: ABNT" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações para criar um novo fornecedor.' 
              : 'Edite as informações do fornecedor selecionado.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepIndicator()}

            <div className="min-h-[400px]">
              {currentStepConfig.id === 'basic' && renderBasicInfoStep()}
              {currentStepConfig.id === 'contact' && renderContactStep()}
              {currentStepConfig.id === 'address' && renderAddressStep()}
              {currentStepConfig.id === 'business' && renderBusinessStep()}
              {currentStepConfig.id === 'compliance' && renderComplianceStep()}
            </div>

            <Separator />

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Anterior
                  </Button>
                )}
                
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isCreating || isUpdating || !isValid}
                  >
                    {isSubmitting || isCreating || isUpdating ? (
                      <>
                        <span className="mr-2">Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações'}
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
