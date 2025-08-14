'use client';

import React, { useState, useEffect } from 'react';
import { Search, Zap, BarChart3, Users, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedSearch } from './advanced-search';
import { QuickAccess } from './quick-access';
import { toast } from 'sonner';

interface SystemStats {
  totalPatients: number;
  searchesPerformed: number;
  averageSearchTime: number;
  favoritePatients: number;
  highRiskPatients: number;
  pendingVerifications: number;
  upcomingAppointments: number;
  systemPerformance: {
    responseTime: number;
    uptime: number;
    accuracy: number;
  };
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  gender: string;
  age: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastVisit: string;
  appointmentStatus: string;
  treatmentType: string;
  hasPhotos: boolean;
  consentStatus: boolean;
  tags: string[];
}

interface PatientSegment {
  id: string;
  name: string;
  description: string;
  patientCount: number;
  criteria: any;
  createdAt: string;
  createdBy: string;
}

interface SystemIntegrationProps {
  onPatientSelect?: (patient: Patient) => void;
  userRole?: 'admin' | 'manager' | 'staff';
}

export function SystemIntegration({ onPatientSelect, userRole = 'staff' }: SystemIntegrationProps) {
  const [activeTab, setActiveTab] = useState('quick-access');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');

  // Load system statistics
  const loadSystemStats = async () => {
    setIsLoadingStats(true);
    try {
      // Mock data - replace with actual API call
      const mockStats: SystemStats = {
        totalPatients: 1247,
        searchesPerformed: 3456,
        averageSearchTime: 245,
        favoritePatients: 89,
        highRiskPatients: 23,
        pendingVerifications: 12,
        upcomingAppointments: 156,
        systemPerformance: {
          responseTime: 180,
          uptime: 99.8,
          accuracy: 97.5
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      toast.error('Erro ao carregar estatísticas do sistema');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Create patient segment
  const createPatientSegment = async (patients: Patient[]) => {
    if (!segmentName.trim() || !segmentDescription.trim()) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    try {
      const criteria = {
        patientIds: patients.map(p => p.id),
        filters: {
          // Extract common characteristics
          riskLevels: [...new Set(patients.map(p => p.riskLevel))],
          treatmentTypes: [...new Set(patients.map(p => p.treatmentType))],
          ageRange: {
            min: Math.min(...patients.map(p => p.age)),
            max: Math.max(...patients.map(p => p.age))
          }
        }
      };

      const response = await fetch('/api/patients/integration/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: segmentName,
          description: segmentDescription,
          criteria
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Segmento "${segmentName}" criado com ${patients.length} pacientes`);
        setShowSegmentDialog(false);
        setSegmentName('');
        setSegmentDescription('');
        setSelectedPatients([]);
      } else {
        toast.error(result.error || 'Erro ao criar segmento');
      }
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Erro ao criar segmento de pacientes');
    }
  };

  // Handle patient selection for segment creation
  const handleCreateSegment = (patients: Patient[]) => {
    setSelectedPatients(patients);
    setShowSegmentDialog(true);
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getPerformanceColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Sistema de Integração</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          Versão 2.0 • Integração Completa
        </Badge>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : formatNumber(stats?.totalPatients || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema integrado completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buscas Realizadas</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : formatNumber(stats?.searchesPerformed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio: {stats?.averageSearchTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoadingStats ? '...' : formatNumber(stats?.highRiskPatients || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção especial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getPerformanceColor(stats?.systemPerformance.uptime || 0, { good: 99, warning: 95 })}>
                {stats?.systemPerformance.uptime || 0}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime do sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <span className={getPerformanceColor(stats.systemPerformance.responseTime, { good: 200, warning: 500 })}>
                    {stats.systemPerformance.responseTime}ms
                  </span>
                </div>
                <p className="text-sm text-gray-500">Tempo de Resposta</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <span className={getPerformanceColor(stats.systemPerformance.accuracy, { good: 95, warning: 90 })}>
                    {stats.systemPerformance.accuracy}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">Precisão da Busca</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.favoritePatients)}
                </div>
                <p className="text-sm text-gray-500">Pacientes Favoritos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Integration Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Interface de Integração</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-access" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Acesso Rápido</span>
              </TabsTrigger>
              <TabsTrigger value="advanced-search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Busca Avançada</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick-access" className="mt-6">
              <QuickAccess onPatientSelect={onPatientSelect} />
            </TabsContent>

            <TabsContent value="advanced-search" className="mt-6">
              <AdvancedSearch 
                onPatientSelect={onPatientSelect}
                onCreateSegment={userRole !== 'staff' ? handleCreateSegment : undefined}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Segment Creation Dialog */}
      {showSegmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Criar Segmento de Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Segmento</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Pacientes Alto Risco Cardíaco"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Descreva os critérios e objetivo deste segmento..."
                  rows={3}
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                />
              </div>
              
              <div className="text-sm text-gray-500">
                <strong>{selectedPatients.length}</strong> pacientes selecionados
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSegmentDialog(false);
                    setSegmentName('');
                    setSegmentDescription('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => createPatientSegment(selectedPatients)}
                  className="flex-1"
                  disabled={!segmentName.trim() || !segmentDescription.trim()}
                >
                  Criar Segmento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-blue-600">
            {formatNumber(stats?.pendingVerifications || 0)}
          </div>
          <div className="text-xs text-gray-500">Verificações Pendentes</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-green-600">
            {formatNumber(stats?.upcomingAppointments || 0)}
          </div>
          <div className="text-xs text-gray-500">Próximas Consultas</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-purple-600">
            {formatNumber(stats?.favoritePatients || 0)}
          </div>
          <div className="text-xs text-gray-500">Favoritos</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-orange-600">
            {stats?.averageSearchTime || 0}ms
          </div>
          <div className="text-xs text-gray-500">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
}