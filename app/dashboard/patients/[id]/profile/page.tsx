import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { PatientProfileEditForm } from '@/components/dashboard/patients/profile-edit-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Clock, Heart } from 'lucide-react'

interface PatientProfilePageProps {
  params: Promise<{
    id: string
  }>
}

async function getPatientProfile(patientId: string, supabase: any) {
  const { data: patient, error } = await supabase
    .from('patients')
    .select(`
      *,
      profiles:patient_profiles(*),
      emergency_contacts(*),
      lgpd_consents(*)
    `)
    .eq('id', patientId)
    .single()

  if (error || !patient) {
    console.error('Error fetching patient:', error)
    return null
  }

  return patient
}export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch patient data
  const patient = await getPatientProfile(id, supabase)
  if (!patient) {
    notFound()
  }

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pacientes", href: "/dashboard/patients" },
    { title: patient.full_name || 'Paciente', href: `/dashboard/patients/${id}` },
    { title: "Perfil" }
  ]

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Patient Overview Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {patient.full_name || 'Paciente sem nome'}
                    {patient.lgpd_consents?.[0]?.sensitive_data_consent && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        LGPD Compliant
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {patient.email && `${patient.email} • `}
                    {patient.mobile || patient.phone}
                  </CardDescription>
                </div>
              </div>              <div className="text-right">
                <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                {patient.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          {patient.emergency_contacts && patient.emergency_contacts.length > 0 && (
            <CardContent>
              <Separator className="mb-4" />
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Contatos de Emergência</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {patient.emergency_contacts.slice(0, 2).map((contact: any, index: number) => (
                  <span key={index}>
                    {contact.name} ({contact.relationship}) - {contact.phone}
                  </span>
                ))}
                {patient.emergency_contacts.length > 2 && (
                  <span>+{patient.emergency_contacts.length - 2} mais</span>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Profile Edit Form */}
        <PatientProfileEditForm
          patientId={id}
          initialData={patient.profiles?.[0] || patient}
          onSuccess={() => {
            // Redirect or refresh as needed
            window.location.reload()
          }}
          onCancel={() => {
            window.history.back()
          }}
        />
      </div>
    </DashboardLayout>
  )
}