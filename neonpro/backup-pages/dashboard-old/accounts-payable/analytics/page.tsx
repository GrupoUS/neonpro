import CommunicationLog from "@/components/dashboard/accounts-payable/communication-log";
import VendorPerformanceDashboard from "@/components/dashboard/accounts-payable/vendor-performance-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, MessageSquare, TrendingUp } from "lucide-react";

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics de Fornecedores</h1>
        <p className="text-muted-foreground">
          Análise de performance e comunicação com fornecedores
        </p>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dashboard de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VendorPerformanceDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Log de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommunicationLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
