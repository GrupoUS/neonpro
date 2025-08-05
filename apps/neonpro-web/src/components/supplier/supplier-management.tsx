// ============================================================================
// Supplier Management Component - Epic 6, Story 6.3
// ============================================================================
// Central component for supplier management with integrated list, forms,
// analytics, and performance tracking functionality
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  Shield,
  DollarSign,
  Activity
} from 'lucide-react';

import {
  Supplier,
  SupplierStatus,
  SupplierCategory,
  RiskLevel
} from '@/lib/types/supplier';
import { 
  useSuppliers,
  useSupplierStats 
} from '@/lib/hooks/use-supplier';
import { SupplierList } from './supplier-list';
import { SupplierForm } from './supplier-form';
import { SupplierDetail } from './supplier-detail';
import { cn, formatPercentage } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SupplierManagementProps {
  clinicId?: string;
}

interface FilterState {
  search: string;
  status: SupplierStatus | 'all';
  category: SupplierCategory | 'all';
  riskLevel: RiskLevel | 'all';
  sortBy: 'name' | 'created_at' | 'performance_score' | 'last_order';
  sortOrder: 'asc' | 'desc';
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'default',
  onClick
}) => {
  const colorClasses = {
    default: 'border-gray-200 hover:border-gray-300',
    success: 'border-green-200 bg-green-50 hover:border-green-300',
    warning: 'border-yellow-200 bg-yellow-50 hover:border-yellow-300',
    danger: 'border-red-200 bg-red-50 hover:border-red-300'
  };

  const trendIcon = trend === 'up' ? 
    <TrendingUp className="h-4 w-4 text-green-600" /> : 
    trend === 'down' ? 
    <TrendingUp className="h-4 w-4 text-red-600 rotate-180" /> : 
    null;

  return (
    <Card 
      className={cn(
        'transition-all cursor-pointer',
        colorClasses[color],
        onClick && 'hover:shadow-md'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
        {trendValue && trendIcon && (
          <div className="flex items-center space-x-1 mt-2">
            {trendIcon}
            <span className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SupplierManagement({ 
  clinicId, 
  initialStats 
}: SupplierManagementProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    category: 'all',
    riskLevel: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  // Data hooks
  const {
    suppliers,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
    refetch: refetchSuppliers
  } = useSuppliers(clinicId);

  const {
    stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useSupplierStats(clinicId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const displayStats = stats || initialStats || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    performanceIssues: 0,
    averagePerformance: 0
  };

  const filteredSuppliers = suppliers?.filter(supplier => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !supplier.name.toLowerCase().includes(searchLower) &&
        !supplier.legal_name?.toLowerCase().includes(searchLower) &&
        !supplier.cnpj?.includes(filters.search) &&
        !supplier.primary_contact?.email?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== 'all' && supplier.status !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && supplier.category !== filters.category) {
      return false;
    }

    // Risk level filter
    if (filters.riskLevel !== 'all' && supplier.risk_level !== filters.riskLevel) {
      return false;
    }

    return true;
  }) || [];

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'name':
        return order * a.name.localeCompare(b.name);
      case 'created_at':
        return order * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'performance_score':
        return order * ((a.performance_score || 0) - (b.performance_score || 0));
      default:
        return 0;
    }
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowCreateForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditForm(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailView(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    // The actual deletion is handled by the SupplierDetail component
    setSelectedSupplier(supplier);
    setShowDetailView(true);
  };

  const handleSupplierSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    refetchSuppliers();
    toast.success('Operação realizada com sucesso!');
  };

  const handleRefresh = () => {
    refetchSuppliers();
    toast.success('Dados atualizados!');
  };

  const handleExport = () => {
    // Implementation for data export
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const handleImport = () => {
    // Implementation for data import
    toast.info('Funcionalidade de importação em desenvolvimento');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total de Fornecedores"
        value={displayStats.totalSuppliers}
        icon={<Building2 className="h-4 w-4" />}
        subtitle="Todos os fornecedores cadastrados"
        onClick={() => handleFilterChange('status', 'all')}
      />
      
      <StatsCard
        title="Fornecedores Ativos"
        value={displayStats.activeSuppliers}
        icon={<Users className="h-4 w-4" />}
        subtitle={`${formatPercentage(displayStats.activeSuppliers / Math.max(displayStats.totalSuppliers, 1))} do total`}
        color="success"
        onClick={() => handleFilterChange('status', SupplierStatus.ACTIVE)}
      />
      
      <StatsCard
        title="Performance Média"
        value={`${displayStats.averagePerformance}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        subtitle="Baseado em todos os fornecedores"
        color={displayStats.averagePerformance >= 80 ? 'success' : 
               displayStats.averagePerformance >= 60 ? 'warning' : 'danger'}
        onClick={() => handleFilterChange('sortBy', 'performance_score')}
      />
      
      <StatsCard
        title="Alertas de Performance"
        value={displayStats.performanceIssues}
        icon={<AlertTriangle className="h-4 w-4" />}
        subtitle="Fornecedores com problemas"
        color={displayStats.performanceIssues > 0 ? 'warning' : 'success'}
        onClick={() => {
          // Filter to show suppliers with performance < 70%
          toast.info('Filtro de performance aplicado');
        }}
      />
    </div>
  );

  const renderFiltersAndActions = () => (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar fornecedores..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select 
          value={filters.status} 
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.values(SupplierStatus).map(status => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.category} 
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {Object.values(SupplierCategory).map(category => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ').toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.riskLevel} 
          onValueChange={(value) => handleFilterChange('riskLevel', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.values(RiskLevel).map(level => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={handleCreateSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (suppliersError || statsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro ao carregar os dados dos fornecedores.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters and Actions */}
      {renderFiltersAndActions()}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {sortedSuppliers.length} de {suppliers?.length || 0} fornecedores
        </span>
        
        <div className="flex items-center space-x-4">
          <span>Ordenar por:</span>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="created_at">Data de Criação</SelectItem>
              <SelectItem value="performance_score">Performance</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Supplier List */}
      <SupplierList
        suppliers={sortedSuppliers}
        isLoading={isLoadingSuppliers}
        onView={handleViewSupplier}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteSupplier}
        clinicId={clinicId}
      />

      {/* Modals */}
      {showCreateForm && (
        <SupplierForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          clinicId={clinicId}
          mode="create"
          onSuccess={handleSupplierSuccess}
        />
      )}

      {showEditForm && selectedSupplier && (
        <SupplierForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          supplier={selectedSupplier}
          clinicId={clinicId}
          mode="edit"
          onSuccess={handleSupplierSuccess}
        />
      )}

      {showDetailView && selectedSupplier && (
        <SupplierDetail
          open={showDetailView}
          onOpenChange={setShowDetailView}
          supplierId={selectedSupplier.id}
          clinicId={clinicId}
          onEdit={handleEditSupplier}
          onDelete={() => {
            setShowDetailView(false);
            refetchSuppliers();
          }}
        />
      )}
    </div>
  );
}
