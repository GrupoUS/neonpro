'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  User, 
  FileText, 
  Shield, 
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  UserPlus,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Validation schemas for each step
const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  date_of_birth: z.string().min(10, 'Data de nascimento é obrigatória'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido'),
  emergency_contact_name: z.string().min(2, 'Nome do contato de emergência obrigatório'),
  emergency_contact_phone: z.string().min(10, 'Telefone do contato de emergência obrigatório'),
  emergency_contact_relationship: z.string().min(2, 'Relacionamento obrigatório'),
});

const addressSchema = z.object({
  street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zip_code: z.string().min(8, 'CEP deve ter 8 dígitos'),
});

const medicalInfoSchema = z.object({
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
  allergies: z.array(z.string()).optional(),
  chronic_conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  previous_surgeries: z.array(z.string()).optional(),
  family_history: z.string().optional(),
});

const lgpdConsentSchema = z.object({
  data_processing_consent: z.boolean().refine(val => val === true, 'Consentimento obrigatório'),
  medical_data_consent: z.boolean().refine(val => val === true, 'Consentimento obrigatório'),
  photo_consent: z.boolean(),
  marketing_consent: z.boolean(),
  data_sharing_consent: z.boolean(),
  retention_period_consent: z.boolean().refine(val => val === true, 'Consentimento obrigatório'),
});

interface PatientRegistrationFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PatientRegistrationForm({
  onSubmit,
  onCancel,
  initialData,
  isOpen = false,
  onOpenChange
}: PatientRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completionScore, setCompletionScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConsentDetails, setShowConsentDetails] = useState(false);
  
  const supabase = createClient();
  
  const steps = [
    { id: 1, title: 'Dados Pessoais', icon: User, schema: personalInfoSchema },
    { id: 2, title: 'Endereço', icon: MapPin, schema: addressSchema },
    { id: 3, title: 'Informações Médicas', icon: Stethoscope, schema: medicalInfoSchema },
    { id: 4, title: 'Consentimento LGPD', icon: Shield, schema: lgpdConsentSchema },
  ];

  // Forms for each step
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: '',
      date_of_birth: '',
      gender: 'prefer_not_to_say',
      cpf: '',
      phone: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      ...initialData?.personal
    }
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      ...initialData?.address
    }
  });

  const medicalForm = useForm({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      height_cm: '',
      weight_kg: '',
      blood_type: 'unknown',
      allergies: [],
      chronic_conditions: [],
      medications: [],
      previous_surgeries: [],
      family_history: '',
      ...initialData?.medical
    }
  });

  const consentForm = useForm({
    resolver: zodResolver(lgpdConsentSchema),
    defaultValues: {
      data_processing_consent: false,
      medical_data_consent: false,
      photo_consent: false,
      marketing_consent: false,
      data_sharing_consent: false,
      retention_period_consent: false,
      ...initialData?.consent
    }
  });

  // Calculate completion score
  useEffect(() => {
    let score = 0;
    
    // Personal info (40%)
    const personalData = personalForm.getValues();
    const personalFields = Object.keys(personalInfoSchema.shape);
    const personalCompleted = personalFields.filter(field => 
      personalData[field as keyof typeof personalData] && 
      personalData[field as keyof typeof personalData] !== ''
    ).length;
    score += (personalCompleted / personalFields.length) * 40;

    // Address (20%)
    const addressData = addressForm.getValues();
    const addressFields = Object.keys(addressSchema.shape);
    const addressCompleted = addressFields.filter(field => 
      addressData[field as keyof typeof addressData] && 
      addressData[field as keyof typeof addressData] !== ''
    ).length;
    score += (addressCompleted / addressFields.length) * 20;

    // Medical info (20%)
    const medicalData = medicalForm.getValues();
    const medicalFieldsCount = Object.keys(medicalData).filter(key => 
      medicalData[key as keyof typeof medicalData] && 
      (Array.isArray(medicalData[key as keyof typeof medicalData]) 
        ? (medicalData[key as keyof typeof medicalData] as any[]).length > 0
        : medicalData[key as keyof typeof medicalData] !== '' && 
          medicalData[key as keyof typeof medicalData] !== 'unknown')
    ).length;
    score += (medicalFieldsCount / 8) * 20;

    // LGPD consent (20%)
    const consentData = consentForm.getValues();
    const requiredConsents = ['data_processing_consent', 'medical_data_consent', 'retention_period_consent'];
    const consentCompleted = requiredConsents.filter(field => 
      consentData[field as keyof typeof consentData]
    ).length;
    score += (consentCompleted / requiredConsents.length) * 20;

    setCompletionScore(Math.round(score));
  }, [personalForm.watch(), addressForm.watch(), medicalForm.watch(), consentForm.watch()]);

  const getCurrentForm = () => {
    switch (currentStep) {
      case 1: return personalForm;
      case 2: return addressForm;
      case 3: return medicalForm;
      case 4: return consentForm;
      default: return personalForm;
    }
  };

  const validateCurrentStep = async () => {
    const currentForm = getCurrentForm();
    return await currentForm.trigger();
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all forms
    const isPersonalValid = await personalForm.trigger();
    const isAddressValid = await addressForm.trigger();
    const isMedicalValid = await medicalForm.trigger();
    const isConsentValid = await consentForm.trigger();

    if (!isPersonalValid || !isAddressValid || !isMedicalValid || !isConsentValid) {
      toast.error('Por favor, corrija os erros antes de continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      const personalData = personalForm.getValues();
      const addressData = addressForm.getValues();
      const medicalData = medicalForm.getValues();
      const consentData = consentForm.getValues();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: personalData.email,
        password: generateTemporaryPassword(),
        options: {
          data: {
            full_name: personalData.full_name,
            date_of_birth: personalData.date_of_birth,
            gender: personalData.gender,
            cpf: personalData.cpf,
            role: 'patient'
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Erro ao criar usuário');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: personalData.email,
          phone: personalData.phone,
          role: 'patient',
          raw_user_meta_data: {
            full_name: personalData.full_name,
            date_of_birth: personalData.date_of_birth,
            gender: personalData.gender,
            cpf: personalData.cpf
          },
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Create extended profile
      const { error: extendedProfileError } = await supabase
        .from('patient_profiles_extended')
        .insert({
          patient_id: userId,
          height_cm: medicalData.height_cm ? parseFloat(medicalData.height_cm) : null,
          weight_kg: medicalData.weight_kg ? parseFloat(medicalData.weight_kg) : null,
          blood_type: medicalData.blood_type !== 'unknown' ? medicalData.blood_type : null,
          allergies: medicalData.allergies || [],
          chronic_conditions: medicalData.chronic_conditions || [],
          medications: medicalData.medications || [],
          emergency_contact: {
            name: personalData.emergency_contact_name,
            phone: personalData.emergency_contact_phone,
            relationship: personalData.emergency_contact_relationship
          },
          consent_status: consentData,
          privacy_settings: {
            data_processing: consentData.data_processing_consent,
            medical_data: consentData.medical_data_consent,
            photo_consent: consentData.photo_consent,
            marketing: consentData.marketing_consent,
            data_sharing: consentData.data_sharing_consent
          },
          profile_completeness_score: completionScore / 100,
          created_at: new Date().toISOString()
        });

      if (extendedProfileError) throw extendedProfileError;

      // Create address record
      const { error: addressError } = await supabase
        .from('patient_addresses')
        .insert({
          patient_id: userId,
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zip_code,
          is_primary: true
        });

      if (addressError) throw addressError;

      // Log LGPD consent
      const { error: auditError } = await supabase
        .from('lgpd_audit_log')
        .insert({
          patient_id: userId,
          action_type: 'consent_given',
          consent_details: consentData,
          ip_address: '', // Would be filled by backend
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });

      if (auditError) console.warn('Audit log error:', auditError);

      toast.success('Paciente cadastrado com sucesso!');
      
      // Reset forms
      personalForm.reset();
      addressForm.reset();
      medicalForm.reset();
      consentForm.reset();
      setCurrentStep(1);
      
      onSubmit?.({
        personal: personalData,
        address: addressData,
        medical: medicalData,
        consent: consentData,
        userId
      });

      onOpenChange?.(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cadastrar paciente';
      toast.error(`Erro: ${errorMessage}`);
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...personalForm}>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={personalForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => field.onChange(formatCPF(e.target.value))}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Contato de Emergência
                </h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={personalForm.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="emergency_contact_relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parentesco *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mãe, Cônjuge, Filho" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...addressForm}>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <FormField
                    control={addressForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addressForm.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número *</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000"
                          {...field}
                          onChange={(e) => field.onChange(formatCEP(e.target.value))}
                          maxLength={9}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        );

      case 3:
        return (
          <Form {...medicalForm}>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={medicalForm.control}
                  name="height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="170" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicalForm.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="70" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicalForm.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Sanguíneo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="unknown">Não sei</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={medicalForm.control}
                  name="family_history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Histórico Familiar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva doenças na família (diabetes, hipertensão, câncer, etc.)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe se há casos de doenças hereditárias na família
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Alergias, condições crônicas e medicamentos podem ser adicionados após o cadastro inicial.</p>
              </div>
            </form>
          </Form>
        );

      case 4:
        return (
          <Form {...consentForm}>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Consentimentos LGPD Obrigatórios
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConsentDetails(!showConsentDetails)}
                  >
                    {showConsentDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showConsentDetails ? 'Ocultar' : 'Detalhes'}
                  </Button>
                </div>

                {showConsentDetails && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h5 className="font-medium mb-2">Lei Geral de Proteção de Dados (LGPD)</h5>
                    <p className="text-sm text-muted-foreground">
                      Seus dados pessoais e médicos são protegidos por lei. Você tem direito a:
                      acessar, corrigir, excluir, portar seus dados e retirar consentimento a qualquer momento.
                      Entre em contato conosco em privacidade@neonpro.com.br para exercer seus direitos.
                    </p>
                  </Card>
                )}

                <div className="space-y-4">
                  <FormField
                    control={consentForm.control}
                    name="data_processing_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            * Autorizo o processamento dos meus dados pessoais para prestação de serviços médicos
                          </FormLabel>
                          <FormDescription>
                            Obrigatório para agendamentos, consultas e tratamentos
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={consentForm.control}
                    name="medical_data_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            * Autorizo o processamento dos meus dados médicos sensíveis
                          </FormLabel>
                          <FormDescription>
                            Obrigatório para prontuário eletrônico e acompanhamento médico
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={consentForm.control}
                    name="retention_period_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            * Estou ciente do período de retenção dos dados (20 anos conforme CFM)
                          </FormLabel>
                          <FormDescription>
                            Dados médicos são mantidos por 20 anos conforme resolução do CFM
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">Consentimentos Opcionais</h5>
                  <div className="space-y-4">
                    <FormField
                      control={consentForm.control}
                      name="photo_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Autorizo uso de fotos para documentação médica (antes/depois)
                            </FormLabel>
                            <FormDescription>
                              Para acompanhamento de tratamentos estéticos
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={consentForm.control}
                      name="marketing_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Autorizo recebimento de comunicações promocionais
                            </FormLabel>
                            <FormDescription>
                              Ofertas, novidades e campanhas por email/WhatsApp
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={consentForm.control}
                      name="data_sharing_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Autorizo compartilhamento com profissionais parceiros
                            </FormLabel>
                            <FormDescription>
                              Para encaminhamentos e segunda opinião médica
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Cadastro de Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do paciente para criar um perfil completo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do cadastro</span>
              <span className="font-medium">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="w-full" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? (
                'Cancelar'
              ) : (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </>
              )}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || completionScore < 50}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Finalizar Cadastro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
