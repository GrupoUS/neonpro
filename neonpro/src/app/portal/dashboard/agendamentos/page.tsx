import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import { PortalLayout } from '@/components/patient-portal/layout/PortalLayout';
import { AppointmentManager } from '@/components/patient-portal/appointments';

export default async function AgendamentosPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/portal');
  }

  // Get patient profile
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!patient) {
    redirect('/portal');
  }

  return (
    <PortalLayout patient={patient}>
      <AppointmentManager />
    </PortalLayout>
  );
}