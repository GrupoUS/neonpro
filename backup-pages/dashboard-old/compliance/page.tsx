import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsentFormsManager } from '@/components/compliance/consent-forms-manager';
import { PatientConsentManager } from '@/components/compliance/patient-consent-manager';
import ConsentWithdrawalManager from '@/components/compliance/consent-withdrawal-manager';
import ComplianceReportingDashboard from '@/components/compliance/compliance-reporting-dashboard';
import ComplianceAlertsSystem from '@/components/compliance/compliance-alerts-system';
import ConsentFormBuilder from '@/components/compliance/consent-form-builder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Users, AlertTriangle, BarChart3, Bell, Settings, UserCheck } from 'lucide-react';

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user profile to determine role and clinic
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single();

  if (!profile?.clinic_id) {
    redirect('/onboarding');
  }

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Compliance & Documentação" }
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Compliance & Documentação</h1>
              <p className="text-muted-foreground">
                Gerencie consentimentos, auditorias e conformidade com LGPD
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              LGPD Compliant
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              CFM Certified
            </Badge>
          </div>
        </div>

        {/* Compliance Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consent Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed Consents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">
                +180 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                -2 from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Tabs */}
        <Tabs defaultValue="consent-forms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="consent-forms" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Formulários</span>
            </TabsTrigger>
            <TabsTrigger value="patient-consents" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Consentimentos</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Revogações</span>
            </TabsTrigger>
            <TabsTrigger value="form-builder" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Form Builder</span>
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Auditoria</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consent-forms" className="space-y-6">
            <Suspense fallback={<div>Carregando formulários...</div>}>
              <ConsentFormsManager 
                clinicId={profile.clinic_id} 
                userRole={profile.role || 'user'} 
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="patient-consents" className="space-y-6">
            <Suspense fallback={<div>Carregando consentimentos...</div>}>
              <PatientConsentManager 
                clinicId={profile.clinic_id} 
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <Suspense fallback={<div>Carregando revogações...</div>}>
              <ConsentWithdrawalManager 
                clinicId={profile.clinic_id} 
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="form-builder" className="space-y-6">
            <Suspense fallback={<div>Carregando construtor de formulários...</div>}>
              <ConsentFormBuilder 
                clinicId={profile.clinic_id} 
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <Suspense fallback={<div>Carregando relatórios...</div>}>
              <ComplianceReportingDashboard 
                clinicId={profile.clinic_id} 
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Suspense fallback={<div>Carregando alertas...</div>}>
              <ComplianceAlertsSystem 
                clinicId={profile.clinic_id} 
                userId={user.id}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Logs de Auditoria</h3>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Logs de auditoria estarão disponíveis em breve.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}