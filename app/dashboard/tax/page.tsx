// Brazilian Tax System Main Page
// Story 5.5: Comprehensive tax management interface

import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calculator,
  FileText,
  BarChart3,
  Settings,
  Shield,
  TrendingUp
} from 'lucide-react';
import TaxDashboard from '@/components/tax/tax-dashboard';
import TaxCalculator from '@/components/tax/tax-calculator';
import NFEManagement from '@/components/tax/nfe-management';

// This would typically come from auth context or params
const CLINIC_ID = "clinic-id-placeholder"; // Replace with actual clinic ID

export default function TaxSystemPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sistema Fiscal Brasileiro</h1>
        <p className="text-gray-600 mt-2">
          Gestão completa de impostos, NFes e compliance fiscal para clínicas de saúde
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFes Autorizadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impostos Calculados</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">Total no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga Tributária</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Taxa efetiva média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Em conformidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculadora</span>
          </TabsTrigger>
          <TabsTrigger value="nfe" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>NFe</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Suspense fallback={<div>Carregando dashboard...</div>}>
            <TaxDashboard clinicId={CLINIC_ID} />
          </Suspense>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Suspense fallback={<div>Carregando calculadora...</div>}>
            <TaxCalculator clinicId={CLINIC_ID} />
          </Suspense>
        </TabsContent>

        {/* NFe Tab */}
        <TabsContent value="nfe" className="space-y-4">
          <Suspense fallback={<div>Carregando NFes...</div>}>
            <NFEManagement clinicId={CLINIC_ID} />
          </Suspense>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Conformidade Fiscal</span>
              </CardTitle>
              <CardDescription>
                Monitore o compliance fiscal da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Configuração Tributária</h3>
                    <p className="text-sm text-gray-600">Regime tributário e alíquotas configurados</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Configurado</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Certificado Digital</h3>
                    <p className="text-sm text-gray-600">Certificado A1/A3 para assinatura digital</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">Pendente</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Integração SEFAZ</h3>
                    <p className="text-sm text-gray-600">Conexão com a Secretaria da Fazenda</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">Em desenvolvimento</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Backup SPED</h3>
                    <p className="text-sm text-gray-600">Sistema Público de Escrituração Digital</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Ativo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações Fiscais</span>
              </CardTitle>
              <CardDescription>
                Configure os parâmetros fiscais da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Identificação Fiscal</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">CNPJ</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border rounded-md" 
                          placeholder="00.000.000/0000-00"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Inscrição Estadual</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border rounded-md" 
                          placeholder="Opcional"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Inscrição Municipal</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border rounded-md" 
                          placeholder="Opcional"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Regime Tributário</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Regime</label>
                        <select className="w-full px-3 py-2 border rounded-md" disabled>
                          <option>Simples Nacional</option>
                          <option>Lucro Presumido</option>
                          <option>Lucro Real</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="simples" disabled />
                        <label htmlFor="simples" className="text-sm">Optante do Simples Nacional</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Nota:</strong> As configurações fiscais estão desabilitadas na versão atual. 
                    Para configurar os parâmetros fiscais da sua clínica, entre em contato com o suporte técnico.
                  </p>
                  <div className="space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed">
                      Salvar Configurações
                    </button>
                    <button className="px-4 py-2 border rounded-md opacity-50 cursor-not-allowed">
                      Validar Setup
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}