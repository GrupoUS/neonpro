'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Play,
  Pause,
  BarChart3,
  Target,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  RetentionStrategy, 
  RetentionStrategyType,
  RetentionStrategyStatus,
  CreateRetentionStrategyData
} from '@/types/retention-analytics';
import { useCreateRetentionStrategy, useExecuteStrategy } from '@/hooks/use-retention-analytics';
import { toast } from 'react-hot-toast';

interface RetentionStrategiesPanelProps {
  strategies: RetentionStrategy[];
  clinicId: string;
}

export function RetentionStrategiesPanel({ strategies, clinicId }: RetentionStrategiesPanelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateRetentionStrategyData>>({
    strategy_type: 'email_campaign',
    status: 'draft'
  });

  const createStrategyMutation = useCreateRetentionStrategy();
  const executeStrategyMutation = useExecuteStrategy();

  const getStatusBadgeVariant = (status: RetentionStrategyStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: RetentionStrategyStatus) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'draft':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: RetentionStrategyType) => {
    const labels = {
      email_campaign: 'Campanha de Email',
      sms_campaign: 'Campanha de SMS',
      discount_offer: 'Oferta de Desconto',
      loyalty_program: 'Programa de Fidelidade',
      personalized_outreach: 'Abordagem Personalizada',
      appointment_reminder: 'Lembrete de Consulta',
      follow_up_call: 'Ligação de Follow-up',
      referral_incentive: 'Incentivo de Indicação'
    };
    return labels[type] || type;
  };

  const handleCreateStrategy = async () => {
    if (!formData.name || !formData.strategy_type || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createStrategyMutation.mutateAsync({
        clinic_id: clinicId,
        ...formData as CreateRetentionStrategyData
      });
      
      toast.success('Estratégia criada com sucesso!');
      setIsCreateDialogOpen(false);
      setFormData({ strategy_type: 'email_campaign', status: 'draft' });
    } catch (error) {
      toast.error('Erro ao criar estratégia');
    }
  };

  const handleExecuteStrategy = async (strategyId: string) => {
    try {
      await executeStrategyMutation.mutateAsync({
        strategy_id: strategyId,
        execution_parameters: {}
      });
      
      toast.success('Estratégia executada com sucesso!');
    } catch (error) {
      toast.error('Erro ao executar estratégia');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header com ação de criação */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Estratégias de Retenção</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie e execute estratégias para melhorar a retenção de pacientes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Estratégia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Estratégia</DialogTitle>
              <DialogDescription>
                Configure uma nova estratégia de retenção para seus pacientes
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Estratégia</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Campanha de Reativação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.strategy_type} 
                    onValueChange={(value: RetentionStrategyType) => 
                      setFormData({ ...formData, strategy_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_campaign">Campanha de Email</SelectItem>
                      <SelectItem value="sms_campaign">Campanha de SMS</SelectItem>
                      <SelectItem value="discount_offer">Oferta de Desconto</SelectItem>
                      <SelectItem value="loyalty_program">Programa de Fidelidade</SelectItem>
                      <SelectItem value="personalized_outreach">Abordagem Personalizada</SelectItem>
                      <SelectItem value="appointment_reminder">Lembrete de Consulta</SelectItem>
                      <SelectItem value="follow_up_call">Ligação de Follow-up</SelectItem>
                      <SelectItem value="referral_incentive">Incentivo de Indicação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os objetivos e abordagem da estratégia..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-segments">Segmentos Alvo</Label>
                  <Textarea
                    id="target-segments"
                    value={formData.target_segments?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      target_segments: e.target.value.split(',').map(s => s.trim()) 
                    })}
                    placeholder="Ex: pacientes_inativos, alto_valor, jovens"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="success-metrics">Métricas de Sucesso</Label>
                  <Textarea
                    id="success-metrics"
                    value={formData.success_metrics?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      success_metrics: e.target.value.split(',').map(s => s.trim()) 
                    })}
                    placeholder="Ex: taxa_abertura, conversao, reativacao"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateStrategy}
                disabled={createStrategyMutation.isPending}
              >
                {createStrategyMutation.isPending ? 'Criando...' : 'Criar Estratégia'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de estratégias */}
      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <Card key={strategy.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <Badge 
                    variant={getStatusBadgeVariant(strategy.status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(strategy.status)}
                    {strategy.status === 'active' ? 'Ativa' :
                     strategy.status === 'paused' ? 'Pausada' :
                     strategy.status === 'completed' ? 'Concluída' : 'Rascunho'}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(strategy.strategy_type)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {strategy.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleExecuteStrategy(strategy.id)}
                      disabled={executeStrategyMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Executar
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {strategy.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{strategy.target_segments.join(', ')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Criado em {formatDate(strategy.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Meta: {formatPercentage(strategy.expected_improvement || 0)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>{strategy.executions_count || 0} execuções</span>
                </div>
              </div>
              
              {strategy.performance_metrics && Object.keys(strategy.performance_metrics).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(strategy.performance_metrics).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace('_', ' ')}
                        </div>
                        <div className="text-sm font-medium">
                          {typeof value === 'number' ? formatPercentage(value) : String(value)}
                        </div>
                        {typeof value === 'number' && (
                          <Progress value={value * 100} className="h-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {strategies.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">Nenhuma estratégia criada</h3>
            <p className="text-sm text-muted-foreground">
              Comece criando sua primeira estratégia de retenção
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}