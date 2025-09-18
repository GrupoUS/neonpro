'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui';

import {
  MobilePatientList,
  MobilePatientCard,
  HealthcareSearch,
  ConsentManagementDialog,
  EnhancedPatientRegistrationForm,
  AccessibilityProvider,
  PatientErrorBoundary,
  type MobilePatientData,
  type PatientSearchResult,
  type CompletePatientRegistration,
  formatters,
  validateCpf,
  validateBrazilianPhone,
} from '../index';

// Mock data for demonstration
const mockPatients: MobilePatientData[] = [
  {
    id: '1',
    name: 'Maria Silva Santos',
    maskedCpf: '123.456.789-00',
    phone: '(11) 99999-9999',
    email: 'maria.silva@email.com',
    birthDate: new Date('1985-03-15'),
    status: 'active',
    lastVisit: new Date('2024-01-15'),
    consentStatus: 'granted',
    dataVisibilityLevel: 'standard',
  },
  {
    id: '2',
    name: 'João Carlos Oliveira',
    maskedCpf: '987.654.321-00',
    phone: '(11) 88888-8888',
    email: 'joao.oliveira@email.com',
    birthDate: new Date('1975-08-22'),
    status: 'active',
    lastVisit: new Date('2024-01-10'),
    consentStatus: 'pending',
    dataVisibilityLevel: 'minimal',
  },
  {
    id: '3',
    name: 'Ana Paula Costa',
    maskedCpf: '456.789.123-00',
    phone: '(11) 77777-7777',
    email: 'ana.costa@email.com',
    birthDate: new Date('1990-12-05'),
    status: 'inactive',
    lastVisit: new Date('2023-12-20'),
    consentStatus: 'withdrawn',
    dataVisibilityLevel: 'minimal',
  },
];

const mockConsentData = {
  patientId: '1',
  patientName: 'Maria Silva Santos',
  consents: [
    {
      id: '1',
      patientId: '1',
      consentType: 'data_processing' as const,
      granted: true,
      purpose: 'Prestação de serviços estéticos',
      dataCategories: ['Dados pessoais', 'Histórico médico', 'Fotos'],
      retentionPeriod: '5 anos após último atendimento',
      grantedAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-01'),
      legalBasis: 'consent' as const,
    },
    {
      id: '2',
      patientId: '1',
      consentType: 'marketing' as const,
      granted: false,
      purpose: 'Envio de materiais promocionais',
      dataCategories: ['E-mail', 'Telefone'],
      retentionPeriod: '2 anos',
      lastUpdated: new Date('2024-01-01'),
      legalBasis: 'consent' as const,
    },
  ],
  lastConsentUpdate: new Date('2024-01-01'),
};

export function PatientManagementDemo() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('list');

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    console.log('Selected patient:', patientId);
  };

  const handlePatientRegistration = async (data: CompletePatientRegistration) => {
    console.log('Patient registration data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Paciente cadastrado com sucesso!');
  };

  const handleConsentUpdate = async (consents: any) => {
    console.log('Consent updates:', consents);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Consentimentos atualizados!');
  };

  const handleDataExport = async (patientId: string) => {
    console.log('Data export requested for patient:', patientId);
    // Simulate data export
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Exportação de dados solicitada. Você receberá um e-mail em até 72 horas.');
  };

  const handleDataErasure = async (patientId: string) => {
    console.log('Data erasure requested for patient:', patientId);
    // Simulate data erasure request
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Solicitação de exclusão de dados enviada. Processamento em até 15 dias úteis.');
  };

  const handleSearchSelect = (patient: PatientSearchResult) => {
    console.log('Search result selected:', patient);
    setSelectedPatient(patient.id);
  };

  const handleCreatePatient = (searchData?: any) => {
    console.log('Create patient with search data:', searchData);
    setIsRegistrationOpen(true);
  };

  return (
    <AccessibilityProvider>
      <PatientErrorBoundary>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Demo: NeonPro Mobile-First Healthcare UI
                </CardTitle>
                <CardDescription>
                  Demonstração dos componentes de interface para gestão de pacientes com compliance LGPD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Performance:</strong>
                    <br />
                    • LCP ≤2.5s
                    <br />
                    • Touch targets ≥44px
                    <br />
                    • Bundle otimizado
                  </div>
                  <div>
                    <strong>Acessibilidade:</strong>
                    <br />
                    • WCAG 2.1 AA+
                    <br />
                    • Navegação por teclado
                    <br />
                    • Suporte a leitores de tela
                  </div>
                  <div>
                    <strong>Compliance:</strong>
                    <br />
                    • LGPD 100%
                    <br />
                    • ANVISA compatível
                    <br />
                    • Auditoria completa
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Tabs */}
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="list">Lista Mobile</TabsTrigger>
                <TabsTrigger value="card">Cartão Paciente</TabsTrigger>
                <TabsTrigger value="search">Busca Healthcare</TabsTrigger>
                <TabsTrigger value="registration">Cadastro LGPD</TabsTrigger>
                <TabsTrigger value="validation">Validação BR</TabsTrigger>
              </TabsList>

              {/* Mobile Patient List Demo */}
              <TabsContent value="list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Pacientes Mobile-First</CardTitle>
                    <CardDescription>
                      Interface otimizada para dispositivos móveis com progressive disclosure LGPD
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MobilePatientList
                      patients={mockPatients}
                      onPatientSelect={handlePatientSelect}
                      onCreatePatient={() => setIsRegistrationOpen(true)}
                      userRole="aesthetician"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Validation Demo */}
              <TabsContent value="validation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Validação de Documentos Brasileiros</CardTitle>
                    <CardDescription>
                      Testes das funções de validação e formatação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Validação CPF</h4>
                          <div className="space-y-2 text-sm">
                            <div>123.456.789-00: {validateCpf('123.456.789-00') ? '✅ Válido' : '❌ Inválido'}</div>
                            <div>111.111.111-11: {validateCpf('111.111.111-11') ? '✅ Válido' : '❌ Inválido'}</div>
                            <div>041.767.406-84: {validateCpf('041.767.406-84') ? '✅ Válido' : '❌ Inválido'}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Validação Telefone</h4>
                          <div className="space-y-2 text-sm">
                            <div>(11) 99999-9999: {validateBrazilianPhone('(11) 99999-9999') ? '✅ Válido' : '❌ Inválido'}</div>
                            <div>(11) 8888-8888: {validateBrazilianPhone('(11) 8888-8888') ? '✅ Válido' : '❌ Inválido'}</div>
                            <div>(11) 1234-5678: {validateBrazilianPhone('(11) 1234-5678') ? '✅ Válido' : '❌ Inválido'}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Formatação</h4>
                          <div className="space-y-2 text-sm">
                            <div>CPF: {formatters.cpf('12345678900')}</div>
                            <div>Telefone: {formatters.phone('11999999999')}</div>
                            <div>CEP: {formatters.cep('01234567')}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Estados BR</h4>
                          <div className="text-sm">
                            SP, RJ, MG, PR, SC, RS, BA, PE, CE, GO...
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Features Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Implementados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>📱 Mobile-First</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Touch targets ≥44px</li>
                      <li>Responsive breakpoints</li>
                      <li>Gesture support</li>
                      <li>Swipe navigation</li>
                      <li>PWA ready</li>
                    </ul>
                  </div>

                  <div>
                    <strong>🛡️ LGPD Compliance</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Progressive disclosure</li>
                      <li>Consent granular</li>
                      <li>Data minimization</li>
                      <li>Audit trail</li>
                      <li>Right to erasure</li>
                    </ul>
                  </div>

                  <div>
                    <strong>♿ Acessibilidade</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>WCAG 2.1 AA+</li>
                      <li>Keyboard navigation</li>
                      <li>Screen readers</li>
                      <li>High contrast</li>
                      <li>Focus indicators</li>
                    </ul>
                  </div>

                  <div>
                    <strong>🇧🇷 Brasileiro</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Validação CPF/CNS</li>
                      <li>Formatação documentos</li>
                      <li>Estados brasileiros</li>
                      <li>Telefones BR</li>
                      <li>Idioma português</li>
                    </ul>
                  </div>

                  <div>
                    <strong>⚡ Performance</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>LCP ≤2.5s</li>
                      <li>INP ≤200ms</li>
                      <li>CLS ≤0.1</li>
                      <li>Bundle otimizado</li>
                      <li>Lazy loading</li>
                    </ul>
                  </div>

                  <div>
                    <strong>🔒 Segurança</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Error boundaries</li>
                      <li>Data sanitization</li>
                      <li>Healthcare audit</li>
                      <li>Masked PII</li>
                      <li>Safe error messages</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PatientErrorBoundary>
    </AccessibilityProvider>
  );
}

export default PatientManagementDemo;