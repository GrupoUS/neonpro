/**
 * Interactive Action Handlers Component
 * Provides sophisticated action handling for AI agent responses
 *
 * This component handles complex actions like:
 * - Client details viewing with modal
 * - Appointment creation with pre-filled data
 * - Data export with formatting options
 * - Navigation with context preservation
 * - Refresh with loading states
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AIAgentService } from '@/services/ai-agent';
import { AgentAction } from '@/types/ai-agent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface ActionHandlersProps {
  actions: AgentAction[];
  onActionExecuted?: (action: AgentAction) => void;
  sessionId?: string;
  className?: string;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeSummary: boolean;
  filters?: Record<string, any>;
}

interface AppointmentFormData {
  clientId: string;
  serviceId: string;
  scheduledAt: Date;
  duration: number;
  notes?: string;
}

/**
 * Client Details Modal Component
 * Shows detailed client information in a modal
 */
const ClientDetailsModal: React.FC<{
  client: ClientData;
  onClose: () => void;
}> = ({ client, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Detalhes do Cliente
          </DialogTitle>
          <DialogDescription>
            Informações completas do cliente
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Basic Information */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Nome</Label>
                  <p className='font-medium'>{client.name}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Email</Label>
                  <p className='font-medium'>{client.email}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Telefone</Label>
                  <p className='font-medium'>{client.phone}</p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Status</Label>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {client.cpf && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>CPF</Label>
                    <p className='font-medium'>{client.cpf}</p>
                  </div>
                  {client.rg && (
                    <div>
                      <Label className='text-xs text-muted-foreground'>RG</Label>
                      <p className='font-medium'>{client.rg}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address Information */}
          {client.address && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='font-medium'>{client.address.street}, {client.address.number}</p>
                  {client.address.complement && (
                    <p className='text-sm text-muted-foreground'>{client.address.complement}</p>
                  )}
                  <p className='text-sm text-muted-foreground'>
                    {client.address.neighborhood}, {client.address.city} - {client.address.state}
                  </p>
                  <p className='text-sm text-muted-foreground'>CEP: {client.address.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {client.stats && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-primary'>
                      {client.stats.totalAppointments}
                    </p>
                    <p className='text-xs text-muted-foreground'>Agendamentos</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-green-600'>
                      {client.stats.completedAppointments}
                    </p>
                    <p className='text-xs text-muted-foreground'>Concluídos</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {new Date(client.stats.lastVisit).toLocaleDateString('pt-BR')}
                    </p>
                    <p className='text-xs text-muted-foreground'>Última Visita</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
          <Button
            variant='outline'
            onClick={() => window.open(`/clientes/${client.id}`, '_blank')}
          >
            Ver Perfil Completo
            <ExternalLink className='h-4 w-4 ml-2' />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Data Export Modal Component
 * Allows users to configure and export data
 */
const DataExportModal: React.FC<{
  data: any[];
  dataType: 'clients' | 'appointments' | 'financial';
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}> = ({ data, dataType, onClose, onExport }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeSummary: true,
    filters: {},
  });

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  const getDataTypeName = () => {
    switch (dataType) {
      case 'clients':
        return 'Clientes';
      case 'appointments':
        return 'Agendamentos';
      case 'financial':
        return 'Financeiro';
      default:
        return 'Dados';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Exportar Dados
          </DialogTitle>
          <DialogDescription>
            Configurar exportação de {getDataTypeName().toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Format Selection */}
          <div>
            <Label htmlFor='format'>Formato</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='csv'>CSV (Excel)</SelectItem>
                <SelectItem value='json'>JSON</SelectItem>
                <SelectItem value='pdf'>PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Option */}
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='includeSummary'
              checked={exportOptions.includeSummary}
              onChange={e =>
                setExportOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
              className='rounded'
            />
            <Label htmlFor='includeSummary'>Incluir resumo estatístico</Label>
          </div>

          {/* Data Preview */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm'>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-2'>
                {data.length} registros serão exportados
              </p>
              <div className='bg-muted p-2 rounded text-xs font-mono max-h-20 overflow-y-auto'>
                {JSON.stringify(data[0], null, 2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>Cancelar</Button>
          <Button onClick={handleExport}>
            Exportar {getDataTypeName()}
            <Download className='h-4 w-4 ml-2' />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Appointment Creation Modal Component
 * Pre-fills appointment creation form based on AI context
 */
const AppointmentCreationModal: React.FC<{
  context?: Record<string, any>;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ context, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: context?.clientId || '',
    serviceId: context?.serviceId || '',
    scheduledAt: context?.suggestedDate ? new Date(context.suggestedDate) : new Date(),
    duration: context?.suggestedDuration || 30,
    notes: context?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to your appointment API
    console.log('Creating appointment:', formData);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Criar novo agendamento com dados pré-preenchidos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='serviceId'>Serviço</Label>
            <Select
              value={formData.serviceId}
              onValueChange={value => setFormData(prev => ({ ...prev, serviceId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione um serviço' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='consultation'>Consulta</SelectItem>
                <SelectItem value='follow-up'>Retorno</SelectItem>
                <SelectItem value='procedure'>Procedimento</SelectItem>
                <SelectItem value='exam'>Exame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='duration'>Duração (minutos)</Label>
            <Input
              id='duration'
              type='number'
              value={formData.duration}
              onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              min='15'
              max='180'
              step='15'
              required
            />
          </div>

          <div>
            <Label>Data e Hora</Label>
            <div className='border rounded-md p-3'>
              <Calendar
                mode='single'
                selected={formData.scheduledAt}
                onSelect={date => date && setFormData(prev => ({ ...prev, scheduledAt: date }))}
                locale={ptBR}
                className='rounded-md border'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='notes'>Observações (opcional)</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder='Observações sobre o agendamento...'
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>Cancelar</Button>
            <Button type='submit'>
              Criar Agendamento
              <Plus className='h-4 w-4 ml-2' />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main ActionHandlers Component
 */
export const ActionHandlers: React.FC<ActionHandlersProps> = ({
  actions,
  onActionExecuted,
  sessionId,
  className,
}) => {
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [exportData, setExportData] = useState<
    { data: any[]; dataType: 'clients' | 'appointments' | 'financial' } | null
  >(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentContext, setAppointmentContext] = useState<Record<string, any> | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();
  const aiAgentService = new AIAgentService();

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async ({ data, options }: { data: any[]; options: ExportOptions }) => {
      setIsExporting(true);
      try {
        // Simulate export - in real implementation, this would call your export API
        await new Promise(resolve => setTimeout(resolve, 1000));

        let content = '';
        let filename = '';
        let mimeType = '';

        switch (options.format) {
          case 'csv':
            content = convertToCSV(data);
            filename = `export_${Date.now()}.csv`;
            mimeType = 'text/csv';
            break;
          case 'json':
            content = JSON.stringify(data, null, 2);
            filename = `export_${Date.now()}.json`;
            mimeType = 'application/json';
            break;
          case 'pdf':
            // PDF generation would require a library like jsPDF
            console.log('PDF export not implemented yet');
            return;
        }

        // Create and trigger download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } finally {
        setIsExporting(false);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['ai-agent'] });
    },
  });

  const handleAction = useCallback(async (_action: any) => {
    switch (action.type) {
      case 'view_details':
        if (action.payload?.clientId) {
          // Fetch client details
          try {
            const clientData = await aiAgentService.getClientDetails(action.payload.clientId);
            setSelectedClient(clientData);
          } catch (_error) {
            console.error('Failed to fetch client details:', error);
          }
        } else if (action.payload?.client) {
          // Use provided client data
          setSelectedClient(action.payload.client);
        }
        break;

      case 'create_appointment':
        setAppointmentContext(action.payload || {});
        setShowAppointmentModal(true);
        break;

      case 'export_data':
        if (action.payload?.data) {
          setExportData({
            data: action.payload.data,
            dataType: action.payload.dataType || 'clients',
          });
        }
        break;

      case 'navigate':
        if (action.payload?.path) {
          // Add session context to navigation if needed
          const url = new URL(action.payload.path, window.location.origin);
          if (sessionId) {
            url.searchParams.set('session_id', sessionId);
          }
          window.open(url.toString(), '_blank');
        }
        break;

      case 'refresh':
        // Refresh action is handled by the parent component
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }

    onActionExecuted?.(action);
  }, [aiAgentService, onActionExecuted, sessionId]);

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ];

    return csvRows.join('\n');
  };

  const getActionIcon = (_iconName: any) => {
    switch (iconName) {
      case 'user':
        return <User className='h-4 w-4' />;
      case 'calendar':
        return <CalendarIcon className='h-4 w-4' />;
      case 'download':
        return <Download className='h-4 w-4' />;
      case 'refresh':
        return <RefreshCw className='h-4 w-4' />;
      case 'plus':
        return <Plus className='h-4 w-4' />;
      case 'file-text':
        return <FileText className='h-4 w-4' />;
      case 'external-link':
        return <ExternalLink className='h-4 w-4' />;
      default:
        return <ExternalLink className='h-4 w-4' />;
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Action Buttons */}
      <div className={cn('flex flex-wrap gap-2', className)}>
        {actions.map(action => (
          <Button
            key={action.id}
            variant={action.primary ? 'default' : 'outline'}
            size='sm'
            onClick={() => handleAction(action)}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-2 text-xs',
              action.primary && 'shadow-sm',
            )}
          >
            {action.icon && getActionIcon(action.icon)}
            {action.label}
            {action.type === 'export_data' && isExporting && (
              <RefreshCw className='h-3 w-3 animate-spin ml-1' />
            )}
          </Button>
        ))}
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Data Export Modal */}
      {exportData && (
        <DataExportModal
          data={exportData.data}
          dataType={exportData.dataType}
          onClose={() => setExportData(null)}
          onExport={options => exportMutation.mutate({ data: exportData.data, options })}
        />
      )}

      {/* Appointment Creation Modal */}
      {showAppointmentModal && (
        <AppointmentCreationModal
          context={appointmentContext}
          onClose={() => {
            setShowAppointmentModal(false);
            setAppointmentContext(null);
          }}
          onSuccess={() => {
            // Refresh relevant data
            queryClient.invalidateQueries({ queryKey: ['ai-agent'] });
          }}
        />
      )}

      {/* Export Error Handling */}
      {exportMutation.isError && (
        <div className='mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
          <div className='flex items-center gap-2 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4' />
            Falha ao exportar dados. Tente novamente.
          </div>
        </div>
      )}
    </>
  );
};

export default ActionHandlers;
