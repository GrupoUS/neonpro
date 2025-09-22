import { AnimatedModal } from '@/components/ui/animated-modal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UniversalButton } from '@/components/ui/universal-button';
import { useToast } from '@/hooks/use-toast';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';

export const Route = createFileRoute('/patients/register-backup')({
  component: PatientRegister,
});

interface PatientFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: string;
  blood_type: string;

  // Address
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;

  // Emergency Contact
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;

  // Health Insurance
  insurance_provider: string;
  insurance_plan_type: string;
  insurance_policy_number: string;
  insurance_valid_until: string;

  // LGPD Consent
  lgpd_data_processing: boolean;
  lgpd_communication: boolean;
  lgpd_storage: boolean;
  lgpd_ai_processing: boolean;
  lgpd_consent_date: string;
}

interface FormErrors {
  [key: string]: string;
}

const brazilianStates = [
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
];

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const insuranceProviders = [
  'Unimed',
  'Amil',
  'Bradesco Saúde',
  'SulAmérica',
  'Porto Seguro',
  'Notredame',
  'Intermédica',
  'Outra',
];

function PatientRegister() {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '',
    blood_type: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip_code: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: '',
    insurance_provider: '',
    insurance_plan_type: '',
    insurance_policy_number: '',
    insurance_valid_until: '',
    lgpd_data_processing: false,
    lgpd_communication: false,
    lgpd_storage: false,
    lgpd_ai_processing: false,
    lgpd_consent_date: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Personal Information
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.birth_date) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gênero é obrigatório';
    }

    // Address
    if (!formData.address_street.trim()) {
      newErrors.address_street = 'Rua é obrigatória';
    }
    if (!formData.address_number.trim()) {
      newErrors.address_number = 'Número é obrigatório';
    }
    if (!formData.address_neighborhood.trim()) {
      newErrors.address_neighborhood = 'Bairro é obrigatório';
    }
    if (!formData.address_city.trim()) {
      newErrors.address_city = 'Cidade é obrigatória';
    }
    if (!formData.address_state) {
      newErrors.address_state = 'Estado é obrigatório';
    }
    if (!formData.address_zip_code.trim()) {
      newErrors.address_zip_code = 'CEP é obrigatório';
    } else if (
      !/^\d{5}-?\d{3}$/.test(
        formData.address_zip_code.replace(/\D/g, '')
          .replace(/(\d{5})(\d{3})/, '$1-$2'),
      )
    ) {
      newErrors.address_zip_code = 'CEP inválido';
    }

    // Emergency Contact
    if (!formData.emergency_name.trim()) {
      newErrors.emergency_name = 'Nome do contato de emergência é obrigatório';
    }
    if (!formData.emergency_phone.trim()) {
      newErrors.emergency_phone = 'Telefone do contato de emergência é obrigatório';
    }
    if (!formData.emergency_relationship.trim()) {
      newErrors.emergency_relationship = 'Relação com o paciente é obrigatória';
    }

    // LGPD Consent
    if (!formData.lgpd_data_processing) {
      newErrors.lgpd_data_processing = 'Consentimento de processamento de dados é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof PatientFormData,
    value: string | boolean,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const formatCPF = (_value: any) => {
    return _value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (_value: any) => {
    return _value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatZipCode = (_value: any) => {
    return _value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmit = () => {
    // Mock API call
    setTimeout(() => {
      toast({
        title: 'Paciente cadastrado com sucesso',
        description: `${formData.name} foi cadastrado no sistema.`,
      });
      setShowConfirmModal(false);
      navigate({ to: '/patients/dashboard' });
    }, 1000);
  };

  const sections = [
    {
      title: 'Informações Pessoais',
      fields: [
        { name: 'name', label: 'Nome Completo', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        {
          name: 'phone',
          label: 'Telefone',
          type: 'text',
          required: true,
          format: formatPhone,
        },
        {
          name: 'cpf',
          label: 'CPF',
          type: 'text',
          required: true,
          format: formatCPF,
        },
        {
          name: 'birth_date',
          label: 'Data de Nascimento',
          type: 'date',
          required: true,
        },
        {
          name: 'gender',
          label: 'Gênero',
          type: 'select',
          required: true,
          options: [
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Feminino' },
            { value: 'O', label: 'Outro' },
          ],
        },
        {
          name: 'blood_type',
          label: 'Tipo Sanguíneo',
          type: 'select',
          options: bloodTypes.map(type => ({ value: type, label: type })),
        },
      ],
    },
    {
      title: 'Endereço',
      fields: [
        { name: 'address_street', label: 'Rua', type: 'text', required: true },
        {
          name: 'address_number',
          label: 'Número',
          type: 'text',
          required: true,
        },
        { name: 'address_complement', label: 'Complemento', type: 'text' },
        {
          name: 'address_neighborhood',
          label: 'Bairro',
          type: 'text',
          required: true,
        },
        { name: 'address_city', label: 'Cidade', type: 'text', required: true },
        {
          name: 'address_state',
          label: 'Estado',
          type: 'select',
          required: true,
          options: brazilianStates.map(state => ({
            value: state,
            label: state,
          })),
        },
        {
          name: 'address_zip_code',
          label: 'CEP',
          type: 'text',
          required: true,
          format: formatZipCode,
        },
      ],
    },
    {
      title: 'Contato de Emergência',
      fields: [
        {
          name: 'emergency_name',
          label: 'Nome do Contato',
          type: 'text',
          required: true,
        },
        {
          name: 'emergency_phone',
          label: 'Telefone do Contato',
          type: 'text',
          required: true,
          format: formatPhone,
        },
        {
          name: 'emergency_relationship',
          label: 'Relação com o Paciente',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      title: 'Plano de Saúde',
      fields: [
        {
          name: 'insurance_provider',
          label: 'Operadora',
          type: 'select',
          options: [
            ...insuranceProviders.map(provider => ({
              value: provider,
              label: provider,
            })),
            { value: '', label: 'Particular' },
          ],
        },
        {
          name: 'insurance_plan_type',
          label: 'Tipo de Plano',
          type: 'select',
          options: [
            { value: 'basic', label: 'Básico' },
            { value: 'standard', label: 'Padrão' },
            { value: 'comprehensive', label: 'Abrangente' },
            { value: 'premium', label: 'Premium' },
          ],
        },
        {
          name: 'insurance_policy_number',
          label: 'Número da Apólice',
          type: 'text',
        },
        { name: 'insurance_valid_until', label: 'Validade', type: 'date' },
      ],
    },
  ];

  const renderField = (_field: any) => {
    const value = formData[_field.name as keyof PatientFormData];
    const error = errors[_field.name];
    const fieldId = `field-${_field.name}`;
    const errorId = `error-${_field.name}`;
    const helpId = `help-${_field.name}`;

    if (field.type === 'select') {
      return (
        <div key={field.name} className='space-y-2'>
          <Label
            htmlFor={fieldId}
            className='text-sm sm:text-base font-medium text-gray-900'
          >
            {field.label}
            {field.required && (
              <span
                className='text-red-500 ml-1'
                aria-label='campo obrigatório'
              >
                *
              </span>
            )}
          </Label>
          <Select
            value={value as string}
            onValueChange={v => handleInputChange(field.name, v)}
          >
            <SelectTrigger
              id={fieldId}
              className={`h-11 sm:h-10 text-base sm:text-sm ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
            >
              <SelectValue
                placeholder={`Selecione ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {_field.options?.map((_options?: any) => (
                <SelectItem
                  key={_options.value}
                  value={_options.value}
                  className='text-base sm:text-sm py-2 sm:py-1'
                >
                  {_options.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p
              id={errorId}
              className='text-sm text-red-600 flex items-center gap-1'
              role='alert'
            >
              <span aria-hidden='true'>⚠</span>
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className='space-y-2'>
        <Label
          htmlFor={fieldId}
          className='text-sm sm:text-base font-medium text-gray-900'
        >
          {field.label}
          {field.required && (
            <span className='text-red-500 ml-1' aria-label='campo obrigatório'>
              *
            </span>
          )}
        </Label>
        <Input
          id={fieldId}
          type={field.type}
          value={value as string}
          onChange={e => {
            let formattedValue = e.target.value;
            if (field.format) {
              formattedValue = field.format(formattedValue);
            }
            handleInputChange(field.name, formattedValue);
          }}
          className={`h-11 sm:h-10 text-base sm:text-sm ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          autoComplete={getAutoComplete(field.name)}
        />
        {error && (
          <p
            id={errorId}
            className='text-sm text-red-600 flex items-center gap-1'
            role='alert'
          >
            <span aria-hidden='true'>⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  };

  // Helper function for autocomplete attributes
  const getAutoComplete = (fieldName: string): string => {
    const autoCompleteMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'tel',
      cpf: 'off',
      birth_date: 'bday',
      address_street: 'address-line1',
      address_number: 'address-line2',
      address_city: 'address-level2',
      address_state: 'address-level1',
      address_zip_code: 'postal-code',
      emergency_phone: 'tel',
    };
    return autoCompleteMap[fieldName] || 'off';
  };

  return (
    <div className='container mx-auto p-4 sm:p-6 max-w-4xl'>
      {/* Header - Mobile-first responsive */}
      <header className='mb-6 sm:mb-8'>
        <div className='space-y-4 sm:space-y-0'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            <Button
              variant='outline'
              onClick={() => navigate({ to: '/patients/dashboard' })}
              className='self-start h-11 sm:h-10 px-4 py-2 text-base sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Voltar para dashboard de pacientes'
            >
              ← Voltar
            </Button>
            <div className='space-y-1 sm:space-y-0'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
                Cadastro de Paciente
              </h1>
              <p className='text-sm sm:text-base text-muted-foreground'>
                Preencha as informações abaixo para cadastrar um novo paciente
              </p>
            </div>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className='space-y-6 sm:space-y-8'
        noValidate
      >
        {sections.map((section, sectionIndex) => (
          <Card key={section.title} className='shadow-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900'>
                {section.title}
                {sectionIndex < 2 && (
                  <span
                    className='text-red-500 ml-1'
                    aria-label='seção obrigatória'
                  >
                    *
                  </span>
                )}
              </CardTitle>
              <CardDescription className='text-sm sm:text-base text-gray-600'>
                {section.title === 'Informações Pessoais'
                  && 'Dados básicos do paciente'}
                {section.title === 'Endereço'
                  && 'Endereço residencial do paciente'}
                {section.title === 'Contato de Emergência'
                  && 'Informações para contato em caso de emergência'}
                {section.title === 'Plano de Saúde'
                  && 'Informações sobre o plano de saúde (opcional)'}
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              {/* Mobile-first grid: single column on mobile, 2 columns on larger screens */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                {section.fields.map(renderField)}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* LGPD Consent Section - Enhanced accessibility */}
        <Card className='shadow-sm border-blue-100'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2'>
              <span>🔒</span>
              Consentimento LGPD
              <span
                className='text-red-500 ml-1'
                aria-label='seção obrigatória'
              >
                *
              </span>
            </CardTitle>
            <CardDescription className='text-sm sm:text-base text-gray-600'>
              De acordo com a Lei Geral de Proteção de Dados, necessitamos do seu consentimento para
              processar os dados do paciente. Você pode retirar seu consentimento a qualquer
              momento.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-2'>
            <fieldset className='space-y-4'>
              <legend className='sr-only'>
                Consentimentos LGPD obrigatórios e opcionais
              </legend>

              <div className='flex items-start space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50'>
                <Checkbox
                  id='lgpd_data_processing'
                  checked={formData.lgpd_data_processing}
                  onCheckedChange={checked =>
                    handleInputChange(
                      'lgpd_data_processing',
                      checked as boolean,
                    )}
                  className='mt-1 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  aria-required='true'
                  aria-describedby='lgpd_data_processing_desc lgpd_data_processing_error'
                />
                <div className='grid gap-2 leading-none'>
                  <Label
                    htmlFor='lgpd_data_processing'
                    className='text-sm sm:text-base font-medium leading-none cursor-pointer text-gray-900 flex items-center gap-2'
                  >
                    Processamento de Dados
                    <span
                      className='text-red-500'
                      aria-label='consentimento obrigatório'
                    >
                      *
                    </span>
                  </Label>
                  <p
                    id='lgpd_data_processing_desc'
                    className='text-sm text-gray-600'
                  >
                    Autorizo o processamento de meus dados para fins médicos e administrativos
                  </p>
                  {errors.lgpd_data_processing && (
                    <p
                      id='lgpd_data_processing_error'
                      className='text-sm text-red-600 flex items-center gap-1'
                      role='alert'
                    >
                      <span aria-hidden='true'>⚠</span>
                      {errors.lgpd_data_processing}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200'>
                <Checkbox
                  id='lgpd_communication'
                  checked={formData.lgpd_communication}
                  onCheckedChange={checked =>
                    handleInputChange('lgpd_communication', checked as boolean)}
                  className='mt-1 h-5 w-5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  aria-describedby='lgpd_communication_desc'
                />
                <div className='grid gap-2 leading-none'>
                  <Label
                    htmlFor='lgpd_communication'
                    className='text-sm sm:text-base font-medium leading-none cursor-pointer text-gray-900'
                  >
                    Comunicação
                  </Label>
                  <p
                    id='lgpd_communication_desc'
                    className='text-sm text-gray-600'
                  >
                    Autorizo o envio de comunicações sobre consultas e exames
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200'>
                <Checkbox
                  id='lgpd_storage'
                  checked={formData.lgpd_storage}
                  onCheckedChange={checked => handleInputChange('lgpd_storage', checked as boolean)}
                  className='mt-1 h-5 w-5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  aria-describedby='lgpd_storage_desc'
                />
                <div className='grid gap-2 leading-none'>
                  <Label
                    htmlFor='lgpd_storage'
                    className='text-sm sm:text-base font-medium leading-none cursor-pointer text-gray-900'
                  >
                    Armazenamento
                  </Label>
                  <p id='lgpd_storage_desc' className='text-sm text-gray-600'>
                    Autorizo o armazenamento seguro de meus dados médicos
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200'>
                <Checkbox
                  id='lgpd_ai_processing'
                  checked={formData.lgpd_ai_processing}
                  onCheckedChange={checked =>
                    handleInputChange('lgpd_ai_processing', checked as boolean)}
                  className='mt-1 h-5 w-5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  aria-describedby='lgpd_ai_processing_desc'
                />
                <div className='grid gap-2 leading-none'>
                  <Label
                    htmlFor='lgpd_ai_processing'
                    className='text-sm sm:text-base font-medium leading-none cursor-pointer text-gray-900'
                  >
                    Processamento por IA
                  </Label>
                  <p
                    id='lgpd_ai_processing_desc'
                    className='text-sm text-gray-600'
                  >
                    Autorizo o uso de inteligência artificial para análise e previsões de saúde
                  </p>
                </div>
              </div>
            </fieldset>

            {errors.lgpd_data_processing && (
              <p className='text-sm text-red-500'>
                {errors.lgpd_data_processing}
              </p>
            )}

            <div className='text-xs text-muted-foreground'>
              Data do consentimento: {format(
                new Date(formData.lgpd_consent_date),
                'dd/MM/yyyy HH:mm',
                { locale: ptBR },
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions - Mobile-first responsive */}
        <div className='flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200'>
          <UniversalButton
            variant='outline'
            type='button'
            onClick={() => navigate({ to: '/patients/dashboard' })}
            className='order-2 sm:order-1 h-12 sm:h-10 text-base sm:text-sm font-medium focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            aria-label='Cancelar cadastro e voltar para dashboard'
          >
            Cancelar
          </UniversalButton>
          <UniversalButton
            variant='primary'
            type='submit'
            className='order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-12 sm:h-10 text-base sm:text-sm font-medium'
            aria-label='Confirmar e cadastrar novo paciente'
          >
            Cadastrar Paciente
          </UniversalButton>
        </div>
      </form>

      {/* Confirmation Modal */}
      <AnimatedModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title='Confirmar Cadastro'
        description={`Tem certeza que deseja cadastrar o paciente "${formData.name}" com as informações fornecidas?`}
      >
        <div className='space-y-4 mt-6'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium'>Email:</span> {formData.email}
            </div>
            <div>
              <span className='font-medium'>Telefone:</span> {formData.phone}
            </div>
            <div>
              <span className='font-medium'>CPF:</span> {formData.cpf}
            </div>
            <div>
              <span className='font-medium'>Data de Nascimento:</span> {formData.birth_date}
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='font-medium mb-2'>Consentimentos LGPD:</h4>
            <div className='space-y-1 text-sm'>
              <div className='flex items-center gap-2'>
                <span>✓</span>
                <span>Processamento de Dados</span>
              </div>
              {formData.lgpd_communication && (
                <div className='flex items-center gap-2'>
                  <span>✓</span>
                  <span>Comunicação</span>
                </div>
              )}
              {formData.lgpd_storage && (
                <div className='flex items-center gap-2'>
                  <span>✓</span>
                  <span>Armazenamento</span>
                </div>
              )}
              {formData.lgpd_ai_processing && (
                <div className='flex items-center gap-2'>
                  <span>✓</span>
                  <span>Processamento por IA</span>
                </div>
              )}
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <UniversalButton
              variant='outline'
              onClick={() => setShowConfirmModal(false)}
            >
              Revisar
            </UniversalButton>
            <UniversalButton
              variant='primary'
              onClick={confirmSubmit}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Confirmar Cadastro
            </UniversalButton>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}
