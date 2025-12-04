/**
 * Patient Detail View Component
 * Comprehensive patient information display with tabs for different data sections
 * LGPD compliant with consent status indicators
 */

import { usePatientDetail } from '@/hooks/usePatients';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui';
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  Edit,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trash2,
  User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { PatientEditModal } from './PatientEditModal';
import { PatientDeleteDialog } from './PatientDeleteDialog';
import { PatientConsentManager } from './PatientConsentManager';

interface PatientDetailViewProps {
  patientId: string;
  clinicId: string;
}

export function PatientDetailView({ patientId, clinicId }: PatientDetailViewProps) {
  const { data: patient, isLoading, error } = usePatientDetail(patientId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    throw error;
  }

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  // Format date helper
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Não informado';
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  // Format datetime helper
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Não informado';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  // Calculate age
  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    try {
      const today = new Date();
      const birth = parseISO(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(patient.birth_date);

  return (
    <>
      <div className='space-y-6'>
        {/* Header Card with Patient Info and Actions */}
        <Card>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <CardTitle className='text-3xl'>{patient.full_name}</CardTitle>
                  <Badge variant={patient.is_active ? 'default' : 'secondary'}>
                    {patient.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {patient.lgpd_consent_given && (
                    <Badge variant='outline' className='gap-1'>
                      <Shield className='w-3 h-3' />
                      LGPD OK
                    </Badge>
                  )}
                </div>
                <CardDescription className='flex items-center gap-4 text-base'>
                  <span className='flex items-center gap-1'>
                    <FileText className='w-4 h-4' />
                    Prontuário: {patient.medical_record_number}
                  </span>
                  {age && (
                    <span className='flex items-center gap-1'>
                      <User className='w-4 h-4' />
                      {age} anos
                    </span>
                  )}
                </CardDescription>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditModalOpen(true)}
                  className='gap-2'
                >
                  <Edit className='w-4 h-4' />
                  Editar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className='gap-2 text-destructive hover:text-destructive'
                >
                  <Trash2 className='w-4 h-4' />
                  Remover
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total de Consultas</p>
                  <p className='text-2xl font-bold'>{patient.total_appointments || 0}</p>
                </div>
                <Calendar className='w-8 h-8 text-primary/60' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Faltas (No-Show)</p>
                  <p className='text-2xl font-bold'>{patient.total_no_shows || 0}</p>
                </div>
                <AlertCircle className='w-8 h-8 text-warning/60' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Última Visita</p>
                  <p className='text-sm font-medium'>
                    {patient.last_visit_date
                      ? format(parseISO(patient.last_visit_date), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Nunca'}
                  </p>
                </div>
                <Clock className='w-8 h-8 text-primary/60' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='info'>Informações</TabsTrigger>
            <TabsTrigger value='medical'>Dados Médicos</TabsTrigger>
            <TabsTrigger value='appointments'>Consultas</TabsTrigger>
            <TabsTrigger value='consent'>Consentimentos</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value='info' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <InfoItem
                    icon={<User className='w-4 h-4' />}
                    label='Nome Completo'
                    value={patient.full_name}
                  />
                  <InfoItem
                    icon={<User className='w-4 h-4' />}
                    label='Nome Preferido'
                    value={patient.preferred_name || 'Não informado'}
                  />
                  <InfoItem
                    icon={<Calendar className='w-4 h-4' />}
                    label='Data de Nascimento'
                    value={formatDate(patient.birth_date)}
                  />
                  <InfoItem
                    icon={<User className='w-4 h-4' />}
                    label='Gênero'
                    value={patient.gender || 'Não informado'}
                  />
                  <InfoItem
                    icon={<FileText className='w-4 h-4' />}
                    label='CPF'
                    value={patient.cpf || 'Não informado'}
                    sensitive
                  />
                  <InfoItem
                    icon={<FileText className='w-4 h-4' />}
                    label='RG'
                    value={patient.rg || 'Não informado'}
                    sensitive
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Contato</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <InfoItem
                    icon={<Phone className='w-4 h-4' />}
                    label='Telefone Principal'
                    value={patient.phone_primary || 'Não informado'}
                  />
                  <InfoItem
                    icon={<Phone className='w-4 h-4' />}
                    label='Telefone Secundário'
                    value={patient.phone_secondary || 'Não informado'}
                  />
                  <InfoItem
                    icon={<Mail className='w-4 h-4' />}
                    label='Email'
                    value={patient.email || 'Não informado'}
                    className='md:col-span-2'
                  />
                </div>

                {(patient.address_line1 || patient.city) && (
                  <>
                    <Separator />
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        <MapPin className='w-4 h-4' />
                        Endereço
                      </div>
                      <div className='text-sm text-muted-foreground pl-6'>
                        {patient.address_line1 && <p>{patient.address_line1}</p>}
                        {patient.address_line2 && <p>{patient.address_line2}</p>}
                        {(patient.city || patient.state) && (
                          <p>
                            {patient.city}
                            {patient.state && ` - ${patient.state}`}
                            {patient.postal_code && ` • CEP: ${patient.postal_code}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {patient.emergency_contact_name && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Contato de Emergência</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <InfoItem
                      icon={<User className='w-4 h-4' />}
                      label='Nome'
                      value={patient.emergency_contact_name}
                    />
                    <InfoItem
                      icon={<Phone className='w-4 h-4' />}
                      label='Telefone'
                      value={patient.emergency_contact_phone || 'Não informado'}
                    />
                    <InfoItem
                      icon={<Heart className='w-4 h-4' />}
                      label='Relação'
                      value={patient.emergency_contact_relationship || 'Não informado'}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medical Data Tab */}
          <TabsContent value='medical' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Informações Médicas</CardTitle>
                <CardDescription>
                  Dados clínicos e histórico de saúde do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <InfoItem
                    icon={<Activity className='w-4 h-4' />}
                    label='Tipo Sanguíneo'
                    value={patient.blood_type || 'Não informado'}
                  />
                  <InfoItem
                    icon={<Shield className='w-4 h-4' />}
                    label='Convênio'
                    value={patient.insurance_provider || 'Particular'}
                  />
                </div>

                <Separator />

                {/* Allergies */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm font-medium text-destructive'>
                    <AlertCircle className='w-4 h-4' />
                    Alergias
                  </div>
                  <div className='pl-6'>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant='destructive'>
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>Nenhuma alergia registrada</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Chronic Conditions */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <Heart className='w-4 h-4' />
                    Condições Crônicas
                  </div>
                  <div className='pl-6'>
                    {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {patient.chronic_conditions.map((condition, idx) => (
                          <Badge key={idx} variant='outline'>
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>Nenhuma condição crônica registrada</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Current Medications */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <FileText className='w-4 h-4' />
                    Medicamentos em Uso
                  </div>
                  <div className='pl-6'>
                    {patient.current_medications && patient.current_medications.length > 0 ? (
                      <ul className='list-disc list-inside space-y-1'>
                        {patient.current_medications.map((medication, idx) => (
                          <li key={idx} className='text-sm text-muted-foreground'>
                            {medication}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-sm text-muted-foreground'>Nenhum medicamento em uso</p>
                    )}
                  </div>
                </div>

                {patient.patient_notes && (
                  <>
                    <Separator />
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        <FileText className='w-4 h-4' />
                        Observações
                      </div>
                      <div className='pl-6'>
                        <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                          {patient.patient_notes}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value='appointments' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Histórico de Consultas</CardTitle>
                <CardDescription>
                  Consultas agendadas, realizadas e canceladas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8 text-muted-foreground'>
                  <Calendar className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>Histórico de consultas será exibido aqui</p>
                  <p className='text-sm'>Em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent Tab */}
          <TabsContent value='consent' className='space-y-4'>
            <PatientConsentManager patient={patient} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <PatientEditModal
        patient={patient}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Delete Dialog */}
      <PatientDeleteDialog
        patient={patient}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

// Helper component for displaying info items
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sensitive?: boolean;
  className?: string;
}

function InfoItem({ icon, label, value, sensitive, className }: InfoItemProps) {
  return (
    <div className={className}>
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-medium pl-6 ${sensitive ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}
