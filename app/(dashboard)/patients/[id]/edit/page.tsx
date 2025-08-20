'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { usePatient, useUpdatePatient } from '@/hooks/use-patients';

// Validation schema for patient form
const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['M', 'F', 'O'], {
    message: 'Gênero é obrigatório',
  }),
  status: z.enum(['active', 'inactive']),

  // Address (optional)
  address: z
    .object({
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      zip_code: z.string(),
    })
    .optional(),

  // Emergency contact (optional)
  emergency_contact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),

  // Medical history (optional)
  medical_history: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .optional(),

  // LGPD Consent
  consent: z.object({
    data_processing: z.boolean(),
    marketing: z.boolean(),
    photography: z.boolean(),
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  // Hooks for fetching and updating patient data
  const { data: patient, isLoading, error } = usePatient(patientId);
  const updatePatientMutation = useUpdatePatient();

  // Form setup
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birth_date: '',
      gender: 'M',
      status: 'active',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
      },
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
      medical_history: {
        allergies: [],
        medications: [],
        conditions: [],
        notes: '',
      },
      consent: {
        data_processing: false,
        marketing: false,
        photography: false,
      },
    },
  });

  // Populate form when patient data is loaded
  React.useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        cpf: patient.cpf,
        birth_date: patient.birth_date.split('T')[0], // Format for date input
        gender: patient.gender,
        status: patient.status,
        address: patient.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: '',
        },
        emergency_contact: patient.emergency_contact || {
          name: '',
          phone: '',
          relationship: '',
        },
        medical_history: patient.medical_history || {
          allergies: [],
          medications: [],
          conditions: [],
          notes: '',
        },
        consent: patient.consent,
      });
    }
  }, [patient, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      await updatePatientMutation.mutateAsync({
        id: patientId,
        ...data,
      });

      toast.success('Paciente atualizado com sucesso!');
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente');
    }
  };

  const handleArrayInput = (
    value: string,
    fieldName: 'allergies' | 'medications' | 'conditions'
  ) => {
    const currentValues = form.getValues(`medical_history.${fieldName}`) || [];
    const newValues = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    form.setValue(`medical_history.${fieldName}`, newValues);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Carregando dados do paciente...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                Erro ao carregar paciente
              </h3>
              <p className="mb-6 text-gray-500">
                Não foi possível carregar os dados do paciente.
              </p>
              <Button onClick={() => router.push('/patients')}>
                Voltar para lista
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                Paciente não encontrado
              </h3>
              <Button onClick={() => router.push('/patients')}>
                Voltar para lista
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              className="p-2"
              onClick={() => router.back()}
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">
                Editar Paciente
              </h1>
              <p className="text-gray-600">
                Atualize as informações do paciente
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Dados básicos do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Nome Completo *
                  </label>
                  <Input
                    {...form.register('name')}
                    className={
                      form.formState.errors.name ? 'border-red-500' : ''
                    }
                    placeholder="Digite o nome completo"
                  />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-red-500 text-sm">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Email *
                    </label>
                    <Input
                      {...form.register('email')}
                      className={
                        form.formState.errors.email ? 'border-red-500' : ''
                      }
                      placeholder="email@exemplo.com"
                      type="email"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-red-500 text-sm">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Telefone *
                    </label>
                    <Input
                      {...form.register('phone')}
                      className={
                        form.formState.errors.phone ? 'border-red-500' : ''
                      }
                      placeholder="(11) 99999-9999"
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-red-500 text-sm">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      CPF *
                    </label>
                    <Input
                      {...form.register('cpf')}
                      className={
                        form.formState.errors.cpf ? 'border-red-500' : ''
                      }
                      placeholder="000.000.000-00"
                    />
                    {form.formState.errors.cpf && (
                      <p className="mt-1 text-red-500 text-sm">
                        {form.formState.errors.cpf.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Data de Nascimento *
                    </label>
                    <Input
                      {...form.register('birth_date')}
                      className={
                        form.formState.errors.birth_date ? 'border-red-500' : ''
                      }
                      type="date"
                    />
                    {form.formState.errors.birth_date && (
                      <p className="mt-1 text-red-500 text-sm">
                        {form.formState.errors.birth_date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Gênero *
                    </label>
                    <select
                      {...form.register('gender')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Status
                  </label>
                  <select
                    {...form.register('status')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
                  Informações de endereço (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Rua/Avenida
                    </label>
                    <Input
                      {...form.register('address.street')}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Número
                    </label>
                    <Input
                      {...form.register('address.number')}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Complemento
                  </label>
                  <Input
                    {...form.register('address.complement')}
                    placeholder="Apartamento, bloco, etc."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Bairro
                    </label>
                    <Input
                      {...form.register('address.neighborhood')}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      CEP
                    </label>
                    <Input
                      {...form.register('address.zip_code')}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Cidade
                    </label>
                    <Input
                      {...form.register('address.city')}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Estado
                    </label>
                    <Input
                      {...form.register('address.state')}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contato de Emergência</CardTitle>
                <CardDescription>
                  Pessoa para contatar em caso de emergência (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Nome
                  </label>
                  <Input
                    {...form.register('emergency_contact.name')}
                    placeholder="Nome do contato"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Telefone
                    </label>
                    <Input
                      {...form.register('emergency_contact.phone')}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-gray-700 text-sm">
                      Relacionamento
                    </label>
                    <Input
                      {...form.register('emergency_contact.relationship')}
                      placeholder="Mãe, Pai, Esposo(a)..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico Médico</CardTitle>
                <CardDescription>
                  Informações médicas relevantes (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Alergias
                  </label>
                  <Input
                    defaultValue={
                      patient?.medical_history?.allergies?.join(', ') || ''
                    }
                    onChange={(e) =>
                      handleArrayInput(e.target.value, 'allergies')
                    }
                    placeholder="Separar por vírgulas: Ex: Látex, Penicilina"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Medicações
                  </label>
                  <Input
                    defaultValue={
                      patient?.medical_history?.medications?.join(', ') || ''
                    }
                    onChange={(e) =>
                      handleArrayInput(e.target.value, 'medications')
                    }
                    placeholder="Separar por vírgulas: Ex: Aspirina, Vitamina D"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Condições Médicas
                  </label>
                  <Input
                    defaultValue={
                      patient?.medical_history?.conditions?.join(', ') || ''
                    }
                    onChange={(e) =>
                      handleArrayInput(e.target.value, 'conditions')
                    }
                    placeholder="Separar por vírgulas: Ex: Diabetes, Hipertensão"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-sm">
                    Observações
                  </label>
                  <textarea
                    {...form.register('medical_history.notes')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Observações gerais sobre o histórico médico"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LGPD Consent */}
          <Card>
            <CardHeader>
              <CardTitle>Consentimentos LGPD</CardTitle>
              <CardDescription>
                Consentimentos para tratamento de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...form.register('consent.data_processing')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">
                    Autorizo o processamento dos meus dados pessoais para
                    prestação dos serviços
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...form.register('consent.marketing')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">
                    Autorizo o uso dos meus dados para comunicações de marketing
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...form.register('consent.photography')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">
                    Autorizo o uso de fotografias para fins de documentação
                    médica
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>

            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={updatePatientMutation.isPending}
              type="submit"
            >
              {updatePatientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
