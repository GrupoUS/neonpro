/**
 * AdvancedSearchDialog Component - Advanced search filters for patients (FR-005)
 * Implements comprehensive search with Brazilian data validation and performance optimization
 */

'use client';

import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useSearchPerformance } from '@/hooks/usePerformanceMonitor';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@neonpro/ui';
import { Activity, Calendar, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: any) => void;
  // currentFilters?: any;
}

export function AdvancedSearchDialog({
  open,
  onOpenChange,
  onApplyFilters,
}: AdvancedSearchDialogProps) {
  const {
    filters,
    clearFilters,
    formatCPF,
    formatPhone,
    validateCPF,
    validatePhone,
    metrics,
  } = useAdvancedSearch();

  const { measureSearch, searchResponseTime, searchStatus, isSearchHealthy } =
    useSearchPerformance();

  const [localFilters, setLocalFilters] = useState<typeof filters>(filters);

  const handleApply = async () => {
    // Measure search performance
    await measureSearch(async () => {
      onApplyFilters(localFilters);
      return Promise.resolve();
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    clearFilters();
    setLocalFilters(filters);
    onApplyFilters({});
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setLocalFilters(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setLocalFilters(prev => ({ ...prev, phone: formatted }));
  };

  const statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'pending', label: 'Pendente' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5 text-primary' />
            Busca Avançada de Pacientes
          </DialogTitle>
          <DialogDescription>
            Use os filtros abaixo para encontrar pacientes específicos. Os campos são opcionais e
            podem ser combinados.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* General Search */}
          <div className='space-y-2'>
            <Label htmlFor='general-search'>Busca Geral</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='general-search'
                placeholder='Nome, email ou telefone...'
                value={localFilters.query}
                onChange={e =>
                  setLocalFilters(prev => ({
                    ...prev,
                    query: e.target.value,
                  }))}
                className='pl-10'
              />
            </div>
          </div>

          {/* Specific Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* CPF Search */}
            <div className='space-y-2'>
              <Label htmlFor='cpf-search'>CPF</Label>
              <Input
                id='cpf-search'
                placeholder='000.000.000-00'
                value={localFilters.cpf}
                onChange={e => handleCPFChange(e.target.value)}
                maxLength={14}
              />
              {localFilters.cpf && !validateCPF(localFilters.cpf) && (
                <p className='text-sm text-destructive'>CPF inválido</p>
              )}
            </div>

            {/* Phone Search */}
            <div className='space-y-2'>
              <Label htmlFor='phone-search'>Telefone</Label>
              <Input
                id='phone-search'
                placeholder='(11) 99999-9999'
                value={localFilters.phone}
                onChange={e => handlePhoneChange(e.target.value)}
                maxLength={15}
              />
              {localFilters.phone && !validatePhone(localFilters.phone) && (
                <p className='text-sm text-destructive'>Telefone inválido</p>
              )}
            </div>

            {/* Email Search */}
            <div className='space-y-2'>
              <Label htmlFor='email-search'>Email</Label>
              <Input
                id='email-search'
                type='email'
                placeholder='paciente@exemplo.com'
                value={localFilters.email}
                onChange={e =>
                  setLocalFilters(prev => ({
                    ...prev,
                    email: e.target.value,
                  }))}
              />
            </div>

            {/* Status Filter */}
            <div className='space-y-2'>
              <Label>Status</Label>
              <div className='space-y-2'>
                {statusOptions.map(option => (
                  <div
                    key={option.value}
                    className='flex items-center space-x-2'
                  >
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={localFilters.status.includes(option.value)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setLocalFilters(prev => ({
                            ...prev,
                            status: [...prev.status, option.value],
                          }));
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            status: prev.status.filter(
                              s => s !== option.value,
                            ),
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`status-${option.value}`}
                      className='text-sm'
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className='space-y-2'>
            <Label>Data de Cadastro</Label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date-start' className='text-sm'>
                  Data Inicial
                </Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='date-start'
                    type='date'
                    value={localFilters.dateRange.start
                      ?.toISOString()
                      .split('T')[0] || ''}
                    onChange={e => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: date },
                      }));
                    }}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='date-end' className='text-sm'>
                  Data Final
                </Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='date-end'
                    type='date'
                    value={localFilters.dateRange.end?.toISOString().split('T')[0]
                      || ''}
                    onChange={e => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: date },
                      }));
                    }}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Metrics */}
          {metrics.lastSearchAt && (
            <div className='text-xs text-muted-foreground border-t pt-4'>
              Última busca: {metrics.lastSearchAt.toLocaleString('pt-BR')}(
              {metrics.searchTime.toFixed(0)}ms)
            </div>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <div className='flex items-center gap-4 flex-1'>
            {/* Performance Indicator */}
            {searchResponseTime > 0 && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Activity className='w-4 h-4' />
                <span>
                  Busca: {searchResponseTime.toFixed(0)}ms
                  {searchStatus === 'excellent' && ' ⚡'}
                  {searchStatus === 'good' && ' ✓'}
                  {searchStatus === 'fair' && ' ⚠️'}
                  {searchStatus === 'poor' && ' 🐌'}
                </span>
                {!isSearchHealthy && (
                  <span className='text-yellow-600 dark:text-yellow-400 text-xs'>
                    (meta: &lt;300ms)
                  </span>
                )}
              </div>
            )}
          </div>

          <Button variant='outline' onClick={handleClear}>
            <X className='w-4 h-4 mr-2' />
            Limpar
          </Button>
          <Button onClick={handleApply}>
            <Search className='w-4 h-4 mr-2' />
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
