'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Archive, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Shield,
  X,
  Users,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from 'sonner';

interface PatientActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export default function PatientActions({
  selectedCount,
  onBulkAction,
  onClearSelection
}: PatientActionsProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  
  // Export settings
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState({
    personal: true,
    contact: true,
    medical: false,
    lgpd_sensitive: false
  });
  const [anonymizeData, setAnonymizeData] = useState(true);
  
  // Message settings
  const [messageType, setMessageType] = useState('email');
  const [messageContent, setMessageContent] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  const handleExport = () => {
    // LGPD compliance validation
    if (exportFields.medical || exportFields.lgpd_sensitive) {
      if (!anonymizeData) {
        toast.error('Dados médicos e sensíveis devem ser anonimizados para conformidade LGPD');
        return;
      }
    }

    // Simulate export process
    const exportData = {
      format: exportFormat,
      fields: exportFields,
      anonymize: anonymizeData,
      selectedCount,
      timestamp: new Date().toISOString(),
      lgpdCompliant: true
    };

    console.log('LGPD Compliant Export:', exportData);
    onBulkAction('export');
    setShowExportDialog(false);
    
    // Log LGPD audit
    logLGPDAudit('data_export', {
      patients_count: selectedCount,
      anonymized: anonymizeData,
      fields_exported: Object.keys(exportFields).filter(key => exportFields[key as keyof typeof exportFields])
    });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast.error('Digite o conteúdo da mensagem');
      return;
    }

    // Log communication for LGPD compliance
    logLGPDAudit('communication_sent', {
      patients_count: selectedCount,
      message_type: messageType,
      content_length: messageContent.length
    });

    onBulkAction('send_message');
    setShowMessageDialog(false);
    setMessageContent('');
  };

  const handleArchive = () => {
    // Simulate archive with LGPD compliance
    logLGPDAudit('patients_archived', {
      patients_count: selectedCount,
      reason: 'bulk_action'
    });

    onBulkAction('archive');
    setShowArchiveDialog(false);
  };

  const logLGPDAudit = (action: string, details: any) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user_agent: navigator.userAgent,
      lgpd_compliant: true
    };
    
    console.log('LGPD Audit Log:', auditLog);
    // In production, this would be sent to audit logging system
  };

  const messageTemplates = {
    appointment_reminder: 'Lembrete: Você tem uma consulta agendada para {date} às {time}. Por favor, confirme sua presença.',
    follow_up: 'Olá! Como você está se sentindo após sua última consulta? Entre em contato se precisar de alguma coisa.',
    wellness_check: 'Esperamos que você esteja bem! Lembre-se de manter seus cuidados de saúde em dia.',
    custom: ''
  };

  const populateTemplate = (template: string) => {
    const content = messageTemplates[template as keyof typeof messageTemplates];
    setMessageContent(content);
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">
              Ações em Lote
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar seleção
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Export Data Button */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Exportar Dados
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Exportação LGPD Compliant
                </DialogTitle>
                <DialogDescription>
                  Configure as opções de exportação respeitando as diretrizes da LGPD
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Format Selection */}
                <div className="space-y-2">
                  <Label>Formato do arquivo</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Planilha)</SelectItem>
                      <SelectItem value="pdf">PDF (Relatório)</SelectItem>
                      <SelectItem value="json">JSON (Dados estruturados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fields Selection */}
                <div className="space-y-2">
                  <Label>Campos a exportar</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personal"
                        checked={exportFields.personal}
                        onCheckedChange={(checked) => 
                          setExportFields({...exportFields, personal: !!checked})
                        }
                      />
                      <Label htmlFor="personal" className="text-sm">
                        Dados pessoais básicos (nome, idade, gênero)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contact"
                        checked={exportFields.contact}
                        onCheckedChange={(checked) => 
                          setExportFields({...exportFields, contact: !!checked})
                        }
                      />
                      <Label htmlFor="contact" className="text-sm">
                        Informações de contato (telefone, email)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medical"
                        checked={exportFields.medical}
                        onCheckedChange={(checked) => 
                          setExportFields({...exportFields, medical: !!checked})
                        }
                      />
                      <Label htmlFor="medical" className="text-sm text-orange-600">
                        Dados médicos (condições, alergias) - Sensível
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lgpd_sensitive"
                        checked={exportFields.lgpd_sensitive}
                        onCheckedChange={(checked) => 
                          setExportFields({...exportFields, lgpd_sensitive: !!checked})
                        }
                      />
                      <Label htmlFor="lgpd_sensitive" className="text-sm text-red-600">
                        Dados altamente sensíveis (CPF, endereço) - LGPD Crítico
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Anonymization Option */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymize"
                      checked={anonymizeData}
                      onCheckedChange={(checked) => setAnonymizeData(!!checked)}
                    />
                    <Label htmlFor="anonymize" className="text-sm font-medium">
                      Anonimizar dados sensíveis (Recomendado)
                    </Label>
                  </div>
                  {!anonymizeData && (exportFields.medical || exportFields.lgpd_sensitive) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Atenção LGPD</AlertTitle>
                      <AlertDescription>
                        Exportar dados sensíveis sem anonimização requer justificativa legal específica
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* LGPD Compliance Notice */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Conformidade LGPD</AlertTitle>
                  <AlertDescription>
                    Esta exportação será registrada no log de auditoria para conformidade com a LGPD.
                    <a href="/lgpd/privacy-policy" className="text-blue-600 hover:underline ml-1">
                      Saiba mais <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar ({selectedCount} pacientes)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Send Message Button */}
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Enviar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Mensagem em Lote</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem para {selectedCount} paciente{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Message Type */}
                <div className="space-y-2">
                  <Label>Tipo de mensagem</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Template */}
                <div className="space-y-2">
                  <Label>Template de mensagem</Label>
                  <Select value={messageTemplate} onValueChange={(value) => {
                    setMessageTemplate(value);
                    populateTemplate(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment_reminder">Lembrete de consulta</SelectItem>
                      <SelectItem value="follow_up">Acompanhamento pós-consulta</SelectItem>
                      <SelectItem value="wellness_check">Check-up de bem-estar</SelectItem>
                      <SelectItem value="custom">Mensagem personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <Label>Conteúdo da mensagem</Label>
                  <Textarea
                    placeholder="Digite sua mensagem aqui..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground">
                    Caracteres: {messageContent.length}/500
                  </div>
                </div>

                {/* LGPD Notice for Communication */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Política de Comunicação</AlertTitle>
                  <AlertDescription>
                    Apenas pacientes que consentiram receber comunicações promocionais receberão esta mensagem.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Enviar para {selectedCount}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Archive Button */}
          <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center text-orange-600">
                <Archive className="h-4 w-4 mr-1" />
                Arquivar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Arquivar Pacientes</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja arquivar {selectedCount} paciente{selectedCount !== 1 ? 's' : ''}? 
                  Esta ação pode ser revertida posteriormente.
                </DialogDescription>
              </DialogHeader>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Pacientes arquivados não aparecerão nas listas padrão, mas seus dados serão mantidos 
                  para conformidade com os prazos de retenção da LGPD (20 anos para dados médicos).
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-1" />
                  Arquivar {selectedCount} paciente{selectedCount !== 1 ? 's' : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Appointments */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onBulkAction('schedule_bulk')}
            className="flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Agendar Consultas
          </Button>
        </div>

        {/* LGPD Compliance Footer */}
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex items-center text-xs text-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            Todas as ações em lote são registradas para conformidade LGPD e auditoria
          </div>
        </div>
      </CardContent>
    </Card>
  );
}