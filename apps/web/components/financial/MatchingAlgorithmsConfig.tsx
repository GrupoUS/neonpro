'use client';

import {
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  RotateCcw,
  Save,
  Shield,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

type MatchingAlgorithmsConfigProps = {
  'data-testid'?: string;
  className?: string;
};

type AlgorithmConfig = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  confidence: number;
  priority: number;
  healthcareSpecific: boolean;
  lgpdCompliant: boolean;
  anvisaApproved: boolean;
};

type MatchingCriteria = {
  exactMatch: boolean;
  fuzzyMatch: boolean;
  amountTolerance: number;
  dateRange: number;
  patientNameSimilarity: number;
  procedureCodeMatching: boolean;
  professionalValidation: boolean;
};

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
  }, [loadAlgorithmConfigs]);

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
    } catch (_err) {
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
      prev.map((algo) => (algo.id === id ? { ...algo, ...updates } : algo)),
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
    } catch (_err) {
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
    <div className="flex flex-wrap gap-1">
      {algorithm.lgpdCompliant && (
        <Badge
          className="bg-green-100 text-green-800 text-xs"
          variant="default"
        >
          LGPD
        </Badge>
      )}
      {algorithm.anvisaApproved && (
        <Badge className="bg-blue-100 text-blue-800 text-xs" variant="default">
          ANVISA
        </Badge>
      )}
      {algorithm.healthcareSpecific && (
        <Badge
          className="bg-purple-100 text-purple-800 text-xs"
          variant="default"
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
              <div className="h-16 animate-pulse rounded bg-muted" key={i} />
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
              data-testid="reset-button"
              disabled={isSaving}
              onClick={resetToDefaults}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar
            </Button>
            <Button
              data-testid="save-button"
              disabled={!hasChanges || isSaving}
              onClick={saveConfiguration}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" defaultValue="algorithms">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger data-testid="algorithms-tab" value="algorithms">
              Algoritmos
            </TabsTrigger>
            <TabsTrigger data-testid="criteria-tab" value="criteria">
              Critérios
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="algorithms">
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
                  data-testid={`algorithm-${algorithm.id}`}
                  key={algorithm.id}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium text-base">
                            {algorithm.name}
                          </Label>
                          {getComplianceBadges(algorithm)}
                        </div>
                        <p className="text-muted-foreground text-sm">
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
                        data-testid={`algorithm-${algorithm.id}-toggle`}
                        onCheckedChange={(enabled) =>
                          updateAlgorithm(algorithm.id, { enabled })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent className="space-y-6" value="criteria">
            {/* Healthcare Matching Criteria */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      checked={criteria.exactMatch}
                      data-testid="exact-match-toggle"
                      id="exact-match"
                      onCheckedChange={(exactMatch) =>
                        updateCriteria({ exactMatch })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuzzy-match">
                      Correspondência Aproximada
                    </Label>
                    <Switch
                      checked={criteria.fuzzyMatch}
                      data-testid="fuzzy-match-toggle"
                      id="fuzzy-match"
                      onCheckedChange={(fuzzyMatch) =>
                        updateCriteria({ fuzzyMatch })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Similaridade de Nome:{' '}
                      {(criteria.patientNameSimilarity * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      data-testid="name-similarity-slider"
                      max={100}
                      min={50}
                      onValueChange={([value]) =>
                        updateCriteria({ patientNameSimilarity: value / 100 })
                      }
                      step={5}
                      value={[criteria.patientNameSimilarity * 100]}
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
                      data-testid="amount-tolerance-slider"
                      max={20}
                      min={0}
                      onValueChange={([value]) =>
                        updateCriteria({ amountTolerance: value / 100 })
                      }
                      step={0.5}
                      value={[criteria.amountTolerance * 100]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Janela de Data: {criteria.dateRange} dias</Label>
                    <Slider
                      data-testid="date-range-slider"
                      max={30}
                      min={1}
                      onValueChange={([value]) =>
                        updateCriteria({ dateRange: value })
                      }
                      step={1}
                      value={[criteria.dateRange]}
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
                      checked={criteria.procedureCodeMatching}
                      data-testid="procedure-code-toggle"
                      id="procedure-code"
                      onCheckedChange={(procedureCodeMatching) =>
                        updateCriteria({ procedureCodeMatching })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="professional-validation">
                      Validação Profissional
                    </Label>
                    <Switch
                      checked={criteria.professionalValidation}
                      data-testid="professional-validation-toggle"
                      id="professional-validation"
                      onCheckedChange={(professionalValidation) =>
                        updateCriteria({ professionalValidation })
                      }
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
                  <div className="space-y-2 text-sm">
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
