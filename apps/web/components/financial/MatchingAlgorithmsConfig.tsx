'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Brain,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Stethoscope,
  Users,
  DollarSign,
  Clock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MatchingAlgorithmsConfigProps {
  'data-testid'?: string;
  className?: string;
}

interface AlgorithmConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  confidence: number;
  priority: number;
  healthcareSpecific: boolean;
  lgpdCompliant: boolean;
  anvisaApproved: boolean;
}

interface MatchingCriteria {
  exactMatch: boolean;
  fuzzyMatch: boolean;
  amountTolerance: number;
  dateRange: number;
  patientNameSimilarity: number;
  procedureCodeMatching: boolean;
  professionalValidation: boolean;
}

/**
 * Matching Algorithms Configuration Component
 *
 * Healthcare Financial Matching with AI Intelligence
 * - Patient payment matching algorithms
 * - Medical procedure billing reconciliation
 * - LGPD compliant data processing
 * - ANVISA medical device billing validation
 * - CFM professional billing oversight
 * - AI ethics for healthcare financial decisions
 *
 * Quality Standard: ≥9.9/10 (Healthcare financial AI integrity)
 */
export const MatchingAlgorithmsConfig: React.FC<
  MatchingAlgorithmsConfigProps
> = ({
  'data-testid': testId = 'matching-algorithms-config',
  className = '',
}) => {
  const [algorithms, setAlgorithms] = useState<AlgorithmConfig[]>([]);
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    exactMatch: true,
    fuzzyMatch: true,
    amountTolerance: 0.05, // 5% tolerance
    dateRange: 7, // 7 days
    patientNameSimilarity: 0.85,
    procedureCodeMatching: true,
    professionalValidation: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAlgorithmConfigs();
  }, []);

  const loadAlgorithmConfigs = async () => {
    try {
      setIsLoading(true);
      // Simulate healthcare AI algorithm config load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAlgorithms: AlgorithmConfig[] = [
        {
          id: 'exact-match',
          name: 'Correspondência Exata',
          description:
            'Correspondência perfeita de dados do paciente e procedimento',
          enabled: true,
          confidence: 0.99,
          priority: 1,
          healthcareSpecific: true,
          lgpdCompliant: true,
          anvisaApproved: true,
        },
        {
          id: 'fuzzy-patient',
          name: 'Correspondência Aproximada de Paciente',
          description:
            'Algoritmo inteligente para variações de nome do paciente',
          enabled: true,
          confidence: 0.87,
          priority: 2,
          healthcareSpecific: true,
          lgpdCompliant: true,
          anvisaApproved: true,
        },
        {
          id: 'procedure-similarity',
          name: 'Similaridade de Procedimentos',
          description: 'Correspondência baseada em códigos TUSS e similares',
          enabled: true,
          confidence: 0.82,
          priority: 3,
          healthcareSpecific: true,
          lgpdCompliant: true,
          anvisaApproved: true,
        },
        {
          id: 'amount-tolerance',
          name: 'Tolerância de Valor',
          description:
            'Permite pequenas diferenças de valor dentro da margem configurada',
          enabled: true,
          confidence: 0.75,
          priority: 4,
          healthcareSpecific: false,
          lgpdCompliant: true,
          anvisaApproved: false,
        },
        {
          id: 'ai-prediction',
          name: 'Predição por IA',
          description:
            'Algoritmo de machine learning para correspondências complexas',
          enabled: false,
          confidence: 0.68,
          priority: 5,
          healthcareSpecific: true,
          lgpdCompliant: true,
          anvisaApproved: false,
        },
      ];

      setAlgorithms(mockAlgorithms);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar configurações dos algoritmos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlgorithm = (id: string, updates: Partial<AlgorithmConfig>) => {
    setAlgorithms((prev) =>
      prev.map((algo) => (algo.id === id ? { ...algo, ...updates } : algo))
    );
    setHasChanges(true);
  };

  const updateCriteria = (updates: Partial<MatchingCriteria>) => {
    setCriteria((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Simulate healthcare-compliant save
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Configuração Salva',
        description: 'Algoritmos atualizados com conformidade LGPD',
        variant: 'default',
      });

      setHasChanges(false);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    loadAlgorithmConfigs();
    setCriteria({
      exactMatch: true,
      fuzzyMatch: true,
      amountTolerance: 0.05,
      dateRange: 7,
      patientNameSimilarity: 0.85,
      procedureCodeMatching: true,
      professionalValidation: true,
    });
    setHasChanges(false);
  };

  const getComplianceBadges = (algorithm: AlgorithmConfig) => (
    <div className="flex gap-1 flex-wrap">
      {algorithm.lgpdCompliant && (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 text-xs"
        >
          LGPD
        </Badge>
      )}
      {algorithm.anvisaApproved && (
        <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
          ANVISA
        </Badge>
      )}
      {algorithm.healthcareSpecific && (
        <Badge
          variant="default"
          className="bg-purple-100 text-purple-800 text-xs"
        >
          Saúde
        </Badge>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className} data-testid={`${testId}-loading`}>
        <CardHeader>
          <CardTitle>Carregando Configurações...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Configuração de Algoritmos de Correspondência
            </CardTitle>
            <CardDescription>
              Inteligência artificial para reconciliação financeira em saúde
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              disabled={isSaving}
              data-testid="reset-button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
            <Button
              onClick={saveConfiguration}
              disabled={!hasChanges || isSaving}
              data-testid="save-button"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="algorithms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="algorithms" data-testid="algorithms-tab">
              Algoritmos
            </TabsTrigger>
            <TabsTrigger value="criteria" data-testid="criteria-tab">
              Critérios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="algorithms" className="space-y-4">
            {/* Healthcare Compliance Alert */}
            <Alert data-testid="compliance-alert">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Todos os algoritmos estão em conformidade com LGPD e
                regulamentações de saúde brasileiras. Algoritmos ANVISA
                aprovados possuem validação adicional para procedimentos
                médicos.
              </AlertDescription>
            </Alert>

            {/* Algorithm Cards */}
            <div className="space-y-4">
              {algorithms.map((algorithm) => (
                <Card
                  key={algorithm.id}
                  data-testid={`algorithm-${algorithm.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-medium">
                            {algorithm.name}
                          </Label>
                          {getComplianceBadges(algorithm)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {algorithm.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span>
                              Confiança:{' '}
                              {(algorithm.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-blue-600" />
                            <span>Prioridade: {algorithm.priority}</span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={algorithm.enabled}
                        onCheckedChange={(enabled) =>
                          updateAlgorithm(algorithm.id, { enabled })
                        }
                        data-testid={`algorithm-${algorithm.id}-toggle`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-6">
            {/* Healthcare Matching Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Matching */}
              <Card data-testid="patient-matching-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-4 w-4" />
                    Correspondência de Pacientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exact-match">Correspondência Exata</Label>
                    <Switch
                      id="exact-match"
                      checked={criteria.exactMatch}
                      onCheckedChange={(exactMatch) =>
                        updateCriteria({ exactMatch })
                      }
                      data-testid="exact-match-toggle"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuzzy-match">
                      Correspondência Aproximada
                    </Label>
                    <Switch
                      id="fuzzy-match"
                      checked={criteria.fuzzyMatch}
                      onCheckedChange={(fuzzyMatch) =>
                        updateCriteria({ fuzzyMatch })
                      }
                      data-testid="fuzzy-match-toggle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Similaridade de Nome:{' '}
                      {(criteria.patientNameSimilarity * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[criteria.patientNameSimilarity * 100]}
                      onValueChange={([value]) =>
                        updateCriteria({ patientNameSimilarity: value / 100 })
                      }
                      max={100}
                      min={50}
                      step={5}
                      data-testid="name-similarity-slider"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Matching */}
              <Card data-testid="financial-matching-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-4 w-4" />
                    Correspondência Financeira
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Tolerância de Valor:{' '}
                      {(criteria.amountTolerance * 100).toFixed(1)}%
                    </Label>
                    <Slider
                      value={[criteria.amountTolerance * 100]}
                      onValueChange={([value]) =>
                        updateCriteria({ amountTolerance: value / 100 })
                      }
                      max={20}
                      min={0}
                      step={0.5}
                      data-testid="amount-tolerance-slider"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Janela de Data: {criteria.dateRange} dias</Label>
                    <Slider
                      value={[criteria.dateRange]}
                      onValueChange={([value]) =>
                        updateCriteria({ dateRange: value })
                      }
                      max={30}
                      min={1}
                      step={1}
                      data-testid="date-range-slider"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical Procedures */}
              <Card data-testid="medical-procedures-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-4 w-4" />
                    Procedimentos Médicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="procedure-code">Códigos TUSS/ANVISA</Label>
                    <Switch
                      id="procedure-code"
                      checked={criteria.procedureCodeMatching}
                      onCheckedChange={(procedureCodeMatching) =>
                        updateCriteria({ procedureCodeMatching })
                      }
                      data-testid="procedure-code-toggle"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="professional-validation">
                      Validação Profissional
                    </Label>
                    <Switch
                      id="professional-validation"
                      checked={criteria.professionalValidation}
                      onCheckedChange={(professionalValidation) =>
                        updateCriteria({ professionalValidation })
                      }
                      data-testid="professional-validation-toggle"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card data-testid="performance-metrics-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-4 w-4" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-medium">87.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio:</span>
                      <span className="font-medium">1.2s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processados Hoje:</span>
                      <span className="font-medium">1,247</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Changes Indicator */}
        {hasChanges && (
          <Alert className="mt-4" data-testid="changes-alert">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Você tem alterações não salvas. Clique em "Salvar" para aplicar as
              configurações.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
