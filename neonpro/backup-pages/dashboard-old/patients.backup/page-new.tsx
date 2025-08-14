import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import { PatientsClientPage } from "./client-page";

export default async function PatientsPage() {
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

  // Mock data para demonstração com acessibilidade
  const patients = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-02-10",
      status: "active" as const,
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@example.com",
      phone: "(11) 88888-8888",
      cpf: "987.654.321-00",
      lastVisit: "2024-01-10",
      status: "inactive" as const,
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@example.com",
      phone: "(11) 77777-7777",
      cpf: "456.789.123-00",
      nextAppointment: "2024-02-05",
      status: "pending" as const,
    },
  ];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pacientes" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <PatientsClientPage initialPatients={patients} />
    </DashboardLayout>
  );
}
