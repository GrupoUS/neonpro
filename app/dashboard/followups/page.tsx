// =====================================================================================
// FOLLOW-UPS MANAGEMENT PAGE
// Epic 7.3: Main page for treatment follow-up management
// =====================================================================================

import FollowupDashboard from "@/app/components/dashboard/followups/followup-dashboard";
import FollowupManagement from "@/app/components/dashboard/followups/followup-management";
import TemplateManagement from "@/app/components/dashboard/followups/template-management";
import ProtocolManagement from "@/app/components/dashboard/followups/protocol-management";
import { WhatsAppConfiguration } from "@/app/components/dashboard/followups/whatsapp-configuration";
import SMSConfiguration from "@/app/components/dashboard/followups/sms-configuration";
import SMSMessaging from "@/app/components/dashboard/followups/sms-messaging";
import SMSAnalytics from "@/app/components/dashboard/followups/sms-analytics";
import EmailConfiguration from "@/app/components/dashboard/followups/email-configuration";
import EmailMessaging from "@/app/components/dashboard/followups/email-messaging";
import EmailAnalytics from "@/app/components/dashboard/followups/email-analytics";
import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquareIcon, SettingsIcon, Smartphone, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function FollowupsPage() {
  // Verify authentication
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

  // Get user's clinic - for now using a placeholder
  // TODO: Implement proper clinic detection from user profile
  const clinicId = "default-clinic-id";

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Follow-ups", href: "/dashboard/followups" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Follow-ups de Tratamento
            </h1>
            <p className="text-muted-foreground">
              Gerencie follow-ups automáticos e acompanhe a satisfação dos
              pacientes
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="followups" className="flex items-center gap-2">
              <MessageSquareIcon className="h-4 w-4" />
              Follow-ups
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="protocols" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Protocolos
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquareIcon className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <FollowupDashboard clinicId={clinicId} />
            </Suspense>
          </TabsContent>

          {/* Follow-ups Management Tab */}
          <TabsContent value="followups" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <FollowupManagement clinicId={clinicId} />
            </Suspense>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <TemplateManagement clinicId={clinicId} />
            </Suspense>
          </TabsContent>

          {/* Protocols Tab */}
          <TabsContent value="protocols" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <ProtocolManagement clinicId={clinicId} />
            </Suspense>
          </TabsContent>

          {/* WhatsApp Configuration Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <WhatsAppConfiguration />
            </Suspense>
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <Tabs defaultValue="configuration" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="configuration" className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Configuração
                  </TabsTrigger>
                  <TabsTrigger value="messaging" className="flex items-center gap-2">
                    <MessageSquareIcon className="h-4 w-4" />
                    Enviar SMS
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="configuration">
                  <SMSConfiguration />
                </TabsContent>

                <TabsContent value="messaging">
                  <SMSMessaging />
                </TabsContent>

                <TabsContent value="analytics">
                  <SMSAnalytics />
                </TabsContent>
              </Tabs>
            </Suspense>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <Tabs defaultValue="configuration" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="configuration" className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Configuração
                  </TabsTrigger>
                  <TabsTrigger value="messaging" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar Email
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="configuration">
                  <EmailConfiguration />
                </TabsContent>

                <TabsContent value="messaging">
                  <EmailMessaging />
                </TabsContent>

                <TabsContent value="analytics">
                  <EmailAnalytics />
                </TabsContent>
              </Tabs>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Loading skeleton for dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
