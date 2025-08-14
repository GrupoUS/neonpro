// SMS Messaging Component for NeonPro
// Individual and bulk SMS sending interface

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Upload,
  Download,
  FileText,
  Loader2,
  Plus,
  X,
  Eye,
  Calendar,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useSendSMS, 
  useBulkSendSMS, 
  useSMSMessages, 
  useSMSTemplates,
  useScheduleSMS,
  useFormatPhoneNumber,
  useActiveSMSProvider
} from '@/app/hooks/use-sms';
import type { SMSMessage, SMSTemplate, BulkSMSRequest } from '@/app/types/sms';

// Form schemas
const SingleSMSSchema = z.object({
  to: z.string().min(1, 'Número é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(160, 'Mensagem muito longa (máx. 160 caracteres)'),
  schedule_for: z.string().optional(),
  template_id: z.string().optional()
});

const BulkSMSSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(160, 'Mensagem muito longa (máx. 160 caracteres)'),
  recipients: z.array(z.object({
    phone: z.string(),
    name: z.string().optional(),
    variables: z.record(z.string()).optional()
  })).min(1, 'Adicione pelo menos um destinatário'),
  schedule_for: z.string().optional(),
  template_id: z.string().optional(),
  batch_name: z.string().optional()
});

type SingleSMSFormData = z.infer<typeof SingleSMSSchema>;
type BulkSMSFormData = z.infer<typeof BulkSMSSchema>;

interface Recipient {
  phone: string;
  name?: string;
  variables?: Record<string, string>;
}

export default function SMSMessaging() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [messagePreview, setMessagePreview] = useState('');
  const { formatToInternational, formatToDisplay, isValidBrazilianPhone } = useFormatPhoneNumber();
  
  // API hooks
  const { data: activeProvider } = useActiveSMSProvider();
  const { data: templates = [] } = useSMSTemplates();
  const { data: messages = [], isLoading: messagesLoading } = useSMSMessages();
  const sendSMS = useSendSMS();
  const bulkSendSMS = useBulkSendSMS();
  const scheduleSMS = useScheduleSMS();

  // Forms
  const singleForm = useForm<SingleSMSFormData>({
    resolver: zodResolver(SingleSMSSchema),
    defaultValues: {
      to: '',
      message: '',
      schedule_for: '',
      template_id: ''
    }
  });

  const bulkForm = useForm<BulkSMSFormData>({
    resolver: zodResolver(BulkSMSSchema),
    defaultValues: {
      message: '',
      recipients: [],
      schedule_for: '',
      template_id: '',
      batch_name: ''
    }
  });

  // Character count
  const watchedMessage = singleForm.watch('message');
  const watchedBulkMessage = bulkForm.watch('message');
  const messageLength = activeTab === 'single' ? watchedMessage?.length || 0 : watchedBulkMessage?.length || 0;
  const charactersLeft = 160 - messageLength;

  // Handle template selection
  const handleTemplateSelect = (templateId: string, formType: 'single' | 'bulk') => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (formType === 'single') {
      singleForm.setValue('template_id', templateId);
      singleForm.setValue('message', template.content);
    } else {
      bulkForm.setValue('template_id', templateId);
      bulkForm.setValue('message', template.content);
    }
  };

  // Handle single SMS submission
  const handleSingleSMSSubmit = async (data: SingleSMSFormData) => {
    if (!activeProvider) {
      toast.error('Nenhum provedor SMS configurado');
      return;
    }

    if (!isValidBrazilianPhone(data.to)) {
      toast.error('Número de telefone inválido');
      return;
    }

    try {
      const formattedPhone = formatToInternational(data.to);
      
      if (data.schedule_for) {
        await scheduleSMS.mutateAsync({
          to: formattedPhone,
          message: data.message,
          schedule_for: new Date(data.schedule_for).toISOString(),
          template_id: data.template_id
        });
      } else {
        await sendSMS.mutateAsync({
          to: formattedPhone,
          message: data.message,
          template_id: data.template_id
        });
      }
      
      singleForm.reset();
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  // Handle bulk SMS submission
  const handleBulkSMSSubmit = async (data: BulkSMSFormData) => {
    if (!activeProvider) {
      toast.error('Nenhum provedor SMS configurado');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Adicione pelo menos um destinatário');
      return;
    }

    try {
      const validRecipients = recipients.filter(r => isValidBrazilianPhone(r.phone));
      
      if (validRecipients.length === 0) {
        toast.error('Nenhum número válido encontrado');
        return;
      }

      const bulkRequest: BulkSMSRequest = {
        message: data.message,
        recipients: validRecipients.map(r => ({
          phone: formatToInternational(r.phone),
          name: r.name,
          variables: r.variables
        })),
        schedule_for: data.schedule_for ? new Date(data.schedule_for).toISOString() : undefined,
        template_id: data.template_id,
        batch_name: data.batch_name
      };

      await bulkSendSMS.mutateAsync(bulkRequest);
      
      bulkForm.reset();
      setRecipients([]);
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
    }
  };

  // Add recipient
  const addRecipient = () => {
    setRecipients([...recipients, { phone: '', name: '' }]);
  };

  // Remove recipient
  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  // Update recipient
  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    if (field === 'phone') {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setRecipients(updated);
  };

  // Import recipients from CSV
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const imported: Recipient[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 1 && values[0]) {
          const recipient: Recipient = {
            phone: values[0],
            name: values[1] || '',
            variables: {}
          };
          
          // Additional columns as variables
          for (let j = 2; j < headers.length && j < values.length; j++) {
            if (headers[j] && values[j]) {
              recipient.variables![headers[j]] = values[j];
            }
          }
          
          imported.push(recipient);
        }
      }
      
      setRecipients([...recipients, ...imported]);
      toast.success(`${imported.length} contatos importados`);
    };
    
    reader.readAsText(file);
  };

  // Render single SMS form
  const renderSingleSMSForm = () => (
    <Form {...singleForm}>
      <form onSubmit={singleForm.handleSubmit(handleSingleSMSSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Compor Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={singleForm.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Destinatário</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="(11) 99999-9999"
                        onChange={(e) => {
                          const formatted = formatToDisplay(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value && (
                        <>Internacional: {formatToInternational(field.value)}</>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {templates.length > 0 && (
                <FormField
                  control={singleForm.control}
                  name="template_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template (Opcional)</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => handleTemplateSelect(value, 'single')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={singleForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Digite sua mensagem..."
                        rows={4}
                        maxLength={160}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {messageLength}/160 caracteres
                      </span>
                      <span className={charactersLeft < 20 ? 'text-red-500' : 'text-muted-foreground'}>
                        {charactersLeft} restantes
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={singleForm.control}
                name="schedule_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agendar Envio (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormDescription>
                      Deixe vazio para envio imediato
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview and actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-xs text-muted-foreground mb-2">
                  Prévia da mensagem:
                </div>
                <div className="bg-white rounded-lg p-3 border max-w-xs">
                  <div className="text-sm">
                    {watchedMessage || 'Digite uma mensagem para visualizar...'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date().toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              {activeProvider && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mensagem será enviada via <strong>{activeProvider.name}</strong>
                    <br />
                    Custo estimado: R$ 0,05
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={sendSMS.isPending || scheduleSMS.isPending}
              >
                {(sendSMS.isPending || scheduleSMS.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Send className="mr-2 h-4 w-4" />
                {singleForm.watch('schedule_for') ? 'Agendar SMS' : 'Enviar SMS'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );

  // Render bulk SMS form
  const renderBulkSMSForm = () => (
    <Form {...bulkForm}>
      <form onSubmit={bulkForm.handleSubmit(handleBulkSMSSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipients management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Destinatários ({recipients.length})
              </CardTitle>
              <CardDescription>
                Adicione manualmente ou importe de um arquivo CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRecipient}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
                
                <label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar CSV
                    </span>
                  </Button>
                </label>
              </div>

              {recipients.length > 0 && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="w-[50px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.map((recipient, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={recipient.phone}
                              onChange={(e) => updateRecipient(index, 'phone', e.target.value)}
                              placeholder="(11) 99999-9999"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={recipient.name || ''}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                              placeholder="Nome (opcional)"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRecipient(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato CSV:</strong> telefone,nome,variavel1,variavel2
                  <br />
                  Exemplo: 11999999999,João Silva,empresa,cargo
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Message composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={bulkForm.control}
                name="batch_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Promoção Janeiro"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {templates.length > 0 && (
                <FormField
                  control={bulkForm.control}
                  name="template_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => handleTemplateSelect(value, 'bulk')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={bulkForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Digite sua mensagem..."
                        rows={6}
                        maxLength={160}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {messageLength}/160 caracteres
                      </span>
                      <span className={charactersLeft < 20 ? 'text-red-500' : 'text-muted-foreground'}>
                        {charactersLeft} restantes
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bulkForm.control}
                name="schedule_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agendar Envio</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {recipients.length > 0 && (
                <Alert>
                  <Hash className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{recipients.length} destinatários</strong>
                    <br />
                    Custo estimado: R$ {(recipients.length * 0.05).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={bulkSendSMS.isPending || recipients.length === 0}
              >
                {bulkSendSMS.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Send className="mr-2 h-4 w-4" />
                {bulkForm.watch('schedule_for') ? 'Agendar Envio' : 'Enviar para Todos'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );

  // Check if provider is configured
  if (!activeProvider) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Provedor SMS não configurado</h3>
          <p className="text-muted-foreground mb-4">
            Configure um provedor SMS para começar a enviar mensagens
          </p>
          <Button onClick={() => setActiveTab('single')}>
            Configurar Provedor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Envio de SMS</h2>
          <p className="text-muted-foreground">
            Envie mensagens individuais ou campanhas em lote
          </p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-500" />
          {activeProvider.name}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'bulk')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS Individual
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Envio em Lote
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          {renderSingleSMSForm()}
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          {renderBulkSMSForm()}
        </TabsContent>
      </Tabs>
    </div>
  );
}