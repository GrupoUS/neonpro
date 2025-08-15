import { Activity, Settings } from 'lucide-react';
import type { Metadata } from 'next';
import AutomationConfig from '@/components/compliance/automation/AutomationConfig';
import AutomationDashboard from '@/components/compliance/automation/AutomationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Automação LGPD | NeonPro',
  description:
    'Dashboard de automação e monitoramento de conformidade LGPD em tempo real',
};

export default function AutomationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Automação LGPD</h2>
      </div>

      <Tabs className="space-y-4" defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger className="flex items-center" value="dashboard">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger className="flex items-center" value="config">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="dashboard">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent className="space-y-4" value="config">
          <AutomationConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
