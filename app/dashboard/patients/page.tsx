import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/components/navigation/dashboard-layout';
import { PatientManagementDashboard } from '@/components/dashboard/patients/PatientManagementDashboard';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Patient Management Page
 * 
 * FHIR-compliant patient management with LGPD compliance.
 * Implements HL7 FHIR R4 Patient resource structure and Brazilian
 * data protection requirements.
 */

export default async function PatientsPage() {
  // Server-side authentication check
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Define breadcrumbs for navigation
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Patients' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient records with FHIR compliance and LGPD data protection.
          </p>
        </div>

        {/* Patient Management Dashboard */}
        <Suspense fallback={<PatientManagementSkeleton />}>
          <PatientManagementDashboard />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// Loading skeleton for patient management dashboard
function PatientManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}