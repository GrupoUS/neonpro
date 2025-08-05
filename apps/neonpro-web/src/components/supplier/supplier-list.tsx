// ============================================================================
// Supplier List Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier management interface with search, filtering,
// sorting, and bulk operations for NeonPro clinic management
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { 
  Supplier, 
  SupplierStatus, 
  SupplierCategory,
  RiskLevel 
} from '@/lib/types/supplier';
import { useSuppliers, useSupplierSearch } from '@/lib/hooks/use-supplier';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SupplierListProps {
  clinicId: string;
  onSupplierSelect?: (supplier: Supplier) => void;
  onSupplierCreate?: () => void;
  onSupplierEdit?: (supplier: Supplier) => void;
  onSupplierDelete?: (supplier: Supplier) => void;
  selectable?: boolean;
  compactView?: boolean;
}

interface SupplierFilters {
  search: string;
  category: SupplierCategory | 'all';
  status: SupplierStatus | 'all';
  riskLevel: RiskLevel | 'all';
  performanceRange: [number, number];
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
    case SupplierStatus.SUSPENDED:
      return 'bg-red-100 text-red-800 border-red-200';
    case SupplierStatus.PENDING_VERIFICATION:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case SupplierStatus.BLOCKED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: SupplierStatus) => {
  switch (status) {
    case SupplierStatus.ACTIVE:
      return <CheckCircle className="h-3 w-3" />;
    case SupplierStatus.INACTIVE:
      return <Minus className="h-3 w-3" />;
    case SupplierStatus.SUSPENDED:
      return <XCircle className="h-3 w-3" />;
    case SupplierStatus.PENDING_VERIFICATION:
      return <Clock className="h-3 w-3" />;
    case SupplierStatus.BLOCKED:
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Minus className="h-3 w-3" />;
  }
};

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case RiskLevel.LOW:
      return 'bg-green-100 text-green-800';
    case RiskLevel.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case RiskLevel.HIGH:
      return 'bg-orange-100 text-orange-800';
    case RiskLevel.CRITICAL:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: SupplierCategory) => {
  switch (category) {
    case SupplierCategory.MEDICAL_EQUIPMENT:
      return '🏥';
    case SupplierCategory.AESTHETIC_SUPPLIES:
      return '💄';
    case SupplierCategory.PHARMACEUTICALS:
      return '💊';
    case SupplierCategory.CONSUMABLES:
      return '📦';
    case SupplierCategory.TECHNOLOGY:
      return '💻';
    case SupplierCategory.SERVICES:
      return '🔧';
    case SupplierCategory.MAINTENANCE:
      return '⚙️';
    case SupplierCategory.OFFICE_SUPPLIES:
      return '📋';
    default:
      return '📦';
  }
};

const getPerformanceTrend = (score: number, previousScore?: number) => {
  if (!previousScore) return { icon: <Minus className="h-3 w-3" />, color: 'text-gray-500' };
  
  const difference = score - previousScore;
  if (difference > 5) return { icon: <TrendingUp className="h-3 w-3" />, color: 'text-green-600' };
  if (difference < -5) return { icon: <TrendingDown className="h-3 w-3" />, color: 'text-red-600' };
  return { icon: <Minus className="h-3 w-3" />, color: 'text-gray-500' };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SupplierList({
  clinicId,
  onSupplierSelect,
  onSupplierCreate,
  onSupplierEdit,
  onSupplierDelete,
  selectable = false,
  compactView = false
}: SupplierListProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'category' | 'status' | 'risk'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search and filtering
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    selectedStatuses,
    setSelectedStatuses,
    selectedRiskLevels,
    setSelectedRiskLevels,
    filters,
    clearFilters,
    hasActiveFilters
  } = useSupplierSearch();

  // Data fetching
  const {
    suppliers,
    isLoading,
    error,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingStatus
  } = useSuppliers(clinicId, filters);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Sorted and filtered suppliers
  const sortedSuppliers = useMemo(() => {
    if (!suppliers?.length) return [];

    const sorted = [...suppliers].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'performance':
          aValue = a.performance_score || 0;
          bValue = b.performance_score || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'risk':
          aValue = a.risk_level;
          bValue = b.risk_level;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [suppliers, sortBy, sortOrder]);

  // Statistics
  const statistics = useMemo(() => {
    if (!suppliers?.length) return {
      total: 0,
      active: 0,
      averagePerformance: 0,
      highRisk: 0
    };

    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === SupplierStatus.ACTIVE).length;
    const averagePerformance = suppliers.reduce((sum, s) => sum + (s.performance_score || 0), 0) / total;
    const highRisk = suppliers.filter(s => 
      s.risk_level === RiskLevel.HIGH || s.risk_level === RiskLevel.CRITICAL
    ).length;

    return { total, active, averagePerformance, highRisk };
  }, [suppliers]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectSupplier = (supplierId: string) => {
    if (!selectable) return;

    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAll = () => {
    if (!selectable) return;

    if (selectedSuppliers.length === sortedSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(sortedSuppliers.map(s => s.id));
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    // Implementation for bulk actions
    console.log(`Bulk ${action} for:`, selectedSuppliers);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSupplierCard = (supplier: Supplier) => (
    <Card 
      key={supplier.id} 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        selectedSuppliers.includes(supplier.id) && "ring-2 ring-blue-500"
      )}
      onClick={() => onSupplierSelect?.(supplier)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {supplier.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{supplier.name}</h3>
                <span className="text-xs">{getCategoryIcon(supplier.category)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{supplier.legal_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getStatusColor(supplier.status))}
                >
                  {getStatusIcon(supplier.status)}
                  <span className="ml-1">{supplier.status}</span>
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getRiskColor(supplier.risk_level))}
                >
                  {supplier.risk_level}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSupplierSelect?.(supplier)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSupplierEdit?.(supplier)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onSupplierDelete?.(supplier)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Performance</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{supplier.performance_score || 0}%</span>
              {getPerformanceTrend(supplier.performance_score || 0).icon}
            </div>
          </div>
          <Progress value={supplier.performance_score || 0} className="h-1" />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span>{supplier.quality_rating || 0}/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{supplier.primary_contact?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSupplierRow = (supplier: Supplier) => (
    <TableRow 
      key={supplier.id}
      className={cn(
        "cursor-pointer hover:bg-gray-50",
        selectedSuppliers.includes(supplier.id) && "bg-blue-50"
      )}
      onClick={() => onSupplierSelect?.(supplier)}
    >
      {selectable && (
        <TableCell>
          <Checkbox
            checked={selectedSuppliers.includes(supplier.id)}
            onCheckedChange={() => handleSelectSupplier(supplier.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}
      
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {supplier.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{supplier.name}</p>
              <span className="text-xs">{getCategoryIcon(supplier.category)}</span>
            </div>
            <p className="text-xs text-gray-500">{supplier.legal_name}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="secondary" 
          className={cn("text-xs", getStatusColor(supplier.status))}
        >
          {getStatusIcon(supplier.status)}
          <span className="ml-1">{supplier.status}</span>
        </Badge>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="outline" 
          className={cn("text-xs", getRiskColor(supplier.risk_level))}
        >
          {supplier.risk_level}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Progress value={supplier.performance_score || 0} className="h-2" />
          </div>
          <span className="text-sm font-medium w-12 text-right">
            {supplier.performance_score || 0}%
          </span>
          {getPerformanceTrend(supplier.performance_score || 0).icon}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span className="text-sm">{supplier.quality_rating || 0}/5</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-gray-600">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[120px]">
              {supplier.primary_contact?.email || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{supplier.primary_contact?.phone || 'N/A'}</span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSupplierSelect?.(supplier)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSupplierEdit?.(supplier)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onSupplierDelete?.(supplier)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar fornecedores
          </h3>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao carregar a lista de fornecedores. Tente novamente.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Média</p>
                <p className="text-2xl font-bold">{Math.round(statistics.averagePerformance)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">{statistics.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={selectedCategories[0] || 'all'}
                onValueChange={(value) => 
                  setSelectedCategories(value === 'all' ? [] : [value as SupplierCategory])
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.values(SupplierCategory).map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedStatuses[0] || 'all'}
                onValueChange={(value) => 
                  setSelectedStatuses(value === 'all' ? [] : [value as SupplierStatus])
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(SupplierStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {getStatusIcon(status)} {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedRiskLevels[0] || 'all'}
                onValueChange={(value) => 
                  setSelectedRiskLevels(value === 'all' ? [] : [value as RiskLevel])
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(RiskLevel).map(risk => (
                    <SelectItem key={risk} value={risk}>
                      {risk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Limpar
                </Button>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              {onSupplierCreate && (
                <Button onClick={onSupplierCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              )}
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectable && selectedSuppliers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedSuppliers.length} fornecedor(es) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Ativar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Desativar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suppliers List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSuppliers.map(renderSupplierCard)}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSuppliers.length === sortedSuppliers.length && sortedSuppliers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Fornecedor
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? '↑' : '↓'
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? '↑' : '↓'
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('risk')}
                >
                  <div className="flex items-center gap-1">
                    Risco
                    {sortBy === 'risk' && (
                      sortOrder === 'asc' ? '↑' : '↓'
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('performance')}
                >
                  <div className="flex items-center gap-1">
                    Performance
                    {sortBy === 'performance' && (
                      sortOrder === 'asc' ? '↑' : '↓'
                    )}
                  </div>
                </TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSuppliers.map(renderSupplierRow)}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {sortedSuppliers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? 'Tente ajustar os filtros para encontrar fornecedores.' 
                : 'Comece criando seu primeiro fornecedor.'
              }
            </p>
            {!hasActiveFilters && onSupplierCreate && (
              <Button onClick={onSupplierCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Fornecedor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
