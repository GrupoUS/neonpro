// Server component wrapper
import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import AppointmentsPageClient from "./appointments-client";
import type { AppointmentWithRelations } from "@/app/lib/types/appointments";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get clinic_id from user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) {
    redirect("/dashboard");
  }

  // Load appointments with related data
  const { data: appointments = [] } = await supabase
    .from("appointments")
    .select(`
      id,
      patient_id,
      professional_id,
      service_type_id,
      status,
      start_time,
      end_time,
      notes,
      internal_notes,
      created_at,
      updated_at,
      patients:patient_id (
        id,
        full_name,
        phone,
        email,
        date_of_birth
      ),
      professionals:professional_id (
        id,
        full_name,
        specialization,
        phone,
        email
      ),
      service_types:service_type_id (
        id,
        name,
        description,
        duration_minutes,
        price
      )
    `)
    .eq("clinic_id", profile.clinic_id)
    .gte("start_time", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .lte("start_time", new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()) // Next 60 days
    .order("start_time", { ascending: true });

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Agendamentos" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <AppointmentsPageClient 
        initialAppointments={appointments as AppointmentWithRelations[]}
        user={user}
      />
    </DashboardLayout>
  );
}