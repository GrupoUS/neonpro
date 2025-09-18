import { AnimatedModal } from '@components/ui/animated-modal';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Checkbox } from '@components/ui/checkbox';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { UniversalButton } from '@components/ui/universal-button';
import { useToast } from '@hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';

export const Route = createFileRoute('/patients/register/')({
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

const bloodTypes = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

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

export function PatientRegister() {
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
        formData.address_zip_code.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
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

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
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

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
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
        { name: 'birth_date', label: 'Data de Nascimento', type: 'date', required: true },
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
        { name: 'address_number', label: 'Número', type: 'text', required: true },
        { name: 'address_complement', label: 'Complemento', type: 'text' },
        { name: 'address_neighborhood', label: 'Bairro', type: 'text', required: true },
        { name: 'address_city', label: 'Cidade', type: 'text', required: true },
        {
          name: 'address_state',
          label: 'Estado',
          type: 'select',
          required: true,
          options: brazilianStates.map(state => ({ value: state, label: state })),
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
        { name: 'emergency_name', label: 'Nome do Contato', type: 'text', required: true },
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
            ...insuranceProviders.map(provider => ({ value: provider, label: provider })),
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
        { name: 'insurance_policy_number', label: 'Número da Apólice', type: 'text' },
        { name: 'insurance_valid_until', label: 'Validade', type: 'date' },
      ],
    },
  ];

  const renderField = (field: any) => {
    const value = formData[field.name as keyof PatientFormData];
    const error = errors[field.name];

    if (field.type === 'select') {
      return (
        <div key={field.name} className='space-y-2'>
          <Label htmlFor={field.name}>
            {field.label} {field.required && <span className='text-red-500'>*</span>}
          </Label>
          <Select value={value} onValueChange={v => handleInputChange(field.name, v)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className='text-sm text-red-500'>{error}</p>}
        </div>
      );
    }

    return (
      <div key={field.name} className='space-y-2'>
        <Label htmlFor={field.name}>
          {field.label} {field.required && <span className='text-red-500'>*</span>}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={e => {
            let formattedValue = e.target.value;
            if (field.format) {
              formattedValue = field.format(formattedValue);
            }
            handleInputChange(field.name, formattedValue);
          }}
          className={error ? 'border-red-500' : ''}
          placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
        />
        {error && <p className='text-sm text-red-500'>{error}</p>}
      </div>
    );
  };

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/patients/dashboard' })}
          >
            ← Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Cadastro de Paciente</h1>
            <p className='text-muted-foreground'>
              Preencha as informações abaixo para cadastrar um novo paciente
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-8'>
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>
                {section.title === 'Informações Pessoais' && 'Dados básicos do paciente'}
                {section.title === 'Endereço' && 'Endereço residencial do paciente'}
                {section.title === 'Contato de Emergência'
                  && 'Informações para contato em caso de emergência'}
                {section.title === 'Plano de Saúde'
                  && 'Informações sobre o plano de saúde (opcional)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {section.fields.map(renderField)}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* LGPD Consent Section */}
        <Card>
          <CardHeader>
            <CardTitle>Consentimento LGPD</CardTitle>
            <CardDescription>
              De acordo com a Lei Geral de Proteção de Dados, necessitamos do seu consentimento para
              processar os dados do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='lgpd_data_processing'
                  checked={formData.lgpd_data_processing}
                  onCheckedChange={checked =>
                    handleInputChange('lgpd_data_processing', checked as boolean)}
                />
                <div className='grid gap-1.5 leading-none'>
                  <Label
                    htmlFor='lgpd_data_processing'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Processamento de Dados *
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Autorizo o processamento de meus dados para fins médicos e administrativos
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='lgpd_communication'
                  checked={formData.lgpd_communication}
                  onCheckedChange={checked =>
                    handleInputChange('lgpd_communication', checked as boolean)}
                />
                <div className='grid gap-1.5 leading-none'>
                  <Label
                    htmlFor='lgpd_communication'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Comunicação
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Autorizo o envio de comunicações sobre consultas e exames
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='lgpd_storage'
                  checked={formData.lgpd_storage}
                  onCheckedChange={checked => handleInputChange('lgpd_storage', checked as boolean)}
                />
                <div className='grid gap-1.5 leading-none'>
                  <Label
                    htmlFor='lgpd_storage'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Armazenamento
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Autorizo o armazenamento seguro de meus dados médicos
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='lgpd_ai_processing'
                  checked={formData.lgpd_ai_processing}
                  onCheckedChange={checked =>
                    handleInputChange('lgpd_ai_processing', checked as boolean)}
                />
                <div className='grid gap-1.5 leading-none'>
                  <Label
                    htmlFor='lgpd_ai_processing'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Processamento por IA
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Autorizo o uso de inteligência artificial para análise e previsões de saúde
                  </p>
                </div>
              </div>
            </div>

            {errors.lgpd_data_processing && (
              <p className='text-sm text-red-500'>{errors.lgpd_data_processing}</p>
            )}

            <div className='text-xs text-muted-foreground'>
              Data do consentimento:{' '}
              {format(new Date(formData.lgpd_consent_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className='flex justify-end gap-4'>
          <UniversalButton
            variant='outline'
            type='button'
            onClick={() => navigate({ to: '/patients/dashboard' })}
          >
            Cancelar
          </UniversalButton>
          <UniversalButton
            variant='primary'
            type='submit'
            className='bg-blue-600 hover:bg-blue-700'
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
