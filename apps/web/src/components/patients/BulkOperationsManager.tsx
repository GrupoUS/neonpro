'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  RotateCcw,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Progress,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@neonpro/ui';

import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Bulk operation types
export type BulkOperationType =
  | 'activate_patients'
  | 'inactivate_patients'
  | 'add_tags'
  | 'remove_tags'
  | 'delete_patients'
  | 'export_data'
  | 'send_communication';

// Bulk operation status
export type BulkOperationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'undoing'
  | 'undone';

// Bulk operation interface
export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  title: string;
  description: string;
  patientIds: string[];
  affectedCount: number;
  totalCount: number;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  auditTrail: AuditEvent[];
  undoable: boolean;
  undoneAt?: string;
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// Bulk operation queue
interface BulkOperationQueue {
  operations: BulkOperation[];
  currentOperation?: string;
  paused: boolean;
  concurrency: number;
}

// Rate limiting interface
interface RateLimitInfo {
  requests: number;
  remaining: number;
  resetTime: string;
  limit: number;
}

interface BulkOperationsManagerProps {
  clinicId: string;
  selectedPatientIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onOperationComplete?: (operation: BulkOperation) => void;
}

// Mock data generator
function generateMockPatients(
  count: number,
): Array<{ id: string; name: string; email: string; status: string }> {
  return Array.from({ length: count }, (_, i) => ({
    id: `patient-${i + 1}`,
    name: `Paciente ${i + 1}`,
    email: `paciente${i + 1}@exemplo.com`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
  }));
}

export function BulkOperationsManager({
  clinicId,
  selectedPatientIds,
  onSelectionChange,
  onOperationComplete,
}: BulkOperationsManagerProps) {
  const queryClient = useQueryClient();
  const { measurePerformance } = usePerformanceMonitor();

  // State
  const [activeTab, setActiveTab] = useState<'operations' | 'queue' | 'audit'>('operations');
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationType>(
    'activate_patients',
  );
  const [customTags, setCustomTags] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const [operationToUndo, setOperationToUndo] = useState<BulkOperation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<BulkOperationStatus | 'all'>('all');

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Queue state
  const [queue, setQueue] = useLocalStorage<BulkOperationQueue>('bulk-operations-queue', {
    operations: [],
    paused: false,
    concurrency: 3,
  });

  // Rate limit state
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({
    requests: 0,
    remaining: 100,
    resetTime: new Date(Date.now() + 60000).toISOString(),
    limit: 100,
  });

  // Mock operations query
  const { data: operations, isLoading } = useQuery({
    queryKey: ['bulk-operations', clinicId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate mock operations
      const mockOperations: BulkOperation[] = [
        {
          id: 'op-1',
          type: 'activate_patients',
          status: 'completed',
          title: 'Ativação de Pacientes',
          description: 'Ativação de 25 pacientes selecionados',
          patientIds: selectedPatientIds.slice(0, 25),
          affectedCount: 25,
          totalCount: 25,
          progress: 100,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          startedAt: new Date(Date.now() - 3540000).toISOString(),
          completedAt: new Date(Date.now() - 3000000).toISOString(),
          auditTrail: [
            {
              id: 'audit-1',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              userId: 'user-1',
              action: 'bulk_operation_started',
              details: { operationType: 'activate_patients', patientCount: 25 },
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0',
            },
          ],
          undoable: true,
        },
        {
          id: 'op-2',
          type: 'add_tags',
          status: 'processing',
          title: 'Adição de Tags',
          description: 'Adicionando tags "VIP" e "Retorno" para 15 pacientes',
          patientIds: selectedPatientIds.slice(0, 15),
          affectedCount: 10,
          totalCount: 15,
          progress: 67,
          createdAt: new Date(Date.now() - 300000).toISOString(),
          startedAt: new Date(Date.now() - 240000).toISOString(),
          auditTrail: [],
          undoable: true,
        },
      ];

      return mockOperations;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Process queue
  useEffect(() => {
    if (queue.paused || !queue.currentOperation || queue.operations.length === 0) return;

    const processNextOperation = async () => {
      const currentOp = queue.operations.find(op => op.id === queue.currentOperation);
      if (!currentOp) return;

      try {
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update operation status
        setQueue(prev => ({
          ...prev,
          operations: prev.operations.map(op =>
            op.id === currentOp.id
              ? { ...op, status: 'completed', progress: 100, completedAt: new Date().toISOString() }
              : op
          ),
          currentOperation: undefined,
        }));

        onOperationComplete?.(currentOp);
        toast.success(`Operação concluída: ${currentOp.title}`);
      } catch (error) {
        console.error('Bulk operation failed:', error);
        setQueue(prev => ({
          ...prev,
          operations: prev.operations.map(op =>
            op.id === currentOp.id
              ? {
                ...op,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                failedAt: new Date().toISOString(),
              }
              : op
          ),
          currentOperation: undefined,
        }));
        toast.error(`Operação falhou: ${currentOp.title}`);
      }
    };

    processNextOperation();
  }, [queue, onOperationComplete]);

  // Filter operations
  const filteredOperations = operations?.filter(op => {
    const matchesSearch = op.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      || op.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || op.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  // Get operation config
  const getOperationConfig = (type: BulkOperationType) => {
    const configs = {
      activate_patients: {
        title: 'Ativar Pacientes',
        description: 'Ativar múltiplos pacientes selecionados',
        icon: Users,
        color: 'green',
        undoable: true,
      },
      inactivate_patients: {
        title: 'Inativar Pacientes',
        description: 'Inativar múltiplos pacientes selecionados',
        icon: Users,
        color: 'orange',
        undoable: true,
      },
      add_tags: {
        title: 'Adicionar Tags',
        description: 'Adicionar tags a múltiplos pacientes',
        icon: 'Activity',
        color: 'blue',
        undoable: true,
      },
      remove_tags: {
        title: 'Remover Tags',
        description: 'Remover tags de múltiplos pacientes',
        icon: 'X',
        color: 'red',
        undoable: true,
      },
      delete_patients: {
        title: 'Excluir Pacientes',
        description: 'Excluir permanentemente pacientes selecionados',
        icon: Trash2,
        color: 'red',
        undoable: false,
      },
      export_data: {
        title: 'Exportar Dados',
        description: 'Exportar dados dos pacientes selecionados',
        icon: 'Activity',
        color: 'purple',
        undoable: false,
      },
      send_communication: {
        title: 'Enviar Comunicação',
        description: 'Enviar comunicação para pacientes selecionados',
        icon: 'Activity',
        color: 'blue',
        undoable: false,
      },
    };

    return configs[type] || configs.activate_patients;
  };

  // Create bulk operation
  const createBulkOperation = useCallback(async (type: BulkOperationType) => {
    if (selectedPatientIds.length === 0) {
      toast.error('Selecione pelo menos um paciente');
      return;
    }

    // Check rate limit
    if (rateLimit.remaining <= 0) {
      toast.error('Limite de requisições excedido. Tente novamente mais tarde.');
      return;
    }

    const config = getOperationConfig(type);
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const operation: BulkOperation = {
      id: operationId,
      type,
      status: 'pending',
      title: config.title,
      description: `${config.description} (${selectedPatientIds.length} pacientes)`,
      patientIds: [...selectedPatientIds],
      affectedCount: 0,
      totalCount: selectedPatientIds.length,
      progress: 0,
      createdAt: new Date().toISOString(),
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'current-user', // Get from auth context
          action: 'bulk_operation_created',
          details: {
            operationType: type,
            patientCount: selectedPatientIds.length,
            reason: 'bulk_patient_management',
          },
          ipAddress: '127.0.0.1', // Get from request
          userAgent: navigator.userAgent,
        },
      ],
      undoable: config.undoable,
    };

    // Add to queue
    setQueue(prev => ({
      ...prev,
      operations: [...prev.operations, operation],
      currentOperation: prev.currentOperation || operation.id,
    }));

    // Update rate limit
    setRateLimit(prev => ({
      ...prev,
      requests: prev.requests + 1,
      remaining: prev.remaining - 1,
    }));

    toast.success(`Operação enfileirada: ${config.title}`);
  }, [selectedPatientIds, getOperationConfig, rateLimit]);

  // Undo operation
  const undoOperation = useCallback(async (operation: BulkOperation) => {
    if (!operation.undoable) {
      toast.error('Esta operação não pode ser desfeita');
      return;
    }

    try {
      await measurePerformance('bulk-undo', async () => {
        // Simulate undo operation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update operation status
        setQueue(prev => ({
          ...prev,
          operations: prev.operations.map(op =>
            op.id === operation.id
              ? {
                ...op,
                status: 'undone',
                undoneAt: new Date().toISOString(),
                auditTrail: [
                  ...op.auditTrail,
                  {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    userId: 'current-user',
                    action: 'bulk_operation_undone',
                    details: { originalOperationId: operation.id },
                    ipAddress: '127.0.0.1',
                    userAgent: navigator.userAgent,
                  },
                ],
              }
              : op
          ),
        }));

        toast.success(`Operação desfeita: ${operation.title}`);
      });
    } catch (error) {
      console.error('Undo operation failed:', error);
      toast.error(`Falha ao desfazer operação: ${operation.title}`);
    }
  }, [measurePerformance]);

  // Handle operation confirm
  const handleConfirmOperation = () => {
    createBulkOperation(selectedOperation);
    setShowConfirmDialog(false);
  };

  // Handle undo confirm
  const handleConfirmUndo = () => {
    if (operationToUndo) {
      undoOperation(operationToUndo);
      setShowUndoDialog(false);
      setOperationToUndo(null);
    }
  };

  // Clear selection
  const clearSelection = () => {
    onSelectionChange([]);
  };

  // Toggle queue pause
  const toggleQueuePause = () => {
    setQueue(prev => ({ ...prev, paused: !prev.paused }));
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: BulkOperationStatus }) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'gray' },
      processing: { label: 'Processando', color: 'blue' },
      completed: { label: 'Concluído', color: 'green' },
      failed: { label: 'Falhou', color: 'red' },
      cancelled: { label: 'Cancelado', color: 'orange' },
      undoing: { label: 'Desfazendo', color: 'yellow' },
      undone: { label: 'Desfeito', color: 'purple' },
    };

    const config = statusConfig[status];

    return (
      <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Operações em Massa</h2>
          <p className='text-muted-foreground'>
            Gerencie múltiplos pacientes com operações em lote
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            {selectedPatientIds.length} selecionados
          </Badge>
          {selectedPatientIds.length > 0 && (
            <Button variant='outline' size='sm' onClick={clearSelection}>
              Limpar seleção
            </Button>
          )}
        </div>
      </div>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Nova Operação em Massa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Operation Type Selection */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {Object.entries({
                activate_patients: 'Ativar',
                inactivate_patients: 'Inativar',
                add_tags: 'Adicionar Tags',
                remove_tags: 'Remover Tags',
              }).map(([type, label]) => {
                const config = getOperationConfig(type as BulkOperationType);
                const Icon = config.icon;

                return (
                  <Button
                    key={type}
                    variant={selectedOperation === type ? 'default' : 'outline'}
                    className='h-20 flex-col'
                    onClick={() => setSelectedOperation(type as BulkOperationType)}
                  >
                    <Icon className='h-6 w-6 mb-2' />
                    <span className='text-sm'>{label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Operation Configuration */}
            {selectedOperation === 'add_tags' || selectedOperation === 'remove_tags'
              ? (
                <div className='space-y-2'>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input
                    placeholder='VIP, Retorno, Acompanhamento...'
                    value={customTags}
                    onChange={e => setCustomTags(e.target.value)}
                  />
                </div>
              )
              : null}

            {/* Action Button */}
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={selectedPatientIds.length === 0}
              className='w-full'
            >
              Executar Operação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Operações Recentes</CardTitle>

            <div className='flex items-center gap-2'>
              {/* Search */}
              <Input
                placeholder='Buscar operações...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-64'
              />

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos</SelectItem>
                  <SelectItem value='pending'>Pendente</SelectItem>
                  <SelectItem value='processing'>Processando</SelectItem>
                  <SelectItem value='completed'>Concluído</SelectItem>
                  <SelectItem value='failed'>Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading
            ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            )
            : filteredOperations.length === 0
            ? (
              <div className='text-center py-8'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                <h3 className='text-lg font-medium mb-2'>Nenhuma operação encontrada</h3>
                <p className='text-muted-foreground'>
                  Nenhuma operação em massa foi realizada ainda
                </p>
              </div>
            )
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Pacientes</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className='text-right'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.map(operation => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{operation.title}</p>
                          <p className='text-sm text-muted-foreground'>
                            {operation.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={operation.status} />
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Progress value={operation.progress} className='w-24' />
                          <p className='text-xs text-muted-foreground'>
                            {operation.affectedCount}/{operation.totalCount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {operation.totalCount} pacientes
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          {new Date(operation.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          {operation.undoable && operation.status === 'completed' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setOperationToUndo(operation);
                                setShowUndoDialog(true);
                              }}
                            >
                              <RotateCcw className='h-3 w-3 mr-1' />
                              Desfazer
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                ...
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem>
                                <Activity className='h-4 w-4 mr-2' />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className='h-4 w-4 mr-2' />
                                Auditoria
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Fila de Operações
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleQueuePause}
            >
              {queue.paused ? 'Retomar' : 'Pausar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-2'>
                {queue.paused
                  ? <Clock className='h-4 w-4 text-orange-500' />
                  : <Activity className='h-4 w-4 text-green-500' />}
                Status: {queue.paused ? 'Pausada' : 'Ativa'}
              </span>
              <span>
                Limite de requisições: {rateLimit.remaining}/{rateLimit.limit}
              </span>
            </div>

            {queue.operations.length > 0 && (
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Operações na fila:</p>
                {queue.operations.slice(0, 3).map(operation => (
                  <div
                    key={operation.id}
                    className='flex items-center justify-between p-2 bg-muted rounded'
                  >
                    <div className='flex items-center gap-2'>
                      <StatusBadge status={operation.status} />
                      <span className='text-sm'>{operation.title}</span>
                    </div>
                    <Progress value={operation.progress} className='w-20' />
                  </div>
                ))}
                {queue.operations.length > 3 && (
                  <p className='text-sm text-muted-foreground'>
                    +{queue.operations.length - 3} operações adicionais
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Operação em Massa</DialogTitle>
            <DialogDescription>
              Esta operação afetará {selectedPatientIds.length} pacientes. Esta ação{' '}
              {selectedOperation === 'delete_patients'
                ? 'não pode ser desfeita'
                : 'pode ser desfeita'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmOperation}>
              Confirmar Operação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Confirmation Dialog */}
      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desfazer Operação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desfazer a operação "{operationToUndo?.title}"? Esta ação
              restaurará os dados para o estado anterior à operação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowUndoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmUndo} variant='destructive'>
              Desfazer Operação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BulkOperationsManager;
