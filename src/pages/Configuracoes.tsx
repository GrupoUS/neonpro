
import { Settings, User, Building, CreditCard, Bell, Shield, Package, Save } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ConfiguracoesPage = () => {
  return (
    <SidebarProvider>
      <Helmet>
        <title>Configurações</title>
        <meta name="description" content="Configure as opções do sistema" />
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
                      <Settings className="w-6 h-6 text-gold" />
                      <span>Configurações</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Gerencie as configurações do sistema
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-elegant fade-in-up">
              <Tabs defaultValue="profile" className="w-full">
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto px-4">
                    <TabsList className="h-14">
                      <TabsTrigger value="profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </TabsTrigger>
                      <TabsTrigger value="clinic" className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Clínica
                      </TabsTrigger>
                      <TabsTrigger value="billing" className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Faturamento
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Notificações
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Segurança
                      </TabsTrigger>
                      <TabsTrigger value="integrations" className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Integrações
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <TabsContent value="profile" className="p-6 focus:outline-none">
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Informações do Perfil</h2>
                    
                    <div className="flex flex-col space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center">
                          <User className="w-10 h-10 text-gold" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">Foto do Perfil</h3>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">Alterar Foto</Button>
                            <Button variant="ghost" size="sm" className="text-gray-500">Remover</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" defaultValue="Dra. Maria Silva" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Função</Label>
                          <Input id="role" defaultValue="Administradora" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue="maria.silva@clinica.com" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" defaultValue="(11) 99999-9999" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="bg-gold hover:bg-gold/80 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="clinic" className="p-6 focus:outline-none">
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Informações da Clínica</h2>
                    
                    <div className="space-y-6">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="clinic-name">Nome da Clínica</Label>
                          <Input id="clinic-name" defaultValue="NEON PRO Estética Avançada" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input id="address" defaultValue="Av. Paulista, 1000" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade/Estado</Label>
                          <Input id="city" defaultValue="São Paulo/SP" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clinic-email">Email da Clínica</Label>
                          <Input id="clinic-email" defaultValue="contato@neonpro.com.br" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clinic-phone">Telefone da Clínica</Label>
                          <Input id="clinic-phone" defaultValue="(11) 3333-3333" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="bg-gold hover:bg-gold/80 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="p-6 focus:outline-none">
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Preferências de Notificações</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark-blue">Lembretes de Agendamento</p>
                            <p className="text-sm text-gray-500">Receba notificações sobre agendamentos próximos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark-blue">Novas Marcações</p>
                            <p className="text-sm text-gray-500">Receba notificações quando novos agendamentos forem marcados</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark-blue">Alertas Financeiros</p>
                            <p className="text-sm text-gray-500">Receba alertas sobre transações financeiras importantes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark-blue">Atualizações do Sistema</p>
                            <p className="text-sm text-gray-500">Receba informações sobre atualizações do NEON PRO</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="bg-gold hover:bg-gold/80 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Preferências
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="p-6 focus:outline-none">
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Segurança</h2>
                    
                    <div className="space-y-6">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Senha Atual</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        
                        <div></div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nova Senha</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="bg-gold hover:bg-gold/80 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Atualizar Senha
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="p-6 focus:outline-none">
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Informações de Faturamento</h2>
                    <p>Gerencie suas informações de pagamento e assinatura aqui.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="integrations" className="p-6 focus:outline-none">
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif font-semibold text-dark-blue mb-4">Integrações</h2>
                    <p>Conecte NEON PRO com outros serviços e aplicações.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ConfiguracoesPage;
