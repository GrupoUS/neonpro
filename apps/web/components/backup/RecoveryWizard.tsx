'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  HardDrive,
  RefreshCw,
  Shield,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper';
import { formatBytes, formatDate } from '@/lib/utils';

// Types
type BackupRecord = {
  id: string;
  config_name: string;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  status: 'COMPLETED' | 'FAILED';
  start_time: Date;
  end_time?: Date;
  size?: number;
  file_count?: number;
  storage_location: string;
};

type RecoveryOptions = {
  backup_id: string;
  type: 'FULL_RESTORE' | 'PARTIAL_RESTORE' | 'POINT_IN_TIME' | 'VERIFICATION';
  target_location?: string;
  files_to_restore?: string[];
  point_in_time?: string;
  overwrite_existing: boolean;
  verify_integrity: boolean;
  notification_email?: string;
};

type RecoveryWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const RecoveryWizard: React.FC<RecoveryWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(
    null,
  );
  const [recoveryOptions, setRecoveryOptions] = useState<RecoveryOptions>({
    backup_id: '',
    type: 'FULL_RESTORE',
    overwrite_existing: false,
    verify_integrity: true,
    files_to_restore: [],
  });
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);

  const steps = [
    {
      title: 'Selecionar Backup',
      description: 'Escolha o backup que deseja restaurar',
    },
    {
      title: 'Tipo de Restauração',
      description: 'Configure as opções de restauração',
    },
    {
      title: 'Confirmação',
      description: 'Revise e confirme a operação',
    },
    {
      title: 'Progresso',
      description: 'Acompanhe o progresso da restauração',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadAvailableBackups();
    }
  }, [isOpen, loadAvailableBackups]);

  useEffect(() => {
    if (selectedBackup && recoveryOptions.type === 'PARTIAL_RESTORE') {
      loadBackupFiles(selectedBackup.id);
    }
  }, [selectedBackup, recoveryOptions.type, loadBackupFiles]);

  const loadAvailableBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backup/jobs?status=COMPLETED');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.data || []);
      } else {
        toast.error('Erro ao carregar backups disponíveis');
      }
    } catch (_error) {
      toast.error('Erro ao carregar backups disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupFiles = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/jobs/${backupId}/files`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.files || []);
      }
    } catch (_error) {}
  };

  const handleBackupSelect = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRecoveryOptions({
      ...recoveryOptions,
      backup_id: backup.id,
    });
  };

  const handleRecoveryTypeChange = (type: RecoveryOptions['type']) => {
    setRecoveryOptions({
      ...recoveryOptions,
      type,
      files_to_restore: type === 'PARTIAL_RESTORE' ? [] : undefined,
      point_in_time:
        type === 'POINT_IN_TIME' ? new Date().toISOString() : undefined,
    });
  };

  const handleFileToggle = (file: string, checked: boolean) => {
    const currentFiles = recoveryOptions.files_to_restore || [];
    if (checked) {
      setRecoveryOptions({
        ...recoveryOptions,
        files_to_restore: [...currentFiles, file],
      });
    } else {
      setRecoveryOptions({
        ...recoveryOptions,
        files_to_restore: currentFiles.filter((f) => f !== file),
      });
    }
  };

  const startRecovery = async () => {
    try {
      setRecoveryInProgress(true);
      const response = await fetch('/api/backup/recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recoveryOptions),
      });

      if (response.ok) {
        setCurrentStep(3);
        toast.success('Operação de recuperação iniciada com sucesso');

        // Simular progresso (em produção, seria uma chamada real à API)
        setTimeout(() => {
          setRecoveryInProgress(false);
          toast.success('Recuperação concluída com sucesso');
          onSuccess?.();
          handleClose();
        }, 5000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao iniciar recuperação');
        setRecoveryInProgress(false);
      }
    } catch (_error) {
      toast.error('Erro ao iniciar operação de recuperação');
      setRecoveryInProgress(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedBackup(null);
    setRecoveryOptions({
      backup_id: '',
      type: 'FULL_RESTORE',
      overwrite_existing: false,
      verify_integrity: true,
      files_to_restore: [],
    });
    setRecoveryInProgress(false);
    onClose();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return selectedBackup !== null;
      case 1:
        if (recoveryOptions.type === 'PARTIAL_RESTORE') {
          return (recoveryOptions.files_to_restore?.length || 0) > 0;
        }
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getRecoveryTypeIcon = (type: string) => {
    switch (type) {
      case 'FULL_RESTORE':
        return <Database className="h-4 w-4" />;
      case 'PARTIAL_RESTORE':
        return <FileText className="h-4 w-4" />;
      case 'POINT_IN_TIME':
        return <Clock className="h-4 w-4" />;
      case 'VERIFICATION':
        return <Shield className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">
              Selecione um backup válido para restaurar:
            </div>
            {loading ? (
              <div className="py-8 text-center">
                <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
                <p>Carregando backups disponíveis...</p>
              </div>
            ) : backups.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum backup válido encontrado para restauração.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {backups.map((backup) => (
                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedBackup?.id === backup.id
                        ? 'bg-accent ring-2 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                    key={backup.id}
                    onClick={() => handleBackupSelect(backup)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getRecoveryTypeIcon(backup.type)}
                          <div>
                            <div className="font-medium">
                              {backup.config_name}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {formatDate(new Date(backup.start_time))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{backup.type}</Badge>
                          {backup.size && (
                            <div className="mt-1 text-muted-foreground text-sm">
                              {formatBytes(backup.size)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Tipo de Restauração</Label>
              <Select
                onValueChange={handleRecoveryTypeChange}
                value={recoveryOptions.type}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_RESTORE">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Restauração Completa</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PARTIAL_RESTORE">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Restauração Parcial</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="POINT_IN_TIME">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Point-in-Time</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VERIFICATION">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Verificação de Integridade</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recoveryOptions.type === 'PARTIAL_RESTORE' && (
              <div>
                <Label>Arquivos para Restaurar</Label>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border p-3">
                  {availableFiles.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Carregando lista de arquivos...
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableFiles.map((file) => (
                        <div className="flex items-center space-x-2" key={file}>
                          <Checkbox
                            checked={(
                              recoveryOptions.files_to_restore || []
                            ).includes(file)}
                            id={file}
                            onCheckedChange={(checked) =>
                              handleFileToggle(file, checked as boolean)
                            }
                          />
                          <Label className="text-sm" htmlFor={file}>
                            {file}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {recoveryOptions.type === 'POINT_IN_TIME' && (
              <div>
                <Label htmlFor="point-in-time">Data e Hora</Label>
                <Input
                  className="mt-2"
                  id="point-in-time"
                  onChange={(e) =>
                    setRecoveryOptions({
                      ...recoveryOptions,
                      point_in_time: `${e.target.value}.000Z`,
                    })
                  }
                  type="datetime-local"
                  value={recoveryOptions.point_in_time?.split('.')[0]}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={recoveryOptions.overwrite_existing}
                  id="overwrite"
                  onCheckedChange={(checked) =>
                    setRecoveryOptions({
                      ...recoveryOptions,
                      overwrite_existing: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="overwrite">
                  Sobrescrever arquivos existentes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={recoveryOptions.verify_integrity}
                  id="verify"
                  onCheckedChange={(checked) =>
                    setRecoveryOptions({
                      ...recoveryOptions,
                      verify_integrity: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="verify">Verificar integridade dos dados</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email para Notificação (Opcional)</Label>
              <Input
                className="mt-2"
                id="email"
                onChange={(e) =>
                  setRecoveryOptions({
                    ...recoveryOptions,
                    notification_email: e.target.value,
                  })
                }
                placeholder="seu@email.com"
                type="email"
                value={recoveryOptions.notification_email || ''}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta operação irá restaurar dados do
                backup selecionado. Certifique-se de que as configurações estão
                corretas antes de prosseguir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label className="font-medium text-sm">
                  Backup Selecionado
                </Label>
                <div className="mt-1 text-muted-foreground text-sm">
                  {selectedBackup?.config_name} -{' '}
                  {formatDate(new Date(selectedBackup?.start_time || ''))}
                </div>
              </div>

              <div>
                <Label className="font-medium text-sm">
                  Tipo de Restauração
                </Label>
                <div className="mt-1 text-muted-foreground text-sm">
                  {recoveryOptions.type === 'FULL_RESTORE' &&
                    'Restauração Completa'}
                  {recoveryOptions.type === 'PARTIAL_RESTORE' &&
                    'Restauração Parcial'}
                  {recoveryOptions.type === 'POINT_IN_TIME' &&
                    'Point-in-Time Recovery'}
                  {recoveryOptions.type === 'VERIFICATION' &&
                    'Verificação de Integridade'}
                </div>
              </div>

              {recoveryOptions.type === 'PARTIAL_RESTORE' && (
                <div>
                  <Label className="font-medium text-sm">
                    Arquivos Selecionados (
                    {recoveryOptions.files_to_restore?.length || 0})
                  </Label>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {recoveryOptions.files_to_restore?.map((file) => (
                      <div className="text-muted-foreground text-sm" key={file}>
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-sm">
                    Sobrescrever Existentes
                  </Label>
                  <div className="mt-1 text-muted-foreground text-sm">
                    {recoveryOptions.overwrite_existing ? 'Sim' : 'Não'}
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-sm">
                    Verificar Integridade
                  </Label>
                  <div className="mt-1 text-muted-foreground text-sm">
                    {recoveryOptions.verify_integrity ? 'Sim' : 'Não'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {recoveryInProgress ? (
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>

            {recoveryInProgress ? (
              <>
                <div>
                  <h3 className="font-medium text-lg">
                    Restauração em Progresso
                  </h3>
                  <p className="text-muted-foreground">
                    Por favor, aguarde enquanto os dados são restaurados...
                  </p>
                </div>
                <Progress className="w-full" value={75} />
                <p className="text-muted-foreground text-sm">
                  Estimativa: 2 minutos restantes
                </p>
              </>
            ) : (
              <div>
                <h3 className="font-medium text-lg">Restauração Concluída</h3>
                <p className="text-muted-foreground">
                  Os dados foram restaurados com sucesso!
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      onOpenChange={recoveryInProgress ? undefined : handleClose}
      open={isOpen}
    >
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assistente de Recuperação</DialogTitle>
          <DialogDescription>
            Restore dados de backup de forma fácil e segura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Stepper className="w-full" value={currentStep}>
            {steps.map((step, index) => (
              <StepperItem key={index} value={index}>
                <StepperTrigger>{step.title}</StepperTrigger>
                <StepperContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                    {renderStepContent()}
                  </div>
                </StepperContent>
                {index < steps.length - 1 && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
        </div>

        <DialogFooter>
          {currentStep > 0 && currentStep < 3 && (
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          )}

          {currentStep < 2 && (
            <Button
              disabled={!canProceedToNext()}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === 2 && (
            <Button disabled={recoveryInProgress} onClick={startRecovery}>
              <Download className="mr-2 h-4 w-4" />
              Iniciar Recuperação
            </Button>
          )}

          {currentStep === 3 && !recoveryInProgress && (
            <Button onClick={handleClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecoveryWizard;
