'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useEmail } from '@/app/hooks/use-email';
import { EmailMessage, EmailTemplate } from '@/app/types/email';
import { toast } from 'sonner';
import { Loader2, Send, Users, User, FileText, Eye, EyeOff } from 'lucide-react';

interface EmailMessagingProps {
  patients?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export default function EmailMessaging({ patients = [] }: EmailMessagingProps) {
  const { templates, sendEmail, sendBulkEmail } = useEmail();
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Estados para email individual
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  // Estados para email em lote
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkContent, setBulkContent] = useState('');

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    if (activeTab === 'individual') {
      setSubject(template.subject);
      setContent(template.content);
    } else {
      setBulkSubject(template.subject);
      setBulkContent(template.content);
    }
  };

  const handleSendIndividual = async () => {
    if (!recipient || !subject || !content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const message: Omit<EmailMessage, 'id' | 'clinic_id' | 'created_at' | 'updated_at'> = {
        to: recipient,
        subject,
        content,
        template_id: selectedTemplate?.id,
        status: 'pending',
        provider: 'auto'
      };

      await sendEmail.mutateAsync(message);
      toast.success('Email enviado com sucesso!');
      
      // Limpar formulário
      setRecipient('');
      setSubject('');
      setContent('');
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('Erro ao enviar email');
    }
  };

  const handleSendBulk = async () => {
    if (!selectedPatients.length || !bulkSubject || !bulkContent) {
      toast.error('Selecione pacientes e preencha todos os campos');
      return;
    }

    try {
      const recipients = patients
        .filter(p => selectedPatients.includes(p.id))
        .map(p => ({ email: p.email, name: p.name }));

      await sendBulkEmail.mutateAsync({
        recipients,
        subject: bulkSubject,
        content: bulkContent,
        template_id: selectedTemplate?.id
      });

      toast.success(`Email enviado para ${recipients.length} pacientes!`);
      
      // Limpar formulário
      setSelectedPatients([]);
      setBulkSubject('');
      setBulkContent('');
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('Erro ao enviar emails em lote');
    }
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAllPatients = () => {
    setSelectedPatients(patients.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPatients([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Envio de Emails</h3>
        <p className="text-sm text-muted-foreground">
          Envie emails individuais ou em lote para seus pacientes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Email Individual
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Email em Lote
          </TabsTrigger>
        </TabsList>

        {/* Templates Disponíveis */}
        {templates && templates.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedTemplate?.id === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.subject}
                        </p>
                      </div>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Email Individual</CardTitle>
              <CardDescription>
                Envie um email personalizado para um paciente específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatário</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente ou digite email" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.email}>
                        {patient.name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ou digite um email manualmente"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto do email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    {isPreviewMode ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </>
                    )}
                  </Button>
                </div>
                
                {isPreviewMode ? (
                  <div className="min-h-[200px] p-4 border rounded-md bg-background">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Digite o conteúdo do email..."
                    className="min-h-[200px]"
                    required
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSendIndividual}
                  disabled={sendEmail.isPending || !recipient || !subject || !content}
                >
                  {sendEmail.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Seleção de Pacientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Selecionar Pacientes</CardTitle>
                  <CardDescription>
                    Escolha os pacientes que receberão o email
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPatients}>
                    Selecionar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedPatients.includes(patient.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => togglePatientSelection(patient.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                    {selectedPatients.includes(patient.id) && (
                      <Badge variant="default">Selecionado</Badge>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedPatients.length > 0 && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    <strong>{selectedPatients.length}</strong> paciente(s) selecionado(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conteúdo do Email em Lote */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Email</CardTitle>
              <CardDescription>
                Configure o email que será enviado para todos os pacientes selecionados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkSubject">Assunto</Label>
                <Input
                  id="bulkSubject"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  placeholder="Assunto do email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulkContent">Conteúdo</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    {isPreviewMode ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </>
                    )}
                  </Button>
                </div>
                
                {isPreviewMode ? (
                  <div className="min-h-[200px] p-4 border rounded-md bg-background">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: bulkContent.replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id="bulkContent"
                    value={bulkContent}
                    onChange={(e) => setBulkContent(e.target.value)}
                    placeholder="Digite o conteúdo do email..."
                    className="min-h-[200px]"
                    required
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSendBulk}
                  disabled={sendBulkEmail.isPending || !selectedPatients.length || !bulkSubject || !bulkContent}
                >
                  {sendBulkEmail.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar para {selectedPatients.length} Paciente(s)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}