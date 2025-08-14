import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarPlus, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppointmentForm } from "@/components/dashboard/appointments/appointment-form";
import type { Patient, Professional, ServiceType } from "@/app/lib/types/appointments";

export default async function NewAppointmentPage() {
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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.clinic_id) {
    redirect("/dashboard");
  }

  // Load required data for the form
  const [patientsResult, professionalsResult, serviceTypesResult] = await Promise.all([
    // Load patients
    supabase
      .from("patients")
      .select("id, full_name, phone, email, date_of_birth")
      .eq("clinic_id", profile.clinic_id)
      .eq("is_active", true)
      .order("full_name"),
    
    // Load professionals
    supabase
      .from("professionals")
      .select("id, full_name, specialization, is_active")
      .eq("clinic_id", profile.clinic_id)
      .eq("is_active", true)
      .order("full_name"),
    
    // Load service types
    supabase
      .from("service_types")
      .select("id, name, description, duration_minutes, price")
      .eq("clinic_id", profile.clinic_id)
      .eq("is_active", true)
      .order("name"),
  ]);

  // Handle errors and set defaults
  const patients: Patient[] = patientsResult.data || [];
  const professionals: Professional[] = professionalsResult.data || [];
  const serviceTypes: ServiceType[] = serviceTypesResult.data || [];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Agendamentos", href: "/dashboard/appointments" },
    { title: "Nova Consulta" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Nova Consulta</h2>
                <p className="text-muted-foreground">
                  Agende uma nova consulta para um paciente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Agendamento</CardTitle>
            <CardDescription>
              Preencha as informações abaixo para criar um novo agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error handling for empty data */}
            {patients.length === 0 && (
              <div className="p-4 mb-6 border border-orange-200 rounded-md bg-orange-50">
                <div className="flex items-center gap-2 text-orange-700">
                  <CalendarPlus className="h-4 w-4" />
                  <h4 className="font-medium">Dados necessários em falta</h4>
                </div>
                <p className="text-orange-600 text-sm mt-1">
                  Nenhum paciente encontrado. 
                  <Link href="/dashboard/patients/new" className="underline ml-1">
                    Cadastre um paciente primeiro
                  </Link>
                </p>
              </div>
            )}

            {professionals.length === 0 && (
              <div className="p-4 mb-6 border border-orange-200 rounded-md bg-orange-50">
                <div className="flex items-center gap-2 text-orange-700">
                  <CalendarPlus className="h-4 w-4" />
                  <h4 className="font-medium">Dados necessários em falta</h4>
                </div>
                <p className="text-orange-600 text-sm mt-1">
                  Nenhum profissional encontrado. 
                  <Link href="/dashboard/professionals/new" className="underline ml-1">
                    Cadastre um profissional primeiro
                  </Link>
                </p>
              </div>
            )}

            {serviceTypes.length === 0 && (
              <div className="p-4 mb-6 border border-orange-200 rounded-md bg-orange-50">
                <div className="flex items-center gap-2 text-orange-700">
                  <CalendarPlus className="h-4 w-4" />
                  <h4 className="font-medium">Dados necessários em falta</h4>
                </div>
                <p className="text-orange-600 text-sm mt-1">
                  Nenhum tipo de serviço encontrado. 
                  <Link href="/dashboard/services/new" className="underline ml-1">
                    Cadastre um tipo de serviço primeiro
                  </Link>
                </p>
              </div>
            )}

            {/* Render form only if we have minimum required data */}
            {patients.length > 0 && professionals.length > 0 && serviceTypes.length > 0 ? (
              <AppointmentForm
                patients={patients}
                professionals={professionals}
                serviceTypes={serviceTypes}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete os dados necessários para criar agendamentos</p>
                <div className="flex justify-center gap-4 mt-6">
                  {patients.length === 0 && (
                    <Link href="/dashboard/patients/new">
                      <Button variant="outline" size="sm">
                        Cadastrar Pacientes
                      </Button>
                    </Link>
                  )}
                  {professionals.length === 0 && (
                    <Link href="/dashboard/professionals/new">
                      <Button variant="outline" size="sm">
                        Cadastrar Profissionais
                      </Button>
                    </Link>
                  )}
                  {serviceTypes.length === 0 && (
                    <Link href="/dashboard/services/new">
                      <Button variant="outline" size="sm">
                        Cadastrar Serviços
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}