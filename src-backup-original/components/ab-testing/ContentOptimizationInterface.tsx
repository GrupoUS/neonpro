/**
 * Content Optimization Interface
 * NeonPro - Interface completa para gestão de testes A/B e otimização de conteúdo
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Play, Pause, Square, Eye, BarChart3, Settings, Users, Target, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Copy, Edit, Trash2, Download, Upload, RefreshCw, Filter,
  Calendar as CalendarIcon, PieChart, LineChart, Activity,
  Zap, Trophy, Star, Flag, Mail, MessageSquare, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { abTestingEngine } from '@/lib/ab-testing/ab-testing-engine';
import type { 
  ABTestConfig, TestVariation, TestResults, TestTemplate,
  AudienceFilter, ConversionGoal, TestQueryFilter 
} from '@/lib/ab-testing/types/ab-testing';

interface ContentOptimizationProps {
  clinicId: string;
  userId: string;
}

interface TestCreationState {
  name: string;
  description: string;
  type: 'email' | 'sms' | 'whatsapp' | 'notification';
  audienceFilter: AudienceFilter;
  primaryGoal: ConversionGoal;
  secondaryGoals: ConversionGoal[];
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  trafficAllocation: number;
  confidenceLevel: 90 | 95 | 99;
  minimumDetectableEffect: number;
  variations: Partial<TestVariation>[];
}

export default function ContentOptimizationInterface({ clinicId, userId }: ContentOptimizationProps) {
  // State Management
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTestConfig | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState<TestQueryFilter>({
    clinicId,
    page: 1,
    limit: 20
  });

  // Test Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [testCreationState, setTestCreationState] = useState<TestCreationState>({
    name: '',
    description: '',
    type: 'email',
    audienceFilter: {
      includeAll: true,
      ageRange: { min: 18, max: 80 },
      gender: 'all'
    },
    primaryGoal: {
      id: 'conversion',
      name: 'Conversão',
      type: 'conversion',
      description: 'Taxa de conversão geral'
    },
    secondaryGoals: [],
    trafficAllocation: 100,
    confidenceLevel: 95,
    minimumDetectableEffect: 5,
    variations: [
      { name: 'Controle', trafficPercentage: 50, content: {} },
      { name: 'Variação A', trafficPercentage: 50, content: {} }
    ]
  });

  // Load initial data
  useEffect(() => {
    loadTests();
    loadTemplates();
  }, []);

  // Auto-refresh active tests
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTest?.status === 'active') {
        loadTestResults(selectedTest.id);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedTest]);

  /**
   * ====================================================================
   * DATA LOADING
   * ====================================================================
   */

  const loadTests = async () => {
    try {
      setIsLoading(true);
      const result = await abTestingEngine.getTests(filter);
      setTests(result.tests);
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Erro ao carregar testes A/B');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Implementar busca de templates do banco
      // Por enquanto, usando dados mock
      setTemplates([
        {
          id: 'email-1',
          name: 'Confirmação de Consulta',
          type: 'email',
          category: 'appointment',
          description: 'Template para confirmação de consultas',
          content: {
            subject: 'Confirmação de Consulta - {clinic_name}',
            body: 'Olá {patient_name}, sua consulta está confirmada para {appointment_date}.'
          },
          tags: ['consulta', 'confirmação'],
          usage: 245,
          performance: { conversionRate: 85.5, openRate: 92.3 },
          lastUsed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadTestResults = async (testId: string) => {
    try {
      const results = await abTestingEngine.calculateTestResults(testId);
      setTestResults(results);
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  };

  /**
   * ====================================================================
   * TEST MANAGEMENT
   * ====================================================================
   */

  const createTest = async () => {
    try {
      setIsLoading(true);
      
      const testConfig: Partial<ABTestConfig> = {
        clinicId,
        name: testCreationState.name,
        description: testCreationState.description,
        type: testCreationState.type,
        audienceFilter: testCreationState.audienceFilter,
        primaryGoal: testCreationState.primaryGoal,
        secondaryGoals: testCreationState.secondaryGoals,
        startDate: testCreationState.startDate,
        endDate: testCreationState.endDate,
        duration: testCreationState.duration,
        trafficAllocation: testCreationState.trafficAllocation,
        confidenceLevel: testCreationState.confidenceLevel,
        minimumDetectableEffect: testCreationState.minimumDetectableEffect,
        variations: testCreationState.variations,
        createdBy: userId
      };

      const newTest = await abTestingEngine.createTest(testConfig);
      setTests(prev => [newTest, ...prev]);
      setIsCreating(false);
      setCreationStep(1);
      
      toast.success('Teste A/B criado com sucesso!');
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Erro ao criar teste A/B');
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    try {
      await abTestingEngine.startTest(testId);
      await loadTests();
      toast.success('Teste iniciado com sucesso!');
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Erro ao iniciar teste');
    }
  };

  const pauseTest = async (testId: string) => {
    try {
      await abTestingEngine.pauseTest(testId, 'Pausado pelo usuário');
      await loadTests();
      toast.success('Teste pausado');
    } catch (error) {
      console.error('Error pausing test:', error);
      toast.error('Erro ao pausar teste');
    }
  };

  const completeTest = async (testId: string) => {
    try {
      const results = await abTestingEngine.completeTest(testId, 'Finalizado pelo usuário');
      setTestResults(results);
      await loadTests();
      toast.success('Teste finalizado');
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Erro ao finalizar teste');
    }
  };

  /**
   * ====================================================================
   * TEMPLATE MANAGEMENT
   * ====================================================================
   */

  const duplicateTemplate = (template: TestTemplate) => {
    const newVariation: Partial<TestVariation> = {
      name: `Baseado em ${template.name}`,
      content: template.content,
      trafficPercentage: 50
    };

    setTestCreationState(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation]
    }));

    toast.success('Template adicionado como variação');
  };

  const applyTemplate = (template: TestTemplate, variationIndex: number) => {
    setTestCreationState(prev => ({
      ...prev,
      variations: prev.variations.map((variation, index) => 
        index === variationIndex 
          ? { ...variation, content: template.content }
          : variation
      )
    }));

    toast.success('Template aplicado à variação');
  };

  /**
   * ====================================================================
   * VALIDATION
   * ====================================================================
   */

  const validateTestCreation = (): boolean => {
    if (!testCreationState.name.trim()) {
      toast.error('Nome do teste é obrigatório');
      return false;
    }

    if (testCreationState.variations.length < 2) {
      toast.error('É necessário pelo menos 2 variações');
      return false;
    }

    const totalTraffic = testCreationState.variations.reduce(
      (sum, v) => sum + (v.trafficPercentage || 0), 0
    );

    if (Math.abs(totalTraffic - 100) > 0.01) {
      toast.error('A soma das porcentagens de tráfego deve ser 100%');
      return false;
    }

    return true;
  };

  /**
   * ====================================================================
   * RENDER HELPERS
   * ====================================================================
   */

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, icon: Edit },
      active: { variant: 'default' as const, icon: Play },
      paused: { variant: 'outline' as const, icon: Pause },
      completed: { variant: 'success' as const, icon: CheckCircle }
    };

    const config = variants[status as keyof typeof variants] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPerformanceIndicator = (metric: number, threshold: number = 50) => {
    if (metric >= threshold * 1.2) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (metric <= threshold * 0.8) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'highly_significant': return 'text-green-600';
      case 'significant': return 'text-blue-600';
      case 'marginally_significant': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  /**
   * ====================================================================
   * RENDER COMPONENTS
   * ====================================================================
   */

  const renderTestsList = () => (
    <div className="space-y-4">
      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar testes..."
            value={filter.searchTerm || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full"
          />
        </div>
        <Select
          value={filter.status?.[0] || 'all'}
          onValueChange={(value) => setFilter(prev => ({ 
            ...prev, 
            status: value === 'all' ? undefined : [value as any]
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="completed">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>
          <Zap className="h-4 w-4 mr-2" />
          Novo Teste A/B
        </Button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTest(test)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {test.description}
                  </CardDescription>
                </div>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {test.currentSampleSize || 0} / {test.sampleSize} amostras
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {test.confidenceLevel}% confiança
                  </span>
                </div>

                {test.status === 'active' && (
                  <Progress 
                    value={(test.currentSampleSize / test.sampleSize) * 100} 
                    className="h-2"
                  />
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {test.variations.length} variações
                  </span>
                  <div className="flex gap-1">
                    {test.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          startTest(test.id);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {test.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          pauseTest(test.id);
                        }}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTest(test);
                        loadTestResults(test.id);
                      }}
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum teste encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro teste A/B para otimizar suas comunicações.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Criar Primeiro Teste
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTestCreation = () => (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Teste A/B</CardTitle>
        <CardDescription>
          Configure um teste para otimizar suas comunicações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                step <= creationStep 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {creationStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-name">Nome do Teste</Label>
                  <Input
                    id="test-name"
                    value={testCreationState.name}
                    onChange={(e) => setTestCreationState(prev => ({ 
                      ...prev, name: e.target.value 
                    }))}
                    placeholder="Ex: Teste de Subject Line - Janeiro 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-type">Tipo de Comunicação</Label>
                  <Select
                    value={testCreationState.type}
                    onValueChange={(value: any) => setTestCreationState(prev => ({ 
                      ...prev, type: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </div>
                      </SelectItem>
                      <SelectItem value="notification">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notificação
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-description">Descrição</Label>
                <Textarea
                  id="test-description"
                  value={testCreationState.description}
                  onChange={(e) => setTestCreationState(prev => ({ 
                    ...prev, description: e.target.value 
                  }))}
                  placeholder="Descreva o objetivo e hipótese do teste..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              {creationStep > 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setCreationStep(prev => prev - 1)}
                >
                  Voltar
                </Button>
              )}
              {creationStep < 4 ? (
                <Button 
                  onClick={() => setCreationStep(prev => prev + 1)}
                  disabled={creationStep === 1 && !testCreationState.name.trim()}
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  onClick={createTest}
                  disabled={!validateTestCreation() || isLoading}
                >
                  {isLoading ? 'Criando...' : 'Criar Teste'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTestResults = () => {
    if (!selectedTest || !testResults) return null;

    return (
      <div className="space-y-6">
        {/* Test Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedTest.name}</h2>
            <p className="text-muted-foreground">{selectedTest.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTest.status)}
            <Button
              variant="outline"
              onClick={() => setSelectedTest(null)}
            >
              Voltar
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressões</p>
                  <p className="text-2xl font-bold">{testResults.totalImpressions.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversões</p>
                  <p className="text-2xl font-bold">{testResults.totalConversions.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{testResults.overallConversionRate.toFixed(2)}%</p>
                </div>
                <PieChart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Significância</p>
                  <p className={cn("text-2xl font-bold", getSignificanceColor(testResults.statisticalSignificance))}>
                    {testResults.statisticalSignificance === 'highly_significant' ? 'Alta' :
                     testResults.statisticalSignificance === 'significant' ? 'Média' :
                     testResults.statisticalSignificance === 'marginally_significant' ? 'Baixa' : 'N/A'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Variations Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados por Variação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.variationResults.map((result, index) => (
                <div key={result.variationId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{result.variationName}</h4>
                      {result.isWinner && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Vencedor
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge variant="outline">Controle</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getPerformanceIndicator(result.conversionRate)}
                      <span className="text-sm text-muted-foreground">
                        {result.liftPercentage > 0 ? '+' : ''}{result.liftPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressões</p>
                      <p className="text-lg font-medium">{result.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversões</p>
                      <p className="text-lg font-medium">{result.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-lg font-medium">{result.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>

                  {result.significance !== 'not_significant' && (
                    <div className="mt-3 p-2 bg-muted rounded">
                      <p className="text-sm">
                        <span className={cn("font-medium", getSignificanceColor(result.significance))}>
                          Significância: {result.significance}
                        </span>
                        {' '}(p-value: {result.pValue?.toFixed(4)})
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        {testResults.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Insights e Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.insights.map((insight, index) => (
                  <Alert key={index}>
                    <Star className="h-4 w-4" />
                    <AlertTitle>Insight {index + 1}</AlertTitle>
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
                
                {testResults.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recomendações:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {testResults.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  /**
   * ====================================================================
   * MAIN RENDER
   * ====================================================================
   */

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Otimização de Conteúdo</h1>
            <p className="text-muted-foreground">
              Testes A/B e otimização de comunicações
            </p>
          </div>
          <Button onClick={loadTests} variant="outline" disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isCreating ? renderTestCreation() : renderTestsList()}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Templates</CardTitle>
                <CardDescription>
                  Templates otimizados para diferentes tipos de comunicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span>Taxa de conversão: {template.performance.conversionRate}%</span>
                            <span>{template.usage} usos</span>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => duplicateTemplate(template)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Usar
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {selectedTest ? renderTestResults() : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um teste</h3>
                  <p className="text-muted-foreground">
                    Escolha um teste da lista para ver os resultados detalhados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Testes A/B</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-winner">Seleção Automática de Vencedor</Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar automaticamente a variação vencedora quando significância for atingida
                    </p>
                  </div>
                  <Switch id="auto-winner" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Nível de Confiança Padrão</Label>
                  <Select defaultValue="95">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}