'use client';

/**
 * AI Chat Demo Component
 * 
 * Demonstration and testing component for AI chat features.
 * Shows all capabilities in a controlled environment.
 */

import React, { useState } from 'react';
import { EnhancedAIChat, ChatSession, PatientInfo, ProfessionalInfo } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Stethoscope, Brain, Settings, MessageSquare } from 'lucide-react';

export interface AIChatDemoProps {
  /** Show different demo scenarios */
  showScenarios?: boolean;
  /** Test mode */
  testMode?: boolean;
}

// Demo patient data
const demoPatients: PatientInfo[] = [
  {
    id: '1',
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    dateOfBirth: new Date('1980-05-15'),
    gender: 'Feminino',
    medicalConditions: ['Hipertensão', 'Diabetes Tipo 2'],
    allergies: ['Penicilina'],
    currentMedications: ['Losartana', 'Metformina'],
    lastVisitDate: new Date('2024-01-15'),
    notes: 'Paciente estável, needs acompanhamento regular',
  },
  {
    id: '2',
    name: 'João Santos',
    cpf: '987.654.321-00',
    dateOfBirth: new Date('1992-12-03'),
    gender: 'Masculino',
    medicalConditions: ['Asma'],
    allergies: [],
    currentMedications: ['Salbutamol'],
    lastVisitDate: new Date('2024-02-20'),
    notes: 'Crises asmáticas controladas',
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    cpf: '456.789.123-00',
    dateOfBirth: new Date('1975-08-22'),
    gender: 'Feminino',
    medicalConditions: [],
    allergies: ['Ibuprofeno'],
    currentMedications: [],
    lastVisitDate: new Date('2024-03-10'),
    notes: 'Check-up anual, paciente saudável',
  },
];

// Demo professional data
const demoProfessionals: ProfessionalInfo[] = [
  {
    id: '1',
    name: 'Dr. Carlos Mendes',
    specialty: 'Clínico Geral',
    crmNumber: '12345-SP',
    licenseNumber: '67890',
    department: 'Clínica Médica',
    contact: {
      email: 'carlos.mendes@neonpro.com.br',
      phone: '(11) 98765-4321',
      extension: '1234',
    },
  },
  {
    id: '2',
    name: 'Dra. Fernanda Lima',
    specialty: 'Dermatologia',
    crmNumber: '54321-SP',
    licenseNumber: '09876',
    department: 'Dermatologia',
    contact: {
      email: 'fernanda.lima@neonpro.com.br',
      phone: '(11) 91234-5678',
    },
  },
  {
    id: '3',
    name: 'Dr. Roberto Costa',
    specialty: 'Cardiologia',
    crmNumber: '67890-SP',
    licenseNumber: '13579',
    department: 'Cardiologia',
    contact: {
      email: 'roberto.costa@neonpro.com.br',
      phone: '(11) 99876-5432',
    },
  },
];

// Demo scenarios
const demoScenarios = [
  {
    id: 'general',
    name: 'Consulta Geral',
    description: 'Chat geral sem contexto específico',
    sessionType: 'general' as const,
    patientContext: undefined,
    professionalContext: undefined,
  },
  {
    id: 'client',
    name: 'Atendimento ao Cliente',
    description: 'Chat com contexto do paciente',
    sessionType: 'client' as const,
    patientContext: demoPatients[0],
    professionalContext: demoProfessionals[0],
  },
  {
    id: 'appointment',
    name: 'Agendamento',
    description: 'Chat focado em agendamento de consultas',
    sessionType: 'appointment' as const,
    patientContext: demoPatients[1],
    professionalContext: demoProfessionals[1],
  },
  {
    id: 'financial',
    name: 'Financeiro',
    description: 'Chat com questões financeiras',
    sessionType: 'financial' as const,
    patientContext: demoPatients[2],
    professionalContext: undefined,
  },
];

/**
 * AI Chat Demo Component
 */
export const AIChatDemo: React.FC<AIChatDemoProps> = ({
  showScenarios = true,
  testMode = false,
}) => {
  // State
  const [selectedScenario, setSelectedScenario] = useState('general');
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalInfo | undefined>();
  const [sessionType, setSessionType] = useState<'client' | 'financial' | 'appointment' | 'general'>('general');

  // Get current scenario
  const currentScenario = demoScenarios.find(s => s.id === selectedScenario) || demoScenarios[0];

  // Handle scenario change
  const handleScenarioChange = (scenarioId: string) => {
    const scenario = demoScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenarioId);
      setSelectedPatient(scenario.patientContext);
      setSelectedProfessional(scenario.professionalContext);
      setSessionType(scenario.sessionType);
    }
  };

  // Handle manual patient selection
  const handlePatientChange = (patientId: string) => {
    const patient = patientId === 'none' ? undefined : demoPatients.find(p => p.id === patientId);
    setSelectedPatient(patient);
  };

  // Handle manual professional selection
  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionalId === 'none' ? undefined : demoProfessionals.find(p => p.id === professionalId);
    setSelectedProfessional(professional);
  };

  // Handle session type change
  const handleSessionTypeChange = (type: string) => {
    setSessionType(type as any);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Chat Interface Demo
        </h1>
        <p className="text-muted-foreground">
          Demonstração completa da interface de chat com IA para o NeonPro
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline">
            <MessageSquare className="h-3 w-3 mr-1" />
            AI SDK v5
          </Badge>
          <Badge variant="outline">
            <Stethoscope className="h-3 w-3 mr-1" />
            Healthcare Optimized
          </Badge>
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            LGPD Compliant
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scenario Selection */}
              {showScenarios && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cenário</label>
                  <Select value={selectedScenario} onValueChange={handleScenarioChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoScenarios.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentScenario && (
                    <p className="text-xs text-muted-foreground">
                      {currentScenario.description}
                    </p>
                  )}
                </div>
              )}

              {/* Session Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Sessão</label>
                <Select value={sessionType} onValueChange={handleSessionTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="appointment">Agendamento</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente</label>
                <Select 
                  value={selectedPatient?.id || 'none'} 
                  onValueChange={handlePatientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum paciente</SelectItem>
                    {demoPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profissional</label>
                <Select 
                  value={selectedProfessional?.id || 'none'} 
                  onValueChange={handleProfessionalChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum profissional</SelectItem>
                    {demoProfessionals.map(professional => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recursos</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Voz (Português BR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Anexos de arquivos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Pesquisa em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Compliance LGPD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Acessibilidade WCAG</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Streaming em tempo real</span>
                  </div>
                </div>
              </div>

              {/* Test Mode Actions */}
              {testMode && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Testes</h4>
                  <Button variant="outline" size="sm" className="w-full">
                    Testar LGPD
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Testar Voz
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Testar Anexos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Context Info */}
          {(selectedPatient || selectedProfessional) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contexto Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {selectedPatient && (
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Paciente
                    </div>
                    <div className="text-muted-foreground">
                      {selectedPatient.name}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedPatient.cpf}
                    </div>
                    {selectedPatient.medicalConditions && selectedPatient.medicalConditions.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Condições:</span>
                        <span className="ml-1">{selectedPatient.medicalConditions.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedProfessional && (
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      Profissional
                    </div>
                    <div className="text-muted-foreground">
                      {selectedProfessional.name}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedProfessional.specialty}
                    </div>
                    <div className="text-muted-foreground">
                      CRM: {selectedProfessional.crmNumber}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Assistente NeonPro</span>
                  <Badge variant="outline">
                    {sessionType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPatient && (
                    <Badge variant="secondary">
                      <User className="h-3 w-3 mr-1" />
                      {selectedPatient.name}
                    </Badge>
                  )}
                  {selectedProfessional && (
                    <Badge variant="outline">
                      <Stethoscope className="h-3 w-3 mr-1" />
                      {selectedProfessional.specialty}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-80px)]">
              <EnhancedAIChat
                patientContext={selectedPatient}
                healthcareProfessional={selectedProfessional}
                sessionType={sessionType}
                defaultModel="gpt-4o"
                showModelSelection={true}
                showVoiceInput={true}
                showFileAttachment={true}
                showSearch={true}
                lgpdConsent={{
                  canStoreHistory: true,
                  dataRetentionDays: 30,
                  requiresExplicitConsent: false,
                }}
                mobileOptimized={true}
                maxHeight="600px"
                testId="demo-ai-chat"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos e Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">Recursos</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="integration">Integração</TabsTrigger>
              <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Core Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time streaming responses</li>
                    <li>• Multiple AI model support</li>
                    <li>• Voice input (Portuguese BR)</li>
                    <li>• File attachment capability</li>
                    <li>• Search across conversations</li>
                    <li>• Message threading</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Healthcare Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Patient context integration</li>
                    <li>• Professional context support</li>
                    <li>• Medical knowledge base</li>
                    <li>• Healthcare-optimized models</li>
                    <li>• Source citations</li>
                    <li>• Medical guideline access</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">LGPD Compliance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Explicit consent mechanisms</li>
                    <li>• Data retention policies</li>
                    <li>• Patient data anonymization</li>
                    <li>• Audit trail logging</li>
                    <li>• Right to deletion</li>
                    <li>• Purpose limitation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Data Security</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data storage</li>
                    <li>• Access controls</li>
                    <li>• Data masking</li>
                    <li>• Regular audits</li>
                    <li>• Compliance reporting</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="integration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Backend Integration</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• tRPC agent integration</li>
                    <li>• Knowledge base search</li>
                    <li>• RAG (Retrieval-Augmented Generation)</li>
                    <li>• Session management</li>
                    <li>• User authentication</li>
                    <li>• Real-time updates</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">AI Integration</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI SDK v5 integration</li>
                    <li>• Multiple model providers</li>
                    <li>• Streaming responses</li>
                    <li>• Tool calling support</li>
                    <li>• Function execution</li>
                    <li>• Context management</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accessibility" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">WCAG Compliance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Keyboard navigation</li>
                    <li>• Screen reader support</li>
                    <li>• High contrast mode</li>
                    <li>• Focus management</li>
                    <li>• ARIA labels</li>
                    <li>• Text alternatives</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Mobile Optimization</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Touch-friendly interface</li>
                    <li>• Responsive design</li>
                    <li>• Gesture support</li>
                    <li>• Voice input mobile</li>
                    <li>• Performance optimization</li>
                    <li>• Battery efficiency</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatDemo;