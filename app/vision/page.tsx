'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Camera, 
  BarChart3, 
  FileText, 
  Settings, 
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  Download,
  Share2,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';
import { cn } from '@/lib/utils';

interface SystemMetrics {
  totalAnalyses: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  successRate: number;
  activePatients: number;
  todayAnalyses: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  disabled?: boolean;
}

export default function VisionSystemPage() {
  const router = useRouter();
  const { analysisHistory, loadAnalysisHistory } = useVisionAnalysis();
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalAnalyses: 0,
    averageAccuracy: 0,
    averageProcessingTime: 0,
    successRate: 0,
    activePatients: 0,
    todayAnalyses: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Quick actions for the vision system
  const quickActions: QuickAction[] = [
    {
      id: 'new-analysis',
      title: 'Nova Análise',
      description: 'Iniciar análise antes/depois',
      icon: <Camera className="h-6 w-6" />,
      href: '/vision/analysis',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'view-reports',
      title: 'Relatórios',
      description: 'Visualizar análises anteriores',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/vision/reports',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'export-data',
      title: 'Exportar Dados',
      description: 'Exportar resultados em PDF/Excel',
      icon: <Download className="h-6 w-6" />,
      href: '/vision/export',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'system-settings',
      title: 'Configurações',
      description: 'Ajustar parâmetros do sistema',
      icon: <Settings className="h-6 w-6" />,
      href: '/vision/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Load system metrics on component mount
  useEffect(() => {
    const loadSystemMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call to get system metrics
        // In production, this would fetch from your analytics API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSystemMetrics({
          totalAnalyses: 1247,
          averageAccuracy: 0.967,
          averageProcessingTime: 18500, // ms
          successRate: 0.994,
          activePatients: 89,
          todayAnalyses: 23
        });
        
      } catch (error) {
        console.error('Failed to load system metrics:', error);
        toast.error('Falha ao carregar métricas do sistema');
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemMetrics();
  }, []);

  const handleQuickAction = (action: QuickAction) => {
    if (action.disabled) {
      toast.info(`${action.title} estará disponível em breve`);
      return;
    }
    
    router.push(action.href);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Sistema de Visão Computacional
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Análise automatizada de imagens médicas com ≥95% de precisão
            </p>
          </div>
        </div>
        
        {/* System Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sistema Operacional
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            VoidBeast V4.0 Enhanced
          </Badge>
        </div>
      </div>

      {/* System Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Precisão Média</p>
                <p className="text-3xl font-bold text-blue-900">
                  {isLoading ? '...' : `${(systemMetrics.averageAccuracy * 100).toFixed(1)}%`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Meta: ≥95%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Target className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Tempo Médio</p>
                <p className="text-3xl font-bold text-green-900">
                  {isLoading ? '...' : `${(systemMetrics.averageProcessingTime / 1000).toFixed(1)}s`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Meta: &lt;30s</span>
                </div>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-purple-900">
                  {isLoading ? '...' : `${(systemMetrics.successRate * 100).toFixed(1)}%`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600">Excelente</span>
                </div>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Total de Análises</p>
                <p className="text-3xl font-bold text-orange-900">
                  {isLoading ? '...' : systemMetrics.totalAnalyses.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-orange-600">+{systemMetrics.todayAnalyses} hoje</span>
                </div>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <Activity className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              onClick={() => handleQuickAction(action)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={cn(
                    "p-4 rounded-xl text-white transition-colors",
                    action.color
                  )}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Análise #{1000 + i} concluída</p>
                    <p className="text-xs text-gray-600">Paciente ID: PAT-{2024000 + i}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">97.{i}%</p>
                    <p className="text-xs text-gray-500">{15 + i}s</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/vision/analysis">
                <Button variant="outline" className="w-full">
                  Ver Todas as Análises
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Saúde do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performance da CPU</span>
                  <span className="font-medium">23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso de Memória</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Armazenamento</span>
                  <span className="font-medium">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conectividade API</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Todos os sistemas operacionais</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}