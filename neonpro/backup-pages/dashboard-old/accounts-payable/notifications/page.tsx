import { createClient } from "@/app/utils/supabase/server";
import { DashboardAlerts } from "@/components/dashboard/accounts-payable/dashboard-alerts";
import { DueDateMonitoring } from "@/components/dashboard/accounts-payable/due-date-monitoring";
import { PaymentCalendar } from "@/components/dashboard/accounts-payable/payment-calendar";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, Clock, Settings } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
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

  if (!user?.user_metadata?.clinic_id) {
    redirect("/dashboard");
  }

  const clinicId = user.user_metadata.clinic_id;

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Contas a Pagar", href: "/dashboard/accounts-payable" },
    { title: "Notificações e Lembretes" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Notificações e Lembretes
          </h2>
          <p className="text-muted-foreground mt-2">
            Sistema de monitoramento automático de vencimentos e alertas de
            pagamentos
          </p>
        </div>

        {/* Tabs de Navegação */}
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            <DueDateMonitoring clinicId={clinicId} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <DashboardAlerts clinicId={clinicId} limit={20} showTitle={false} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <PaymentCalendar clinicId={clinicId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Configurações de Notificações
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure lembretes automáticos, escalações e preferências de
                notificação
              </p>
              <p className="text-sm text-muted-foreground">
                Esta funcionalidade será implementada na próxima versão
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
