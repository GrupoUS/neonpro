// ============================================================================
// Supplier Detail View Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier detail view with performance metrics, analytics,
// procurement history, quality tracking, and management features
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  DollarSign,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Upload,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  ExternalLink,
  Copy,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

import {
  Supplier,
  SupplierStatus,
  SupplierCategory,
  PaymentTerms,
  RiskLevel,
  PerformanceMetrics,
  QualityMetrics,
  ProcurementHistory,
  Contract,
  Communication
} from '@/lib/types/supplier';
import { 
  useSuppliers,
  useSupplierPerformance,
  useSupplierProcurement,
  useSupplierQuality,
  useSupplierContracts,
  useSupplierCommunications
} from '@/lib/hooks/use-supplier';
import { SupplierForm } from './supplier-form';
import { cn, formatCurrency, formatDate, formatPercentage } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SupplierDetailProps {
  supplierId: string;
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

interface PerformanceChartProps {
  data: PerformanceMetrics[];
  type: 'line' | 'bar' | 'pie';
  title: string;
  height?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: SupplierStatus): string => {
  switch (status) {
    case SupplierStatus.ACTIVE:
      return 'bg-green-100 text-green-800 border-green-200';
    case SupplierStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case SupplierStatus.PENDING_VERIFICATION:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case SupplierStatus.SUSPENDED:
      return 'bg-red-100 text-red-800 border-red-200';
    case SupplierStatus.BLACKLISTED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case RiskLevel.LOW:
      return 'text-green-600';
    case RiskLevel.MEDIUM:
      return 'text-yellow-600';
    case RiskLevel.HIGH:
      return 'text-red-600';
    case RiskLevel.CRITICAL:
      return 'text-red-800';
    default:
      return 'text-gray-600';
  }
};

const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const formatScore = (score: number): string => {
  return `${score.toFixed(1)}%`;
};

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'default'
}) => {
  const colorClasses = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  };

  const trendIcon = trend === 'up' ? 
    <TrendingUp className="h-4 w-4 text-green-600" /> : 
    trend === 'down' ? 
    <TrendingDown className="h-4 w-4 text-red-600" /> : 
    null;

  return (
    <Card className={cn('transition-all hover:shadow-md', colorClasses[color])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          {trendValue && trendIcon && (
            <div className="flex items-center space-x-1">
              {trendIcon}
              <span className={cn(
                'text-sm font-medium',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SupplierDetail({
  supplierId,
  clinicId,
  open,
  onOpenChange,
  onEdit,
  onDelete
}: SupplierDetailProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState('overview');
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');

  // Data hooks
  const { 
    supplier, 
    deleteSupplier, 
    isLoading: isLoadingSupplier 
  } = useSuppliers(clinicId);
  
  const { 
    performanceData, 
    performanceStats,
    isLoading: isLoadingPerformance 
  } = useSupplierPerformance(clinicId, supplierId, selectedTimeRange);
  
  const { 
    procurementHistory, 
    procurementStats,
    isLoading: isLoadingProcurement 
  } = useSupplierProcurement(clinicId, supplierId, selectedTimeRange);
  
  const { 
    qualityData, 
    qualityStats,
    isLoading: isLoadingQuality 
  } = useSupplierQuality(clinicId, supplierId, selectedTimeRange);
  
  const { 
    contracts, 
    activeContracts,
    isLoading: isLoadingContracts 
  } = useSupplierContracts(clinicId, supplierId);
  
  const { 
    communications, 
    recentCommunications,
    isLoading: isLoadingCommunications 
  } = useSupplierCommunications(clinicId, supplierId);

  // Get current supplier data
  const currentSupplier = supplier?.find(s => s.id === supplierId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isLoading = isLoadingSupplier || isLoadingPerformance || 
                   isLoadingProcurement || isLoadingQuality || 
                   isLoadingContracts || isLoadingCommunications;

  const overallPerformance = currentSupplier ? 
    (currentSupplier.performance_score + 
     currentSupplier.quality_rating + 
     currentSupplier.reliability_score + 
     currentSupplier.cost_competitiveness) / 4 : 0;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleEdit = () => {
    if (currentSupplier && onEdit) {
      onEdit(currentSupplier);
    }
    setEditFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentSupplier) return;

    try {
      await deleteSupplier(currentSupplier.id);
      toast.success('Fornecedor excluído com sucesso');
      onOpenChange(false);
      onDelete?.(currentSupplier);
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error('Erro ao excluir fornecedor');
    }
  };

  const handleExport = () => {
    // Implementation for exporting supplier data
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(supplierId);
    toast.success('ID copiado para a área de transferência');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => {
    if (!currentSupplier) return null;

    return (
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={currentSupplier.logo_url} />
            <AvatarFallback className="text-lg font-semibold">
              {currentSupplier.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSupplier.name}
              </h1>
              <Badge className={getStatusColor(currentSupplier.status)}>
                {currentSupplier.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-1">{currentSupplier.legal_name}</p>
            <p className="text-sm text-gray-500">
              {currentSupplier.category.replace('_', ' ').toLowerCase()}
            </p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              {currentSupplier.cnpj && (
                <span>CNPJ: {currentSupplier.cnpj}</span>
              )}
              {currentSupplier.primary_contact?.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{currentSupplier.primary_contact.email}</span>
                </div>
              )}
              {currentSupplier.website && (
                <div className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={currentSupplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Website
                    <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyId}>
            <Copy className="h-4 w-4 mr-2" />
            ID
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => {
    if (!currentSupplier) return null;

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Performance Geral"
            value={formatScore(overallPerformance)}
            icon={<TrendingUp className="h-5 w-5" />}
            color={overallPerformance >= 80 ? 'success' : 
                   overallPerformance >= 60 ? 'warning' : 'danger'}
          />
          
          <MetricCard
            title="Qualidade"
            value={formatScore(currentSupplier.quality_rating)}
            icon={<Star className="h-5 w-5" />}
            color={currentSupplier.quality_rating >= 80 ? 'success' : 
                   currentSupplier.quality_rating >= 60 ? 'warning' : 'danger'}
          />
          
          <MetricCard
            title="Confiabilidade"
            value={formatScore(currentSupplier.reliability_score)}
            icon={<Shield className="h-5 w-5" />}
            color={currentSupplier.reliability_score >= 80 ? 'success' : 
                   currentSupplier.reliability_score >= 60 ? 'warning' : 'danger'}
          />
          
          <MetricCard
            title="Competitividade"
            value={formatScore(currentSupplier.cost_competitiveness)}
            icon={<DollarSign className="h-5 w-5" />}
            color={currentSupplier.cost_competitiveness >= 80 ? 'success' : 
                   currentSupplier.cost_competitiveness >= 60 ? 'warning' : 'danger'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Categoria</p>
                  <p className="font-medium">
                    {currentSupplier.category.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Nível de Risco</p>
                  <p className={cn('font-medium', getRiskLevelColor(currentSupplier.risk_level))}>
                    {currentSupplier.risk_level}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Prazo de Pagamento</p>
                  <p className="font-medium">
                    {currentSupplier.payment_terms.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Moeda</p>
                  <p className="font-medium">{currentSupplier.currency}</p>
                </div>
              </div>

              {currentSupplier.tags && currentSupplier.tags.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSupplier.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Contato Principal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSupplier.primary_contact && (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{currentSupplier.primary_contact.name}</p>
                    {currentSupplier.primary_contact.title && (
                      <p className="text-sm text-gray-600">{currentSupplier.primary_contact.title}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{currentSupplier.primary_contact.email}</span>
                    </div>
                    
                    {currentSupplier.primary_contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{currentSupplier.primary_contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {currentSupplier.secondary_contacts && currentSupplier.secondary_contacts.length > 0 && (
                <div>
                  <Separator className="my-3" />
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Contatos Secundários ({currentSupplier.secondary_contacts.length})
                  </p>
                  <div className="space-y-2">
                    {currentSupplier.secondary_contacts.slice(0, 2).map((contact, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-gray-600">{contact.email}</p>
                      </div>
                    ))}
                    {currentSupplier.secondary_contacts.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{currentSupplier.secondary_contacts.length - 2} contatos adicionais
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Endereço</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSupplier.address && (
                <div className="text-sm space-y-1">
                  <p>
                    {currentSupplier.address.street}, {currentSupplier.address.number}
                    {currentSupplier.address.complement && `, ${currentSupplier.address.complement}`}
                  </p>
                  <p>{currentSupplier.address.neighborhood}</p>
                  <p>
                    {currentSupplier.address.city} - {currentSupplier.address.state}
                  </p>
                  <p>{currentSupplier.address.postal_code}</p>
                  <p>{currentSupplier.address.country}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {currentSupplier.regulatory_compliance ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">
                  {currentSupplier.regulatory_compliance 
                    ? 'Em conformidade regulatória' 
                    : 'Não conforme'
                  }
                </span>
              </div>

              {currentSupplier.anvisa_registration && (
                <div>
                  <p className="text-gray-600 text-sm">Registro ANVISA</p>
                  <p className="font-medium">{currentSupplier.anvisa_registration}</p>
                </div>
              )}

              {currentSupplier.certifications && currentSupplier.certifications.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">
                    Certificações ({currentSupplier.certifications.length})
                  </p>
                  <div className="space-y-2">
                    {currentSupplier.certifications.slice(0, 3).map((cert, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{cert.name}</span>
                        <Badge 
                          variant={cert.verification_status === 'verified' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {cert.verification_status}
                        </Badge>
                      </div>
                    ))}
                    {currentSupplier.certifications.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{currentSupplier.certifications.length - 3} certificações adicionais
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {currentSupplier.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Observações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {currentSupplier.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Análise de Performance</h3>
        <div className="flex space-x-2">
          <Button
            variant={selectedTimeRange === '1month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('1month')}
          >
            1 Mês
          </Button>
          <Button
            variant={selectedTimeRange === '3months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('3months')}
          >
            3 Meses
          </Button>
          <Button
            variant={selectedTimeRange === '6months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('6months')}
          >
            6 Meses
          </Button>
          <Button
            variant={selectedTimeRange === '1year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('1year')}
          >
            1 Ano
          </Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      {performanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Entregas no Prazo"
            value={formatPercentage(performanceStats.on_time_delivery_rate)}
            icon={<Clock className="h-5 w-5" />}
            color={performanceStats.on_time_delivery_rate >= 0.9 ? 'success' : 
                   performanceStats.on_time_delivery_rate >= 0.7 ? 'warning' : 'danger'}
          />
          
          <MetricCard
            title="Taxa de Qualidade"
            value={formatPercentage(performanceStats.quality_score)}
            icon={<Star className="h-5 w-5" />}
            color={performanceStats.quality_score >= 0.9 ? 'success' : 
                   performanceStats.quality_score >= 0.7 ? 'warning' : 'danger'}
          />
          
          <MetricCard
            title="Pedidos Entregues"
            value={performanceStats.total_orders.toString()}
            subtitle="Total no período"
            icon={<Package className="h-5 w-5" />}
          />
          
          <MetricCard
            title="Valor Total"
            value={formatCurrency(performanceStats.total_value)}
            subtitle="Total faturado"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Tendência de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart implementation would go here */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de tendência em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Distribuição de Qualidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart implementation would go here */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de distribuição em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alertas de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Atraso em Entregas</p>
                <p className="text-sm text-yellow-700">
                  Taxa de entregas no prazo abaixo de 85% nos últimos 30 dias
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Melhoria de Qualidade</p>
                <p className="text-sm text-blue-700">
                  Pontuação de qualidade aumentou 12% este mês
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcurementTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Histórico de Compras</h3>

      {/* Procurement Stats */}
      {procurementStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total de Pedidos"
            value={procurementStats.total_orders.toString()}
            icon={<Package className="h-5 w-5" />}
          />
          
          <MetricCard
            title="Valor Total"
            value={formatCurrency(procurementStats.total_value)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(procurementStats.average_order_value)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Pedidos Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {procurementHistory && procurementHistory.length > 0 ? (
              procurementHistory.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.date)} • {order.items} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_value)}</p>
                    <Badge 
                      variant={order.status === 'delivered' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum histórico de compras encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContractsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contratos</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Contratos Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeContracts && activeContracts.length > 0 ? (
              activeContracts.map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-gray-600">
                      Vigência: {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor: {formatCurrency(contract.total_value)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={contract.status === 'active' ? 'default' : 'secondary'}
                    >
                      {contract.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum contrato ativo encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunicationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Comunicações</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunicação
        </Button>
      </div>

      {/* Recent Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Comunicações Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCommunications && recentCommunications.length > 0 ? (
              recentCommunications.map((comm, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {comm.type === 'email' ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : comm.type === 'phone' ? (
                      <Phone className="h-5 w-5 text-green-600" />
                    ) : (
                      <Activity className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{comm.subject}</p>
                    <p className="text-sm text-gray-600">{comm.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{formatDate(comm.date)}</span>
                      <span>Por: {comm.created_by}</span>
                      <Badge variant="outline" className="text-xs">
                        {comm.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma comunicação registrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentSupplier) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fornecedor não encontrado</DialogTitle>
            <DialogDescription>
              O fornecedor solicitado não foi encontrado.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {renderHeader()}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="procurement">Compras</TabsTrigger>
              <TabsTrigger value="contracts">Contratos</TabsTrigger>
              <TabsTrigger value="communications">Comunicações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              {renderPerformanceTab()}
            </TabsContent>

            <TabsContent value="procurement" className="mt-6">
              {renderProcurementTab()}
            </TabsContent>

            <TabsContent value="contracts" className="mt-6">
              {renderContractsTab()}
            </TabsContent>

            <TabsContent value="communications" className="mt-6">
              {renderCommunicationsTab()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Form Modal */}
        {editFormOpen && currentSupplier && (
          <SupplierForm
            supplier={currentSupplier}
            clinicId={clinicId}
            open={editFormOpen}
            onOpenChange={setEditFormOpen}
            mode="edit"
            onSuccess={() => {
              setEditFormOpen(false);
              // Refresh data
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
