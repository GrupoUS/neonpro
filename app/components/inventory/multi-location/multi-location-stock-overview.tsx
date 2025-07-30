'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { 
  useInventoryStock, 
  useLocationStockSummary,
  useLowStockAlerts,
  useExpiringItems,
  useRealtimeInventoryStock 
} from '@/app/hooks/use-multi-location-inventory';
import type { InventoryFilters } from '@/app/lib/types/inventory';
import { 
  Building2, 
  Package, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';

interface MultiLocationStockOverviewProps {
  clinic_id?: string;
  showLocationFilter?: boolean;
}

export function MultiLocationStockOverview({ clinic_id, showLocationFilter = false }: MultiLocationStockOverviewProps) {
  const [filters, setFilters] = useState<InventoryFilters>({ clinic_id });
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: stockData, isLoading } = useInventoryStock(filters);
  const { data: locationSummary } = useLocationStockSummary(clinic_id);
  const { data: lowStockAlerts } = useLowStockAlerts(clinic_id);
  const { data: expiringItems } = useExpiringItems(clinic_id);
  
  // Real-time updates
  useRealtimeInventoryStock(clinic_id);

  const filteredStock = stockData?.filter(stock =>
    stock.inventory_item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.inventory_item?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.clinic?.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Localizações</p>
                <p className="text-2xl font-bold">{locationSummary?.length || 0}</p>
              </div>
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{stockData?.length || 0}</p>
              </div>
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockAlerts?.length || 0}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                <p className="text-2xl font-bold text-red-600">{expiringItems?.length || 0}</p>
              </div>
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, SKU ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="medication">Medicamentos</SelectItem>
                <SelectItem value="equipment">Equipamentos</SelectItem>
                <SelectItem value="supplies">Suprimentos</SelectItem>
                <SelectItem value="cosmetics">Cosméticos</SelectItem>
              </SelectContent>
            </Select>

            {showLocationFilter && (
              <Select
                value={filters.clinic_id || 'all'}
                onValueChange={(value) => handleFilterChange('clinic_id', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Localizações</SelectItem>
                  {locationSummary?.map((location) => (
                    <SelectItem key={location.clinic_id} value={location.clinic_id}>
                      {location.clinic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={filters.low_stock ? 'low' : filters.expiring_soon ? 'expiring' : 'all'}
              onValueChange={(value) => {
                if (value === 'low') {
                  handleFilterChange('low_stock', true);
                  handleFilterChange('expiring_soon', false);
                } else if (value === 'expiring') {
                  handleFilterChange('expiring_soon', true);
                  handleFilterChange('low_stock', false);
                } else {
                  handleFilterChange('low_stock', false);
                  handleFilterChange('expiring_soon', false);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alertas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Itens</SelectItem>
                <SelectItem value="low">Estoque Baixo</SelectItem>
                <SelectItem value="expiring">Vencendo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Localização</CardTitle>
          <CardDescription>
            Visualização completa do estoque em todas as localizações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock?.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{stock.inventory_item?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stock.inventory_item?.sku && `SKU: ${stock.inventory_item.sku}`}
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <p className="font-medium">{stock.clinic?.clinic_name}</p>
                      {stock.room && (
                        <p className="text-sm text-muted-foreground">{stock.room.name}</p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.current_quantity}</span>
                      <span className="text-sm text-muted-foreground">
                        {stock.inventory_item?.unit_of_measure}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.available_quantity}</span>
                      {stock.reserved_quantity > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {stock.reserved_quantity} reservado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Stock level indicator */}
                      {stock.available_quantity <= (stock.inventory_item?.minimum_stock_alert || 5) ? (
                        <Badge variant="destructive" className="w-fit">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Baixo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit">
                          Normal
                        </Badge>
                      )}
                      
                      {/* Category badge */}
                      {stock.inventory_item?.category && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {stock.inventory_item.category}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {stock.expiry_date ? (
                      <div>
                        <p className="text-sm">
                          {new Date(stock.expiry_date).toLocaleDateString('pt-BR')}
                        </p>
                        {isExpiringSoon(stock.expiry_date) && (
                          <Badge variant="destructive" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Vencendo
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Transferir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredStock?.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum item encontrado com os filtros aplicados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to check if item is expiring soon (within 30 days)
function isExpiringSoon(expiryDate: string): boolean {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  return expiry <= thirtyDaysFromNow && expiry >= today;
}