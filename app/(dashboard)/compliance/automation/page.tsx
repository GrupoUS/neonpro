import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AutomationDashboard from '@/components/compliance/automation/AutomationDashboard';
import AutomationConfig from '@/components/compliance/automation/AutomationConfig';
import { Activity, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Automação LGPD | NeonPro',
  description: 'Dashboard de automação e monitoramento de conformidade LGPD em tempo real',
};

export default function AutomationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Automação LGPD</h2>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="dashboard" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <AutomationDashboard />
        </TabsContent>
        
        <TabsContent value="config" className="space-y-4">
          <AutomationConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}