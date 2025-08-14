import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import { PortalLayout } from '@/components/patient-portal/layout/PortalLayout';
import { PatientDashboard } from '@/components/patient-portal/dashboard/PatientDashboard';

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/portal');
  }

  // Get patient session info
  const { data: patientSession, error } = await supabase
    .from('patient_portal_sessions')
    .select(`
      *,
      patient:patients(
        id,
        name,
        email,
        phone,
        birth_date,
        created_at
      ),
      clinic:clinics(
        id,
        name,
        email,
        phone
      )
    `)
    .eq('session_token', session.access_token)
    .eq('is_active', true)
    .single();

  if (error || !patientSession) {
    console.error('Patient session error:', error);
    redirect('/portal');
  }

  // Prepare patient data for layout
  const patient = {
    id: patientSession.patient.id,
    patient_name: patientSession.patient.name,
    email: patientSession.patient.email,
    phone: patientSession.patient.phone,
    clinic_name: patientSession.clinic.name,
    session_token: patientSession.session_token,
    expires_at: patientSession.expires_at,
    avatar_url: undefined // Will be implemented later
  };

  // Get clinic branding
  const { data: clinicSettings } = await supabase
    .from('patient_portal_settings')
    .select('*')
    .eq('clinic_id', patientSession.clinic_id)
    .single();

  const clinicBranding = {
    name: patientSession.clinic.name,
    logo: clinicSettings?.custom_logo,
    primaryColor: clinicSettings?.primary_color || '#6366f1',
    secondaryColor: clinicSettings?.secondary_color || '#8b5cf6'
  };

  return (
    <PortalLayout patient={patient} clinicBranding={clinicBranding}>
      <PatientDashboard patient={patient} />
    </PortalLayout>
  );
}