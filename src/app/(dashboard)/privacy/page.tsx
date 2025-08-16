import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ConsentManager,
  DataSubjectRights,
  ComplianceDashboard,
} from '@/components/lgpd';

export const metadata: Metadata = {
  title: 'Privacidade e LGPD | NeonPro',
  description:
    'Gerencie suas preferências de privacidade e exercite seus direitos conforme a LGPD',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Privacidade e LGPD</h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas preferências de privacidade e exercite seus direitos
          conforme a Lei Geral de Proteção de Dados
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="consent">Consentimentos</TabsTrigger>
          <TabsTrigger value="rights">Direitos LGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ComplianceDashboard />
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <ConsentManager />
        </TabsContent>

        <TabsContent value="rights" className="space-y-6">
          <DataSubjectRights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
