'use client';

import React from 'react';
import { Filter, X, UserCheck, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PatientFiltersProps {
  filters: {
    status: string;
    riskLevel: string;
    ageRange: string;
    hasUpcomingAppointments: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export default function PatientFilters({
  filters,
  onFiltersChange
}: PatientFiltersProps) {

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      riskLevel: 'all',
      ageRange: 'all',
      hasUpcomingAppointments: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.riskLevel !== 'all') count++;
    if (filters.ageRange !== 'all') count++;
    if (filters.hasUpcomingAppointments) count++;
    return count;
  };

  const getActiveFiltersList = () => {
    const activeFilters = [];
    
    if (filters.status !== 'all') {
      const statusLabels = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'vip': 'VIP',
        'new': 'Novo'
      };
      activeFilters.push({
        key: 'status',
        label: `Status: ${statusLabels[filters.status as keyof typeof statusLabels]}`,
        value: filters.status
      });
    }

    if (filters.riskLevel !== 'all') {
      const riskLabels = {
        'low': 'Baixo',
        'medium': 'Médio',
        'high': 'Alto',
        'critical': 'Crítico'
      };
      activeFilters.push({
        key: 'riskLevel',
        label: `Risco: ${riskLabels[filters.riskLevel as keyof typeof riskLabels]}`,
        value: filters.riskLevel
      });
    }

    if (filters.ageRange !== 'all') {
      const ageLabels = {
        '0-18': '0-18 anos',
        '19-30': '19-30 anos',
        '31-50': '31-50 anos',
        '51-70': '51-70 anos',
        '70+': '70+ anos'
      };
      activeFilters.push({
        key: 'ageRange',
        label: `Idade: ${ageLabels[filters.ageRange as keyof typeof ageLabels]}`,
        value: filters.ageRange
      });
    }

    if (filters.hasUpcomingAppointments) {
      activeFilters.push({
        key: 'hasUpcomingAppointments',
        label: 'Com consultas agendadas',
        value: true
      });
    }

    return activeFilters;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const activeFiltersList = getActiveFiltersList();

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <UserCheck className="h-4 w-4 mr-1" />
            Status do Paciente
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Ativo
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                  Inativo
                </div>
              </SelectItem>
              <SelectItem value="vip">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  VIP ⭐
                </div>
              </SelectItem>
              <SelectItem value="new">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Novo
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Nível de Risco
          </Label>
          <Select
            value={filters.riskLevel}
            onValueChange={(value) => handleFilterChange('riskLevel', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os níveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="low">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Baixo
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Médio
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                  Alto
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Crítico
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Faixa Etária
          </Label>
          <Select
            value={filters.ageRange}
            onValueChange={(value) => handleFilterChange('ageRange', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as idades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as idades</SelectItem>
              <SelectItem value="0-18">0-18 anos</SelectItem>
              <SelectItem value="19-30">19-30 anos</SelectItem>
              <SelectItem value="31-50">31-50 anos</SelectItem>
              <SelectItem value="51-70">51-70 anos</SelectItem>
              <SelectItem value="70+">70+ anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upcoming Appointments Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Consultas Agendadas
          </Label>
          <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
            <Checkbox
              id="upcoming-appointments"
              checked={filters.hasUpcomingAppointments}
              onCheckedChange={(checked) => 
                handleFilterChange('hasUpcomingAppointments', !!checked)
              }
            />
            <Label 
              htmlFor="upcoming-appointments" 
              className="text-sm cursor-pointer"
            >
              Com consultas agendadas
            </Label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Filtros ativos ({activeFiltersCount})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar todos
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {activeFiltersList.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="text-xs">{filter.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (filter.key === 'hasUpcomingAppointments') {
                        handleFilterChange(filter.key, false);
                      } else {
                        handleFilterChange(filter.key, 'all');
                      }
                    }}
                    className="h-4 w-4 p-0 hover:bg-muted-foreground/20 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filter Instructions */}
      <div className="text-xs text-muted-foreground">
        <div>
          <strong>Dica:</strong> Combine múltiplos filtros para refinar sua busca. 
          Os filtros trabalham em conjunto para mostrar apenas pacientes que atendem 
          a todos os critérios selecionados.
        </div>
      </div>
    </div>
  );
}