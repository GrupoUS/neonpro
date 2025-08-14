'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useEmail } from '@/app/hooks/use-email';
import { EmailProvider, EmailProviderConfig } from '@/app/types/email';
import { toast } from 'sonner';
import { Loader2, Plus, Settings, Trash2, Edit } from 'lucide-react';

export default function EmailConfiguration() {
  const { configs, isLoading, createConfig, updateConfig, deleteConfig, testConnection } = useEmail();
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>('postmark');
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailProviderConfig | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const configData = {
        provider: selectedProvider,
        config: getProviderConfig(selectedProvider, formData),
        is_active: formData.get('is_active') === 'on',
        priority: parseInt(formData.get('priority') as string) || 1
      };

      if (editingConfig) {
        await updateConfig.mutateAsync({
          id: editingConfig.id,
          ...configData
        });
        toast.success('Configuração atualizada com sucesso!');
      } else {
        await createConfig.mutateAsync(configData);
        toast.success('Configuração criada com sucesso!');
      }
      
      setShowForm(false);
      setEditingConfig(null);
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleTest = async (config: EmailProviderConfig) => {
    setIsTesting(config.id);
    try {
      const result = await testConnection.mutateAsync(config.id);
      if (result.success) {
        toast.success('Conexão testada com sucesso!');
      } else {
        toast.error(`Erro no teste: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setIsTesting(null);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    
    try {
      await deleteConfig.mutateAsync(configId);
      toast.success('Configuração excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir configuração');
    }
  };

  const getProviderConfig = (provider: EmailProvider, formData: FormData) => {
    switch (provider) {
      case 'postmark':
        return {
          apiKey: formData.get('apiKey') as string,
          fromEmail: formData.get('fromEmail') as string,
          fromName: formData.get('fromName') as string
        };
      case 'sendgrid':
        return {
          apiKey: formData.get('apiKey') as string,
          fromEmail: formData.get('fromEmail') as string,
          fromName: formData.get('fromName') as string
        };
      case 'mailgun':
        return {
          apiKey: formData.get('apiKey') as string,
          domain: formData.get('domain') as string,
          fromEmail: formData.get('fromEmail') as string,
          fromName: formData.get('fromName') as string
        };
      case 'smtp':
        return {
          host: formData.get('host') as string,
          port: parseInt(formData.get('port') as string),
          secure: formData.get('secure') === 'on',
          user: formData.get('user') as string,
          pass: formData.get('pass') as string,
          fromEmail: formData.get('fromEmail') as string,
          fromName: formData.get('fromName') as string
        };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Configurações de Email</h3>
          <p className="text-sm text-muted-foreground">
            Configure os provedores de email para sua clínica
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Configuração
        </Button>
      </div>

      {/* Lista de Configurações */}
      <div className="grid gap-4">
        {configs?.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base capitalize">
                    {config.provider}
                  </CardTitle>
                  <Badge variant={config.is_active ? 'default' : 'secondary'}>
                    {config.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline">
                    Prioridade {config.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(config)}
                    disabled={isTesting === config.id}
                  >
                    {isTesting === config.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingConfig(config);
                      setSelectedProvider(config.provider);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>De: {config.config.fromEmail}</p>
                {config.config.fromName && (
                  <p>Nome: {config.config.fromName}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Configuração */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingConfig ? 'Editar' : 'Nova'} Configuração de Email
            </CardTitle>
            <CardDescription>
              Configure um provedor de email para envio de mensagens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => setSelectedProvider(value as EmailProvider)}
                  disabled={!!editingConfig}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postmark">Postmark</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="smtp">SMTP Genérico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={selectedProvider} className="w-full">
                <TabsContent value="postmark" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      placeholder="Server Token do Postmark"
                      defaultValue={editingConfig?.config.apiKey}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sendgrid" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      placeholder="API Key do SendGrid"
                      defaultValue={editingConfig?.config.apiKey}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="mailgun" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      placeholder="API Key do Mailgun"
                      defaultValue={editingConfig?.config.apiKey}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domínio</Label>
                    <Input
                      id="domain"
                      name="domain"
                      placeholder="seu-dominio.mailgun.org"
                      defaultValue={editingConfig?.config.domain}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="smtp" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Servidor SMTP</Label>
                      <Input
                        id="host"
                        name="host"
                        placeholder="smtp.gmail.com"
                        defaultValue={editingConfig?.config.host}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Porta</Label>
                      <Input
                        id="port"
                        name="port"
                        type="number"
                        placeholder="587"
                        defaultValue={editingConfig?.config.port}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Usuário</Label>
                      <Input
                        id="user"
                        name="user"
                        type="email"
                        placeholder="seu-email@gmail.com"
                        defaultValue={editingConfig?.config.user}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pass">Senha</Label>
                      <Input
                        id="pass"
                        name="pass"
                        type="password"
                        placeholder="Senha ou token"
                        defaultValue={editingConfig?.config.pass}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="secure" 
                      name="secure"
                      defaultChecked={editingConfig?.config.secure ?? true}
                    />
                    <Label htmlFor="secure">Conexão segura (TLS)</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email do Remetente</Label>
                  <Input
                    id="fromEmail"
                    name="fromEmail"
                    type="email"
                    placeholder="contato@clinica.com"
                    defaultValue={editingConfig?.config.fromEmail}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">Nome do Remetente</Label>
                  <Input
                    id="fromName"
                    name="fromName"
                    placeholder="Clínica Estética"
                    defaultValue={editingConfig?.config.fromName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    name="is_active"
                    defaultChecked={editingConfig?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Configuração ativa</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    min="1"
                    placeholder="1"
                    defaultValue={editingConfig?.priority ?? 1}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createConfig.isPending || updateConfig.isPending}
                >
                  {(createConfig.isPending || updateConfig.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingConfig ? 'Atualizar' : 'Criar'} Configuração
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!configs?.length && !showForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma configuração de email encontrada
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira configuração
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}