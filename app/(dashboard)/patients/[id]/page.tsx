'use client';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePatient } from '@/hooks/use-patients';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  // Use the API hook to fetch patient data
  const { data: patient, isLoading, error, refetch } = usePatient(patientId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
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
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Patient not found
  if (!patient) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                Paciente não encontrado
              </h3>
              <p className="mb-6 text-gray-500">
                O paciente solicitado não foi encontrado.
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
                {patient.name}
              </h1>
              <p className="text-gray-600">Detalhes do paciente</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={getStatusBadge(patient.status)}>
              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <a href={`/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Nome Completo
                    </label>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      CPF
                    </label>
                    <p className="text-gray-900">{patient.cpf}</p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Data de Nascimento
                    </label>
                    <p className="text-gray-900">
                      {formatDate(patient.birth_date)}
                    </p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Gênero
                    </label>
                    <p className="text-gray-900">
                      {patient.gender === 'M'
                        ? 'Masculino'
                        : patient.gender === 'F'
                          ? 'Feminino'
                          : 'Outro'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Email
                      </label>
                      <p className="text-gray-900">{patient.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Telefone
                      </label>
                      <p className="text-gray-900">{patient.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {patient.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Endereço</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      {patient.address.street}, {patient.address.number}
                      {patient.address.complement &&
                        `, ${patient.address.complement}`}
                    </p>
                    <p className="text-gray-900">
                      {patient.address.neighborhood}, {patient.address.city} -{' '}
                      {patient.address.state}
                    </p>
                    <p className="text-gray-600">{patient.address.zip_code}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact */}
            {patient.emergency_contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Contato de Emergência</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Nome
                      </label>
                      <p className="text-gray-900">
                        {patient.emergency_contact.name}
                      </p>
                    </div>

                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Telefone
                      </label>
                      <p className="text-gray-900">
                        {patient.emergency_contact.phone}
                      </p>
                    </div>

                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Relacionamento
                      </label>
                      <p className="text-gray-900">
                        {patient.emergency_contact.relationship}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical History */}
            {patient.medical_history && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Histórico Médico</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.medical_history.allergies &&
                    patient.medical_history.allergies.length > 0 && (
                      <div>
                        <label className="font-medium text-gray-500 text-sm">
                          Alergias
                        </label>
                        <p className="text-gray-900">
                          {patient.medical_history.allergies.join(', ')}
                        </p>
                      </div>
                    )}

                  {patient.medical_history.medications &&
                    patient.medical_history.medications.length > 0 && (
                      <div>
                        <label className="font-medium text-gray-500 text-sm">
                          Medicações
                        </label>
                        <p className="text-gray-900">
                          {patient.medical_history.medications.join(', ')}
                        </p>
                      </div>
                    )}

                  {patient.medical_history.conditions &&
                    patient.medical_history.conditions.length > 0 && (
                      <div>
                        <label className="font-medium text-gray-500 text-sm">
                          Condições Médicas
                        </label>
                        <p className="text-gray-900">
                          {patient.medical_history.conditions.join(', ')}
                        </p>
                      </div>
                    )}

                  {patient.medical_history.notes && (
                    <div>
                      <label className="font-medium text-gray-500 text-sm">
                        Observações
                      </label>
                      <p className="text-gray-900">
                        {patient.medical_history.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* LGPD Consent Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Consentimentos LGPD</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">
                    Processamento de Dados
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      patient.consent.data_processing
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {patient.consent.data_processing
                      ? 'Autorizado'
                      : 'Não autorizado'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Marketing</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      patient.consent.marketing
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {patient.consent.marketing
                      ? 'Autorizado'
                      : 'Não autorizado'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Fotografias</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      patient.consent.photography
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {patient.consent.photography
                      ? 'Autorizado'
                      : 'Não autorizado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Consulta
                </Button>

                <Button className="w-full" variant="outline">
                  Ver Histórico
                </Button>

                <Button className="w-full" variant="outline">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            {/* Registration Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Cadastro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="font-medium text-gray-500 text-sm">
                    Cadastrado em
                  </label>
                  <p className="text-gray-900">
                    {formatDate(patient.created_at)}
                  </p>
                </div>

                <div>
                  <label className="font-medium text-gray-500 text-sm">
                    Última atualização
                  </label>
                  <p className="text-gray-900">
                    {formatDate(patient.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
