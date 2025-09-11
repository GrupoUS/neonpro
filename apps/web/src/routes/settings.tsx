import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { createFileRoute } from '@tanstack/react-router';
import { Bell, Globe, Lock, Palette, Shield, Users } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <div className="text-sm text-muted-foreground">
          Personalize sua experiência no NeonPro
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Configurações Gerais</span>
            </CardTitle>
            <CardDescription>
              Configurações básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Nome da Clínica</Label>
              <Input
                id="clinicName"
                placeholder="Nome da sua clínica"
                defaultValue="Clínica NeonPro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Aparência</span>
            </CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 border rounded-md text-center hover:bg-accent">
                  <div className="w-full h-8 bg-white border rounded mb-2"></div>
                  <span className="text-xs">Claro</span>
                </button>
                <button className="p-3 border rounded-md text-center hover:bg-accent">
                  <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                  <span className="text-xs">Escuro</span>
                </button>
                <button className="p-3 border rounded-md text-center hover:bg-accent border-primary">
                  <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                  <span className="text-xs">Auto</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-primary"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Agendamento</p>
                <p className="text-sm text-muted-foreground">Novos agendamentos e alterações</p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes de Consulta</p>
                <p className="text-sm text-muted-foreground">Lembretes 24h antes da consulta</p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios Financeiros</p>
                <p className="text-sm text-muted-foreground">Relatórios mensais automáticos</p>
              </div>
              <Button variant="outline" size="sm">Desativado</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Atualizações do Sistema</p>
                <p className="text-sm text-muted-foreground">Novidades e atualizações</p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Segurança adicional para login</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados</p>
              </div>
              <Button variant="outline" size="sm">Ver Sessões</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Log de Atividades</p>
                <p className="text-sm text-muted-foreground">Histórico de ações no sistema</p>
              </div>
              <Button variant="outline" size="sm">Ver Log</Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Privacidade</span>
            </CardTitle>
            <CardDescription>
              Configurações de privacidade e LGPD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Coleta de Dados</p>
                <p className="text-sm text-muted-foreground">Dados coletados para melhorar o serviço</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compartilhamento de Dados</p>
                <p className="text-sm text-muted-foreground">Como seus dados são compartilhados</p>
              </div>
              <Button variant="outline" size="sm">Ver Política</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exportar Dados</p>
                <p className="text-sm text-muted-foreground">Baixe uma cópia dos seus dados</p>
              </div>
              <Button variant="outline" size="sm">Exportar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Equipe</span>
            </CardTitle>
            <CardDescription>
              Gerencie usuários e permissões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Convidar Usuários</p>
                <p className="text-sm text-muted-foreground">Adicione novos membros à equipe</p>
              </div>
              <Button size="sm">Convidar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Gerenciar Permissões</p>
                <p className="text-sm text-muted-foreground">Configure níveis de acesso</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Usuários Ativos</p>
                <p className="text-sm text-muted-foreground">3 usuários ativos</p>
              </div>
              <Button variant="outline" size="sm">Ver Todos</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Restaurar Padrões</Button>
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  );
}
