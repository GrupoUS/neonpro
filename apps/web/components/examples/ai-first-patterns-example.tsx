"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Import all AI-First components
import { AILoadingStates, PatientAnalysisLoading, MedicalQueryLoading, useAILoadingState } from "../ui/ai-loading-states";
import { ConfidencePatterns, DiagnosisConfidence, TreatmentConfidence, MultiConfidence, ConfidenceTrend } from "../ui/confidence-patterns";
import { AIErrorBoundary, AIErrorType, classifyAIError, withAIErrorBoundary } from "../ui/error-boundary-ai";
import { ContextSwitching, useContextSwitching, ContextSwitchingProvider, QuickContextSwitcher, ContextType, Department, UserRole, SwitchReason } from "../ui/context-switching";
import { VoiceInteractionUX, VoiceContext, VoiceMode, useVoiceInteraction } from "../ui/voice-interaction-ux";

// Simulated AI operations
const simulateAIOperation = async (type: string, shouldFail = false): Promise<{
  success: boolean;
  confidence?: number;
  result?: any;
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  if (shouldFail) {
    throw new Error(`AI processing failed for ${type}`);
  }
  
  const confidence = 70 + Math.random() * 25; // 70-95%
  return {
    success: true,
    confidence,
    result: `Análise ${type} concluída com sucesso`,
  };
};

// Sample healthcare data
const samplePatients = [
  {
    id: "P001",
    name: "Maria Silva Santos",
    age: 45,
    procedure: "Aplicação de Botox",
    lastVisit: "2024-08-15",
    riskLevel: "baixo"
  },
  {
    id: "P002", 
    name: "João Carlos Oliveira",
    age: 52,
    procedure: "Preenchimento Facial",
    lastVisit: "2024-08-20",
    riskLevel: "médio"
  },
  {
    id: "P003",
    name: "Ana Paula Costa",
    age: 38,
    procedure: "Harmonização Orofacial",
    lastVisit: "2024-08-25",
    riskLevel: "alto"
  }
];

// AI-First Workflow Component
function AIFirstWorkflow() {
  const [activeDemo, setActiveDemo] = useState<string>("patient-analysis");
  const [selectedPatient, setSelectedPatient] = useState(samplePatients[0]);
  const [aiResults, setAiResults] = useState<any>(null);
  const [shouldFail, setShouldFail] = useState(false);
  const [shouldThrow, setShouldThrow] = useState<string | null>(null);
  
  const { 
    isLoading, 
    progress, 
    startLoading, 
    stopLoading,
    LoadingComponent 
  } = useAILoadingState("patient-analysis", 4);

  const [error, setError] = useState<Error | null>(null);

  // Throw error during render if shouldThrow is set (for error boundary testing)
  if (shouldThrow) {
    const errorToThrow = new Error(`Simulated ${shouldThrow} error`);
    setShouldThrow(null); // Reset for next time
    throw errorToThrow;
  }

  const handleAIAnalysis = async () => {
    setAiResults(null);
    setError(null);
    startLoading();
    
    try {
      const result = await simulateAIOperation("patient-analysis", shouldFail);
      setAiResults(result);
      stopLoading();
    } catch (error) {
      stopLoading();
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      console.error('AI Analysis Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Demonstração AI-First Healthcare
          </CardTitle>
          <CardDescription>
            Experiência completa com todos os componentes AI-First integrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeDemo === "patient-analysis" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDemo("patient-analysis")}
            >
              👨‍⚕️ Análise de Paciente
            </Button>
            <Button
              variant={activeDemo === "voice-consultation" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDemo("voice-consultation")}
            >
              🎤 Consulta por Voz
            </Button>
            <Button
              variant={activeDemo === "context-switching" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDemo("context-switching")}
            >
              🔄 Mudança de Contexto
            </Button>
            <Button
              variant={activeDemo === "error-handling" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDemo("error-handling")}
            >
              🚨 Tratamento de Erros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Analysis Demo */}
      {activeDemo === "patient-analysis" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Inteligente de Pacientes</CardTitle>
              <CardDescription>
                Demonstração completa do workflow AI-first para análise de pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Selecionar Paciente:</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  {samplePatients.map(patient => (
                    <Card
                      key={patient.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedPatient.id === patient.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{patient.name}</div>
                          <div className="text-xs text-gray-600">
                            {patient.age} anos • {patient.procedure}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                patient.riskLevel === "alto" ? "destructive" :
                                patient.riskLevel === "médio" ? "secondary" : "default"
                              }
                              className="text-xs"
                            >
                              Risco {patient.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Analysis Controls */}
              <div className="flex gap-3 items-center">
                <Button onClick={handleAIAnalysis} disabled={isLoading}>
                  {isLoading ? "Analisando..." : "🧠 Analisar com IA"}
                </Button>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={shouldFail}
                    onChange={(e) => setShouldFail(e.target.checked)}
                  />
                  Simular erro
                </label>
              </div>

              {/* AI Loading States */}
              {isLoading && (
                <AIErrorBoundary
                  context="Análise de Paciente"
                  enableFallback
                  onRecovery={(action) => {
                    console.log("Recovery action:", action);
                    if (action === "retry") {
                      handleAIAnalysis();
                    }
                  }}
                >
                  <PatientAnalysisLoading
                    estimatedSeconds={4}
                    showProgress
                    showConfidenceEstimation
                    showTimeEstimate
                    onComplete={() => console.log("Analysis complete")}
                  />
                </AIErrorBoundary>
              )}

              {/* Results with Confidence */}
              {aiResults && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Resultados da Análise IA</h4>
                      <ConfidencePatterns
                        score={aiResults.confidence}
                        category="patient-analysis"
                        variant="badge"
                        showTooltip
                        context={`Análise de ${selectedPatient.name}`}
                      />
                    </div>

                    <Alert>
                      <AlertDescription>
                        <strong>Resultado:</strong> {aiResults.result}
                      </AlertDescription>
                    </Alert>

                    {/* Multi-confidence display */}
                    <MultiConfidence
                      confidenceScores={[
                        {
                          label: "Avaliação de Risco",
                          score: aiResults.confidence - 5,
                          category: "risk-assessment"
                        },
                        {
                          label: "Sugestão de Tratamento", 
                          score: aiResults.confidence + 3,
                          category: "treatment-suggestion"
                        },
                        {
                          label: "Análise Geral",
                          score: aiResults.confidence,
                          category: "general"
                        }
                      ]}
                      variant="horizontal"
                    />

                    {/* Confidence trend */}
                    <ConfidenceTrend
                      trends={[
                        { timestamp: "10:00", score: aiResults.confidence - 10 },
                        { timestamp: "10:15", score: aiResults.confidence - 5 },
                        { timestamp: "10:30", score: aiResults.confidence - 2 },
                        { timestamp: "10:45", score: aiResults.confidence }
                      ]}
                      category="patient-analysis"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Voice Consultation Demo */}
      {activeDemo === "voice-consultation" && (
        <Card>
          <CardHeader>
            <CardTitle>Consulta Médica por Voz</CardTitle>
            <CardDescription>
              Sistema completo de interação por voz para consultas médicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceInteractionUX
              context={VoiceContext.PATIENT_CONSULTATION}
              mode={VoiceMode.PUSH_TO_TALK}
              showConfidence
              showTranscript
              enableCommands
              onTranscript={(text, confidence) => {
                console.log("Voice transcript:", text, "Confidence:", confidence);
              }}
              onCommand={(command, action, text) => {
                console.log("Voice command:", command, action, text);
              }}
              onError={(error) => {
                console.log("Voice error:", error);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Context Switching Demo */}
      {activeDemo === "context-switching" && (
        <ContextSwitchingProvider
          initialContext={{
            type: ContextType.AI_ASSISTED,
            department: Department.AESTHETIC,
            userRole: UserRole.DOCTOR,
            patientId: selectedPatient.id,
            activeWorkflow: "patient-consultation",
            aiConfidence: 87
          }}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Mudança de Contexto</CardTitle>
                <CardDescription>
                  Transições inteligentes entre contextos AI ↔ Humano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickContextSwitcher className="mb-4" />
              </CardContent>
            </Card>
            
            <ContextSwitchingDemo />
          </div>
        </ContextSwitchingProvider>
      )}

      {/* Error Handling Demo */}
      {activeDemo === "error-handling" && (
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Tratamento de Erros IA</CardTitle>
            <CardDescription>
              Demonstração de recovery inteligente para diferentes tipos de erro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.values(AIErrorType).slice(0, 6).map(errorType => (
                <Button
                  key={errorType}
                  variant="outline"
                  onClick={() => {
                    // Set state to trigger error on next render
                    setShouldThrow(errorType);
                  }}
                >
                  Simular {errorType}
                </Button>
              ))}
            </div>
            
            <AIErrorBoundary
              context="Demonstração de Erros"
              enableFallback
              enableRetry
              maxRetries={3}
              onError={(error, errorType) => {
                console.log("AI Error:", error, errorType);
              }}
              onRecovery={(action) => {
                console.log("Recovery action:", action);
              }}
            >
              <ErrorProneComponent />
            </AIErrorBoundary>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Context Switching Demo Component
function ContextSwitchingDemo() {
  const { context, switchContext, isTransitioning } = useContextSwitching({
    type: ContextType.AI_ASSISTED,
    department: Department.AESTHETIC,
    userRole: UserRole.DOCTOR
  });

  return (
    <div className="space-y-4">
      <ContextSwitching
        currentContext={context}
        onContextSwitch={async (newType, reason) => {
          const success = await switchContext(newType, reason);
          return success;
        }}
        showTransitionAnimation
      />
      
      {isTransitioning && (
        <Alert>
          <AlertDescription>
            🔄 Mudando contexto... Por favor aguarde.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Error-prone component for testing
function ErrorProneComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("Component crashed intentionally");
  }

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold mb-2">Componente de Teste</h4>
      <p className="text-sm text-gray-600 mb-3">
        Este componente funciona normalmente até que um erro seja simulado.
      </p>
      <Button
        variant="destructive"
        onClick={() => setShouldError(true)}
      >
        💥 Gerar Erro
      </Button>
    </div>
  );
}

// Main AI-First Patterns Example
export default function AIFirstPatternsExample() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          🤖 AI-First Component Patterns
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sistema completo de padrões AI-first para healthcare, incluindo 
          loading states inteligentes, visualização de confiança, tratamento 
          de erros, mudança de contexto e interação por voz.
        </p>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">🏥 Workflow Completo</TabsTrigger>
          <TabsTrigger value="components">🔧 Componentes</TabsTrigger>
          <TabsTrigger value="integration">🔗 Integração</TabsTrigger>
          <TabsTrigger value="documentation">📚 Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <AIFirstWorkflow />
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ComponentsShowcase />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <IntegrationExamples />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <ComponentDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Components showcase
function ComponentsShowcase() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🤖 AILoadingStates</CardTitle>
          <CardDescription>Loading states inteligentes com estimativa de tempo e confiança</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MedicalQueryLoading estimatedSeconds={3} showProgress />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 ConfidencePatterns</CardTitle>
          <CardDescription>Visualização consistente de confiança da IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DiagnosisConfidence score={92} variant="detailed" showDescription />
            <TreatmentConfidence score={85} variant="compact" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎤 VoiceInteractionUX</CardTitle>
          <CardDescription>Interação por voz otimizada para healthcare</CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceInteractionUX
            context={VoiceContext.GENERAL}
            mode={VoiceMode.PUSH_TO_TALK}
            showConfidence
            showTranscript
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Integration examples
function IntegrationExamples() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          <strong>Exemplos de Integração AI-First</strong> - Demonstra como todos os componentes
          trabalham juntos para criar uma experiência seamless.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Workflow de Consulta Médica</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>AILoadingStates:</strong> Mostra progresso durante análise do paciente</li>
            <li><strong>ConfidencePatterns:</strong> Visualiza confiança dos resultados da IA</li>
            <li><strong>ErrorBoundaryAI:</strong> Trata erros com recovery inteligente</li>
            <li><strong>ContextSwitching:</strong> Alterna entre IA e controle humano conforme necessário</li>
            <li><strong>VoiceInteractionUX:</strong> Permite documentação por voz durante a consulta</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// Component documentation
function ComponentDocumentation() {
  const components = [
    {
      name: "AILoadingStates",
      description: "Loading states inteligentes com estimativa de tempo",
      features: ["7 variantes healthcare", "Confidence estimation", "Portuguese messages", "Accessibility WCAG 2.1 AA+"]
    },
    {
      name: "ConfidencePatterns",
      description: "Visualização consistente de confiança da IA",
      features: ["9 categorias healthcare", "5 variants (compact/detailed/badge/etc)", "Multi-confidence support", "Trend analysis"]
    },
    {
      name: "ErrorBoundaryAI",
      description: "Tratamento de erros específico para IA",
      features: ["9 tipos de erro AI", "Recovery actions", "Medical impact assessment", "Fallback mechanisms"]
    },
    {
      name: "ContextSwitching",
      description: "Mudanças inteligentes de contexto",
      features: ["6 context types", "Transition rules", "Auto-switching", "Quick switcher"]
    },
    {
      name: "VoiceInteractionUX",
      description: "Interação por voz otimizada para healthcare",
      features: ["Portuguese optimization", "Medical vocabulary", "Voice commands", "LGPD compliance"]
    }
  ];

  return (
    <div className="space-y-6">
      {components.map(component => (
        <Card key={component.name}>
          <CardHeader>
            <CardTitle>{component.name}</CardTitle>
            <CardDescription>{component.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <strong className="text-sm">Principais Recursos:</strong>
              <ul className="text-sm space-y-1">
                {component.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}