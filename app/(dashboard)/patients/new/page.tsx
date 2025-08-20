'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Heart,
  Loader2,
  MapPin,
  Save,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreatePatient } from '@/hooks/use-patients';
import type { CreatePatientRequest } from '@/lib/api/patients';

// Validation schema for new patient
const newPatientSchema = z.object({
  // Personal Information
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['M', 'F', 'O'], {
    message: 'Selecione o gênero',
  }),

  // Address Information (optional)
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zip_code: z.string().optional(),

  // Emergency Contact (optional)
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),

  // Medical Information (optional)
  medical_allergies: z.string().optional(),
  medical_medications: z.string().optional(),
  medical_conditions: z.string().optional(),
  medical_notes: z.string().optional(),

  // LGPD Consent (required)
  consent_data_processing: z.boolean().refine((val) => val === true, {
    message: 'Consentimento para processamento de dados é obrigatório',
  }),
  consent_marketing: z.boolean().default(false),
  consent_photography: z.boolean().default(false),
});

type NewPatientFormData = z.infer<typeof newPatientSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const createPatientMutation = useCreatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewPatientFormData>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      consent_data_processing: false,
      consent_marketing: false,
      consent_photography: false,
    },
  });

  const onSubmit = async (data: NewPatientFormData) => {
    try {
      // Transform form data to match API structure
      const patientData: CreatePatientRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        birth_date: data.birth_date,
        gender: data.gender,

        // Address (only include if at least street is provided)
        ...(data.address_street && {
          address: {
            street: data.address_street,
            number: data.address_number || '',
            complement: data.address_complement,
            neighborhood: data.address_neighborhood || '',
            city: data.address_city || '',
            state: data.address_state || '',
            zip_code: data.address_zip_code || '',
          },
        }),

        // Emergency contact (only include if name is provided)
        ...(data.emergency_contact_name && {
          emergency_contact: {
            name: data.emergency_contact_name,
            phone: data.emergency_contact_phone || '',
            relationship: data.emergency_contact_relationship || '',
          },
        }),

        // Medical history (only include if any field is provided)
        ...((data.medical_allergies ||
          data.medical_medications ||
          data.medical_conditions ||
          data.medical_notes) && {
          medical_history: {
            allergies: data.medical_allergies
              ? data.medical_allergies.split(',').map((a) => a.trim())
              : [],
            medications: data.medical_medications
              ? data.medical_medications.split(',').map((m) => m.trim())
              : [],
            conditions: data.medical_conditions
              ? data.medical_conditions.split(',').map((c) => c.trim())
              : [],
            notes: data.medical_notes,
          },
        }),

        // Consent (required)
        consent: {
          data_processing: data.consent_data_processing,
          marketing: data.consent_marketing,
          photography: data.consent_photography,
        },
      };

      await createPatientMutation.mutateAsync(patientData);

      // Redirect to patient list
      router.push('/patients');
    } catch (error) {
      // Error is handled by the mutation hook with toast
      console.error('Failed to create patient:', error);
    }
  };

  const genderOptions = [
    { value: 'F', label: 'Feminino' },
    { value: 'M', label: 'Masculino' },
    { value: 'O', label: 'Outro' },
  ];

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button className="p-2" onClick={() => router.back()} variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Novo Paciente</h1>
            <p className="text-gray-600">
              Cadastre um novo paciente na clínica
            </p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription>
                Dados básicos do paciente (campos obrigatórios)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Nome completo do paciente"
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('cpf')}
                    className={errors.cpf ? 'border-red-500' : ''}
                    placeholder="123.456.789-00"
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('birth_date')}
                    className={errors.birth_date ? 'border-red-500' : ''}
                    type="date"
                  />
                  {errors.birth_date && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.birth_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Gênero <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecione o gênero</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Endereço</span>
              </CardTitle>
              <CardDescription>
                Informações de endereço (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Rua
                  </label>
                  <Input
                    {...register('address_street')}
                    placeholder="Nome da rua"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Número
                  </label>
                  <Input {...register('address_number')} placeholder="123" />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Complemento
                  </label>
                  <Input
                    {...register('address_complement')}
                    placeholder="Apto 45, Bloco B"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Bairro
                  </label>
                  <Input
                    {...register('address_neighborhood')}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Cidade
                  </label>
                  <Input
                    {...register('address_city')}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Estado
                  </label>
                  <select
                    {...register('address_state')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o estado</option>
                    {brazilianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    CEP
                  </label>
                  <Input
                    {...register('address_zip_code')}
                    placeholder="12345-678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Contato de Emergência</span>
              </CardTitle>
              <CardDescription>
                Pessoa para contato em casos de emergência (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Nome
                  </label>
                  <Input
                    {...register('emergency_contact_name')}
                    placeholder="Nome do contato"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Telefone
                  </label>
                  <Input
                    {...register('emergency_contact_phone')}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Relacionamento
                  </label>
                  <Input
                    {...register('emergency_contact_relationship')}
                    placeholder="Mãe, Pai, Esposo(a), etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Histórico Médico</span>
              </CardTitle>
              <CardDescription>
                Informações médicas relevantes (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Alergias
                  </label>
                  <textarea
                    {...register('medical_allergies')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Liste alergias conhecidas, separadas por vírgula"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Medicações
                  </label>
                  <textarea
                    {...register('medical_medications')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Liste medicações em uso, separadas por vírgula"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Condições Médicas
                  </label>
                  <textarea
                    {...register('medical_conditions')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Liste condições médicas relevantes, separadas por vírgula"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700 text-sm">
                    Observações
                  </label>
                  <textarea
                    {...register('medical_notes')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Outras informações médicas relevantes"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LGPD Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Consentimentos LGPD</span>
              </CardTitle>
              <CardDescription>
                Consentimentos para tratamento de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    {...register('consent_data_processing')}
                    className="mt-1"
                    type="checkbox"
                  />
                  <div>
                    <label className="font-medium text-gray-700 text-sm">
                      Processamento de Dados{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-gray-600 text-sm">
                      Autorizo o processamento dos meus dados pessoais para
                      finalidades relacionadas ao tratamento estético e gestão
                      da clínica.
                    </p>
                  </div>
                </div>

                {errors.consent_data_processing && (
                  <p className="text-red-500 text-sm">
                    {errors.consent_data_processing.message}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    {...register('consent_marketing')}
                    className="mt-1"
                    type="checkbox"
                  />
                  <div>
                    <label className="font-medium text-gray-700 text-sm">
                      Marketing e Comunicações
                    </label>
                    <p className="text-gray-600 text-sm">
                      Autorizo o envio de comunicações promocionais, newsletters
                      e ofertas especiais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    {...register('consent_photography')}
                    className="mt-1"
                    type="checkbox"
                  />
                  <div>
                    <label className="font-medium text-gray-700 text-sm">
                      Fotografias (Antes/Depois)
                    </label>
                    <p className="text-gray-600 text-sm">
                      Autorizo o uso de fotografias para documentação do
                      tratamento e fins educacionais/promocionais.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              disabled={createPatientMutation.isPending}
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>

            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={createPatientMutation.isPending}
              type="submit"
            >
              {createPatientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Criar Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
