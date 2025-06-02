
import { BarChart3, Search, Filter, Download, LineChart, PieChart, BarChart } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RelatoriosPage = () => {
  return (
    <SidebarProvider>
      <Helmet>
        <title>Relatórios</title>
        <meta name="description" content="Análise de dados da sua clínica" />
      </Helmet>
      
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="fade-in-up">
                    <h1 className="text-2xl font-serif font-bold text-dark-blue flex items-center space-x-2">
                      <BarChart3 className="w-6 h-6 text-gold" />
                      <span>Relatórios</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Análise de dados e métricas da sua clínica
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Última Semana</SelectItem>
                      <SelectItem value="month">Último Mês</SelectItem>
                      <SelectItem value="quarter">Último Trimestre</SelectItem>
                      <SelectItem value="year">Último Ano</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="text-dark-blue border-gray-300">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-elegant fade-in-up">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-serif text-lg font-semibold text-dark-blue">
                  Relatórios de Desempenho
                </h2>
              </div>
              
              <div>
                <Tabs defaultValue="revenue">
                  <div className="px-4 pt-2">
                    <TabsList>
                      <TabsTrigger value="revenue">Faturamento</TabsTrigger>
                      <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                      <TabsTrigger value="services">Serviços</TabsTrigger>
                      <TabsTrigger value="clients">Clientes</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="revenue" className="p-4">
                    <div className="space-y-6">
                      <div className="bg-light-gray/10 rounded-lg p-6">
                        <h3 className="text-md font-medium text-dark-blue mb-4 flex items-center">
                          <LineChart className="w-5 h-5 mr-2 text-gold" />
                          Faturamento Mensal
                        </h3>
                        <div className="h-64 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-light-gray/30 flex items-center justify-center">
                              <span className="text-2xl">📊</span>
                            </div>
                            <h4 className="text-lg font-medium text-dark-blue mb-2">
                              Gráfico de Faturamento
                            </h4>
                            <p className="text-sm text-gray-500 max-w-xs">
                              Visualização do faturamento mensal da clínica.
                              Acompanhe a evolução financeira ao longo do tempo.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-light-gray/10 rounded-lg p-6">
                          <h3 className="text-md font-medium text-dark-blue mb-4 flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-gold" />
                            Faturamento por Categoria
                          </h3>
                          <div className="h-48 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Gráfico de distribuição por categoria</p>
                          </div>
                        </div>
                        
                        <div className="bg-light-gray/10 rounded-lg p-6">
                          <h3 className="text-md font-medium text-dark-blue mb-4 flex items-center">
                            <BarChart className="w-5 h-5 mr-2 text-gold" />
                            Comparativo Anual
                          </h3>
                          <div className="h-48 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Comparativo de faturamento anual</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appointments" className="p-4">
                    <div className="bg-light-gray/10 rounded-lg p-6">
                      <h3 className="text-md font-medium text-dark-blue mb-4">
                        Análise de Agendamentos
                      </h3>
                      <div className="h-64 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Dados de agendamentos serão exibidos aqui</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="p-4">
                    <div className="bg-light-gray/10 rounded-lg p-6">
                      <h3 className="text-md font-medium text-dark-blue mb-4">
                        Serviços Mais Populares
                      </h3>
                      <div className="h-64 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Dados de serviços serão exibidos aqui</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="clients" className="p-4">
                    <div className="bg-light-gray/10 rounded-lg p-6">
                      <h3 className="text-md font-medium text-dark-blue mb-4">
                        Estatísticas de Clientes
                      </h3>
                      <div className="h-64 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border border-light-gray/40 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Dados de clientes serão exibidos aqui</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RelatoriosPage;
