'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Info,
  Plus,
  Search,
  Settings,
  Shield,
  UserCheck,
  Users,
  XCircle,
  AlertCircle,
  Bell,
  Book,
  ChevronRight,
  Edit,
  Trash2,
  Archive,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types for consent management
interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  consentType: 'medical_procedure' | 'photography' | 'data_processing' | 'marketing' | 'research' | 'telemedicine' | 'minor_guardian';
  status: 'active' | 'withdrawn' | 'expired' | 'pending' | 'rejected';
  grantedDate: string;
  expiryDate: string;
  withdrawnDate?: string;
  legalBasis: 'consent' | 'legal_obligation' | 'vital_interests' | 'public_interest' | 'legitimate_interest';
  purpose: string;
  description: string;
  version: string;
  digitalSignature?: string;
  witnessSignature?: string;
  ipAddress?: string;
  userAgent?: string;
  isMinor: boolean;
  guardianInfo?: {
    name: string;
    relationship: string;
    signature: string;
  };
}

interface PatientRightsRequest {
  id: string;
  patientId: string;
  patientName: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedDate: string;
  description: string;
  response?: string;
  completedDate?: string;
  legalDeadline: string;
}

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: 'consent_granted' | 'consent_withdrawn' | 'consent_modified' | 'rights_request' | 'data_accessed' | 'data_exported';
  userId: string;
  userName: string;
  patientId: string;
  patientName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  legalBasis: string;
  dataCategories: string[];
}

// Mock data for consent management
const mockConsentRecords: ConsentRecord[] = [
  {
    id: 'consent-001',
    patientId: 'patient-001',
    patientName: 'Maria Silva Santos',
    consentType: 'medical_procedure',
    status: 'active',
    grantedDate: '2024-01-15T10:00:00Z',
    expiryDate: '2025-01-15T10:00:00Z',
    legalBasis: 'consent',
    purpose: 'Realização de procedimento estético de preenchimento facial',
    description: 'Consentimento para procedimento de preenchimento facial com ácido hialurônico',
    version: '2.1',
    digitalSignature: 'SHA256:a1b2c3d4...',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    isMinor: false,
  },
  {
    id: 'consent-002',
    patientId: 'patient-002',
    patientName: 'Ana Beatriz Costa',
    consentType: 'photography',
    status: 'active',
    grantedDate: '2024-01-20T14:30:00Z',
    expiryDate: '2025-01-20T14:30:00Z',
    legalBasis: 'consent',
    purpose: 'Documentação fotográfica para fins clínicos e educacionais',
    description: 'Autorização para captação e uso de imagens antes/depois do tratamento',
    version: '1.8',
    digitalSignature: 'SHA256:e5f6g7h8...',
    isMinor: false,
  },
  {
    id: 'consent-003',
    patientId: 'patient-003',
    patientName: 'João Pedro Oliveira',
    consentType: 'minor_guardian',
    status: 'active',
    grantedDate: '2024-02-01T09:15:00Z',
    expiryDate: '2026-02-01T09:15:00Z',
    legalBasis: 'consent',
    purpose: 'Tratamento dermatológico para menor de idade',
    description: 'Consentimento do responsável legal para tratamento de acne',
    version: '3.0',
    isMinor: true,
    guardianInfo: {
      name: 'Carlos Oliveira',
      relationship: 'Pai',
      signature: 'SHA256:i9j0k1l2...',
    },
  },
  {
    id: 'consent-004',
    patientId: 'patient-004',
    patientName: 'Beatriz Ferreira Lima',
    consentType: 'data_processing',
    status: 'expired',
    grantedDate: '2023-01-10T11:00:00Z',
    expiryDate: '2024-01-10T11:00:00Z',
    legalBasis: 'consent',
    purpose: 'Processamento de dados pessoais para fins de tratamento',
    description: 'Consentimento LGPD para processamento de dados de saúde',
    version: '1.5',
    isMinor: false,
  },
  {
    id: 'consent-005',
    patientId: 'patient-005',
    patientName: 'Roberto Santos Silva',
    consentType: 'marketing',
    status: 'withdrawn',
    grantedDate: '2024-01-05T16:20:00Z',
    expiryDate: '2025-01-05T16:20:00Z',
    withdrawnDate: '2024-02-15T10:30:00Z',
    legalBasis: 'consent',
    purpose: 'Comunicações de marketing e promoções',
    description: 'Autorização para envio de materiais promocionais',
    version: '1.2',
    isMinor: false,
  },
];

const mockRightsRequests: PatientRightsRequest[] = [
  {
    id: 'request-001',
    patientId: 'patient-006',
    patientName: 'Carla Mendes Rodrigues',
    requestType: 'access',
    status: 'pending',
    submittedDate: '2024-02-20T14:00:00Z',
    legalDeadline: '2024-03-05T23:59:59Z',
    description: 'Solicitação de acesso a todos os dados pessoais processados pela clínica',
  },
  {
    id: 'request-002',
    patientId: 'patient-007',
    patientName: 'Felipe Souza Lima',
    requestType: 'erasure',
    status: 'in_progress',
    submittedDate: '2024-02-18T10:30:00Z',
    legalDeadline: '2024-03-03T23:59:59Z',
    description: 'Solicitação de exclusão de todos os dados pessoais após encerramento do tratamento',
    response: 'Análise em andamento. Verificando dependências legais.',
  },
  {
    id: 'request-003',
    patientId: 'patient-008',
    patientName: 'Juliana Costa Alves',
    requestType: 'portability',
    status: 'completed',
    submittedDate: '2024-02-10T16:45:00Z',
    legalDeadline: '2024-02-25T23:59:59Z',
    completedDate: '2024-02-22T11:20:00Z',
    description: 'Solicitação de portabilidade de dados para nova clínica',
    response: 'Dados exportados e enviados conforme solicitado. Processo concluído.',
  },
];

const mockAuditTrail: AuditTrailEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2024-02-22T15:30:00Z',
    action: 'consent_granted',
    userId: 'user-001',
    userName: 'Dr. Maria Santos',
    patientId: 'patient-009',
    patientName: 'Lucas Andrade Silva',
    details: 'Consentimento para procedimento de botox concedido',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    legalBasis: 'consent',
    dataCategories: ['dados_saude', 'dados_pessoais'],
  },
  {
    id: 'audit-002',
    timestamp: '2024-02-22T14:15:00Z',
    action: 'consent_withdrawn',
    userId: 'patient-005',
    userName: 'Roberto Santos Silva',
    patientId: 'patient-005',
    patientName: 'Roberto Santos Silva',
    details: 'Consentimento de marketing retirado pelo próprio paciente',
    ipAddress: '201.45.67.89',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X)',
    legalBasis: 'consent',
    dataCategories: ['dados_marketing'],
  },
  {
    id: 'audit-003',
    timestamp: '2024-02-22T13:00:00Z',
    action: 'rights_request',
    userId: 'patient-006',
    userName: 'Carla Mendes Rodrigues',
    patientId: 'patient-006',
    patientName: 'Carla Mendes Rodrigues',
    details: 'Solicitação de acesso aos dados pessoais submetida',
    ipAddress: '179.123.45.67',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    legalBasis: 'legitimate_interest',
    dataCategories: ['dados_pessoais', 'dados_saude'],
  },
];

export default function ConsentManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter functions
  const filteredConsents = mockConsentRecords.filter((consent) => {
    const matchesSearch = consent.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consent.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || consent.status === filterStatus;
    const matchesType = filterType === 'all' || consent.consentType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredRightsRequests = mockRightsRequests.filter((request) => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredAuditTrail = mockAuditTrail.filter((entry) => {
    const matchesSearch = entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Utility functions
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'withdrawn': return 'destructive';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      expired: 'Expirado',
      withdrawn: 'Retirado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getConsentTypeLabel = (type: string) => {
    const labels = {
      medical_procedure: 'Procedimento Médico',
      photography: 'Documentação Fotográfica',
      data_processing: 'Processamento de Dados',
      marketing: 'Marketing',
      research: 'Pesquisa',
      telemedicine: 'Telemedicina',
      minor_guardian: 'Responsável Legal',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRightsRequestTypeLabel = (type: string) => {
    const labels = {
      access: 'Acesso aos Dados',
      rectification: 'Retificação',
      erasure: 'Exclusão',
      portability: 'Portabilidade',
      restriction: 'Restrição',
      objection: 'Oposição',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const calculateDaysToExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Dashboard statistics
  const stats = {
    totalConsents: mockConsentRecords.length,
    activeConsents: mockConsentRecords.filter(c => c.status === 'active').length,
    expiringSoon: mockConsentRecords.filter(c => {
      const daysToExpiry = calculateDaysToExpiry(c.expiryDate);
      return c.status === 'active' && daysToExpiry <= 30 && daysToExpiry > 0;
    }).length,
    pendingRequests: mockRightsRequests.filter(r => r.status === 'pending').length,
    withdrawnConsents: mockConsentRecords.filter(c => c.status === 'withdrawn').length,
    expiredConsents: mockConsentRecords.filter(c => c.status === 'expired').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8" role="banner">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"
              role="img"
              aria-label="Ícone de gestão de consentimentos"
            >
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Consentimentos</h1>
              <p className="text-gray-600" id="page-description">
                Sistema completo de gestão de consentimentos LGPD e direitos dos pacientes
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <section 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            role="region"
            aria-labelledby="stats-heading"
          >
            <h2 id="stats-heading" className="sr-only">Estatísticas de Consentimentos</h2>
            <Card role="article" aria-labelledby="total-consents">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="total-consents">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900" aria-describedby="total-consents">
                  {stats.totalConsents}
                </p>
              </CardContent>
            </Card>
            <Card role="article" aria-labelledby="active-consents">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="active-consents">Ativos</span>
                </div>
                <p className="text-2xl font-bold text-green-600" aria-describedby="active-consents">
                  {stats.activeConsents}
                </p>
              </CardContent>
            </Card>
            <Card role="article" aria-labelledby="expiring-consents">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="expiring-consents">Expirando</span>
                </div>
                <p className="text-2xl font-bold text-orange-600" aria-describedby="expiring-consents">
                  {stats.expiringSoon}
                </p>
              </CardContent>
            </Card>
            <Card role="article" aria-labelledby="pending-requests">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="pending-requests">Pendentes</span>
                </div>
                <p className="text-2xl font-bold text-blue-600" aria-describedby="pending-requests">
                  {stats.pendingRequests}
                </p>
              </CardContent>
            </Card>
            <Card role="article" aria-labelledby="withdrawn-consents">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="withdrawn-consents">Retirados</span>
                </div>
                <p className="text-2xl font-bold text-red-600" aria-describedby="withdrawn-consents">
                  {stats.withdrawnConsents}
                </p>
              </CardContent>
            </Card>
            <Card role="article" aria-labelledby="expired-consents">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-600" id="expired-consents">Expirados</span>
                </div>
                <p className="text-2xl font-bold text-gray-600" aria-describedby="expired-consents">
                  {stats.expiredConsents}
                </p>
              </CardContent>
            </Card>
        </section>
        </header>

        {/* Main Content */}
        <main role="main" aria-describedby="page-description">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="space-y-6"
            aria-label="Seções do sistema de consentimentos"
          >
            <TabsList 
              className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5"
              role="tablist"
              aria-label="Navegação principal do sistema de consentimentos"
            >
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2"
                role="tab"
                aria-controls="dashboard-panel"
                aria-selected={activeTab === 'dashboard'}
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sr-only sm:hidden">Painel de controle</span>
              </TabsTrigger>
              <TabsTrigger 
                value="forms" 
                className="flex items-center gap-2"
                role="tab"
                aria-controls="forms-panel"
                aria-selected={activeTab === 'forms'}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Formulários</span>
                <span className="sr-only sm:hidden">Formulários de consentimento</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rights" 
                className="flex items-center gap-2"
                role="tab"
                aria-controls="rights-panel"
                aria-selected={activeTab === 'rights'}
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Direitos</span>
                <span className="sr-only sm:hidden">Direitos dos pacientes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="flex items-center gap-2"
                role="tab"
                aria-controls="audit-panel"
                aria-selected={activeTab === 'audit'}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Auditoria</span>
                <span className="sr-only sm:hidden">Trilha de auditoria</span>
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="flex items-center gap-2"
                role="tab"
                aria-controls="admin-panel"
                aria-selected={activeTab === 'admin'}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Admin</span>
                <span className="sr-only sm:hidden">Administração</span>
              </TabsTrigger>
            </TabsList>

          {/* Dashboard Tab */}
          <TabsContent 
            value="dashboard" 
            className="space-y-6"
            role="tabpanel"
            id="dashboard-panel"
            aria-labelledby="dashboard-tab"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Consents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Consentimentos Ativos
                  </CardTitle>
                  <CardDescription>
                    Consentimentos atualmente válidos e em vigor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockConsentRecords
                      .filter(c => c.status === 'active')
                      .slice(0, 5)
                      .map((consent) => (
                        <div key={consent.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{consent.patientName}</p>
                            <p className="text-sm text-gray-600">{getConsentTypeLabel(consent.consentType)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {calculateDaysToExpiry(consent.expiryDate)} dias
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Soon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Expirando em Breve
                  </CardTitle>
                  <CardDescription>
                    Consentimentos que expiram nos próximos 30 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockConsentRecords
                      .filter(c => {
                        const daysToExpiry = calculateDaysToExpiry(c.expiryDate);
                        return c.status === 'active' && daysToExpiry <= 30 && daysToExpiry > 0;
                      })
                      .slice(0, 5)
                      .map((consent) => {
                        const daysToExpiry = calculateDaysToExpiry(consent.expiryDate);
                        return (
                          <div key={consent.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{consent.patientName}</p>
                              <p className="text-sm text-gray-600">{getConsentTypeLabel(consent.consentType)}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="border-orange-200 text-orange-800">
                                {daysToExpiry} dias
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    {stats.expiringSoon === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Nenhum consentimento expirando em breve
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Atividades Recentes
                </CardTitle>
                <CardDescription>
                  Últimas ações relacionadas a consentimentos e direitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAuditTrail.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {entry.action === 'consent_granted' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {entry.action === 'consent_withdrawn' && <XCircle className="h-5 w-5 text-red-600" />}
                        {entry.action === 'rights_request' && <Users className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.details}</p>
                        <p className="text-sm text-gray-600">
                          {entry.patientName} • {new Date(entry.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent 
            value="forms" 
            className="space-y-6"
            role="tabpanel"
            id="forms-panel"
            aria-labelledby="forms-tab"
          >
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <form role="search" aria-label="Filtros de consentimentos">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="consent-search" className="sr-only">
                        Buscar consentimentos
                      </Label>
                      <div className="relative">
                        <Search 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                          aria-hidden="true"
                        />
                        <Input
                          id="consent-search"
                          placeholder="Buscar por paciente ou procedimento..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          aria-describedby="search-help"
                        />
                        <div id="search-help" className="sr-only">
                          Digite o nome do paciente ou descrição do procedimento para filtrar os consentimentos
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status-filter" className="sr-only">
                        Filtrar por status
                      </Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger 
                          className="w-full sm:w-48"
                          id="status-filter"
                          aria-label="Filtrar consentimentos por status"
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
                          <SelectItem value="withdrawn">Retirado</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type-filter" className="sr-only">
                        Filtrar por tipo
                      </Label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger 
                          className="w-full sm:w-48"
                          id="type-filter"
                          aria-label="Filtrar consentimentos por tipo"
                        >
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="medical_procedure">Procedimento Médico</SelectItem>
                          <SelectItem value="photography">Documentação Fotográfica</SelectItem>
                          <SelectItem value="data_processing">Processamento de Dados</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="research">Pesquisa</SelectItem>
                          <SelectItem value="telemedicine">Telemedicina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="whitespace-nowrap"
                      aria-label="Criar novo formulário de consentimento"
                    >
                      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                      Novo Consentimento
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Consents Table */}
            <Card>
              <CardHeader>
                <CardTitle>Consentimentos Registrados</CardTitle>
                <CardDescription>
                  Lista completa de consentimentos com status e detalhes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table role="table" aria-label="Tabela de consentimentos registrados">
                    <TableHeader>
                      <TableRow role="row">
                        <TableHead scope="col">Paciente</TableHead>
                        <TableHead scope="col">Tipo</TableHead>
                        <TableHead scope="col">Status</TableHead>
                        <TableHead scope="col">Data Concessão</TableHead>
                        <TableHead scope="col">Validade</TableHead>
                        <TableHead scope="col">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody role="rowgroup">
                      {filteredConsents.map((consent) => (
                        <TableRow 
                          key={consent.id} 
                          role="row"
                          aria-describedby={`consent-${consent.id}-description`}
                        >
                          <TableCell role="cell">
                            <div>
                              <p className="font-medium">{consent.patientName}</p>
                              <p 
                                className="text-sm text-gray-600"
                                id={`consent-${consent.id}-description`}
                              >
                                {consent.purpose}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getConsentTypeLabel(consent.consentType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(consent.status)}>
                              {getStatusLabel(consent.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(consent.grantedDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{new Date(consent.expiryDate).toLocaleDateString('pt-BR')}</p>
                              {consent.status === 'active' && (
                                <p className="text-sm text-gray-600">
                                  {calculateDaysToExpiry(consent.expiryDate)} dias restantes
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell role="cell">
                            <div className="flex items-center gap-2" role="group" aria-label="Ações do consentimento">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedConsent(consent)}
                                aria-label={`Visualizar detalhes do consentimento de ${consent.patientName}`}
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Visualizar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                aria-label={`Baixar PDF do consentimento de ${consent.patientName}`}
                              >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Baixar PDF</span>
                              </Button>
                              {consent.status === 'active' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  aria-label={`Editar consentimento de ${consent.patientName}`}
                                >
                                  <Edit className="h-4 w-4" aria-hidden="true" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rights Tab */}
          <TabsContent 
            value="rights" 
            className="space-y-6"
            role="tabpanel"
            id="rights-panel"
            aria-labelledby="rights-tab"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Direitos LGPD
                    </CardTitle>
                    <CardDescription>
                      Ações rápidas para direitos dos titulares
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      Solicitar Acesso aos Dados
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Solicitar Retificação
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Solicitar Exclusão
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Solicitar Portabilidade
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Archive className="h-4 w-4 mr-2" />
                      Solicitar Restrição
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <XCircle className="h-4 w-4 mr-2" />
                      Solicitar Oposição
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Rights Requests */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitações de Direitos</CardTitle>
                    <CardDescription>
                      Histórico de solicitações dos titulares de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredRightsRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                              <p className="text-sm text-gray-600">{getRightsRequestTypeLabel(request.requestType)}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Submetido: {new Date(request.submittedDate).toLocaleDateString('pt-BR')}</span>
                            <span>Prazo: {new Date(request.legalDeadline).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {request.response && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{request.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent 
            value="audit" 
            className="space-y-6"
            role="tabpanel"
            id="audit-panel"
            aria-labelledby="audit-tab"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Trilha de Auditoria
                </CardTitle>
                <CardDescription>
                  Registro completo de todas as ações relacionadas a consentimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAuditTrail.map((entry) => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {entry.action === 'consent_granted' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {entry.action === 'consent_withdrawn' && <XCircle className="h-5 w-5 text-red-600" />}
                          {entry.action === 'consent_modified' && <Edit className="h-5 w-5 text-blue-600" />}
                          {entry.action === 'rights_request' && <Users className="h-5 w-5 text-purple-600" />}
                          {entry.action === 'data_accessed' && <Eye className="h-5 w-5 text-orange-600" />}
                          {entry.action === 'data_exported' && <Download className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{entry.details}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Usuário:</strong> {entry.userName}</p>
                              <p><strong>Paciente:</strong> {entry.patientName}</p>
                            </div>
                            <div>
                              <p><strong>IP:</strong> {entry.ipAddress}</p>
                              <p><strong>Base Legal:</strong> {entry.legalBasis}</p>
                            </div>
                          </div>
                          {entry.dataCategories && entry.dataCategories.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-1"><strong>Categorias de Dados:</strong></p>
                              <div className="flex flex-wrap gap-1">
                                {entry.dataCategories.map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent 
            value="admin" 
            className="space-y-6"
            role="tabpanel"
            id="admin-panel"
            aria-labelledby="admin-tab"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Templates Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Modelos de Consentimento
                  </CardTitle>
                  <CardDescription>
                    Gerenciar templates de formulários de consentimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">Procedimento Estético v2.1</p>
                      <p className="text-sm text-gray-600">Última atualização: 15/01/2024</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">Documentação Fotográfica v1.8</p>
                      <p className="text-sm text-gray-600">Última atualização: 10/01/2024</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processamento LGPD v1.5</p>
                      <p className="text-sm text-gray-600">Última atualização: 05/01/2024</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Monitoramento de Compliance
                  </CardTitle>
                  <CardDescription>
                    Status de conformidade LGPD e regulamentações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Consentimentos LGPD</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">Conforme</Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                    <p className="text-xs text-gray-600">95% dos consentimentos em conformidade</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CFM 2.314/2022</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">Conforme</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-gray-600">Telemedicina em total conformidade</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ANVISA</span>
                      <Badge variant="outline" className="border-orange-200 text-orange-800">Revisão</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-gray-600">2 pontos requerem atenção</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações gerais do sistema de consentimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notificações</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="expiry-notifications">Notificações de expiração</Label>
                        <Checkbox id="expiry-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="withdrawal-notifications">Notificações de retirada</Label>
                        <Checkbox id="withdrawal-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rights-notifications">Solicitações de direitos</Label>
                        <Checkbox id="rights-notifications" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Retenção de Dados</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="consent-retention">Período de retenção de consentimentos</Label>
                        <Select defaultValue="5-years">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-year">1 ano</SelectItem>
                            <SelectItem value="3-years">3 anos</SelectItem>
                            <SelectItem value="5-years">5 anos</SelectItem>
                            <SelectItem value="permanent">Permanente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="audit-retention">Período de retenção de auditoria</Label>
                        <Select defaultValue="10-years">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5-years">5 anos</SelectItem>
                            <SelectItem value="10-years">10 anos</SelectItem>
                            <SelectItem value="permanent">Permanente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Consent Details Modal */}
        <Dialog 
          open={!!selectedConsent} 
          onOpenChange={() => setSelectedConsent(null)}
          aria-labelledby="consent-details-title"
          aria-describedby="consent-details-description"
        >
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {selectedConsent && (
              <>
                <DialogHeader>
                  <DialogTitle 
                    id="consent-details-title"
                    className="flex items-center gap-2"
                  >
                    <FileCheck className="h-5 w-5" aria-hidden="true" />
                    Detalhes do Consentimento
                  </DialogTitle>
                  <DialogDescription id="consent-details-description">
                    Informações completas sobre o consentimento selecionado
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Patient Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Paciente</Label>
                      <p className="text-lg font-medium">{selectedConsent.patientName}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(selectedConsent.status)}>
                          {getStatusLabel(selectedConsent.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Consent Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Consentimento</Label>
                      <p className="font-medium">{getConsentTypeLabel(selectedConsent.consentType)}</p>
                    </div>
                    <div>
                      <Label>Base Legal</Label>
                      <p className="font-medium">{selectedConsent.legalBasis}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Finalidade</Label>
                    <p className="font-medium">{selectedConsent.purpose}</p>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <p className="text-gray-700">{selectedConsent.description}</p>
                  </div>

                  <Separator />

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Data de Concessão</Label>
                      <p className="font-medium">{new Date(selectedConsent.grantedDate).toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <Label>Data de Expiração</Label>
                      <p className="font-medium">{new Date(selectedConsent.expiryDate).toLocaleString('pt-BR')}</p>
                    </div>
                    {selectedConsent.withdrawnDate && (
                      <div>
                        <Label>Data de Retirada</Label>
                        <p className="font-medium text-red-600">{new Date(selectedConsent.withdrawnDate).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Versão do Formulário</Label>
                      <p className="font-medium">{selectedConsent.version}</p>
                    </div>
                    <div>
                      <Label>Assinatura Digital</Label>
                      <p className="font-mono text-sm">{selectedConsent.digitalSignature}</p>
                    </div>
                  </div>

                  {selectedConsent.isMinor && selectedConsent.guardianInfo && (
                    <>
                      <Separator />
                      <div>
                        <Label>Informações do Responsável Legal</Label>
                        <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Nome do Responsável</Label>
                              <p className="font-medium">{selectedConsent.guardianInfo.name}</p>
                            </div>
                            <div>
                              <Label>Relacionamento</Label>
                              <p className="font-medium">{selectedConsent.guardianInfo.relationship}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                    {selectedConsent.status === 'active' && (
                      <Button variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Retirar Consentimento
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </div>
  );
}