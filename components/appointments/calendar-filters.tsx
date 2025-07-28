'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Filter,
  User,
  Briefcase,
  Calendar,
  Clock,
  X,
  RotateCcw,
  Search
} from 'lucide-react'
import { CalendarFilters as CalendarFiltersType, Professional } from '@/app/appointments/page'
import { cn } from '@/lib/utils'
import moment from 'moment'
import 'moment/locale/pt-br'

moment.locale('pt-br')

interface CalendarFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: CalendarFiltersType
  onFiltersChange: (filters: CalendarFiltersType) => void
  professionals: Professional[]
}

// Service type configurations
const serviceTypes = [
  {
    value: 'consultation',
    label: 'Consulta',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800',
    count: 0 // This would be populated from actual data
  },
  {
    value: 'botox',
    label: 'Aplicação de Botox',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-100 text-violet-800',
    count: 0
  },
  {
    value: 'fillers',
    label: 'Preenchimento',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-100 text-emerald-800',
    count: 0
  },
  {
    value: 'procedure',
    label: 'Procedimento',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-100 text-amber-800',
    count: 0
  }
]

// Status configurations
const statusTypes = [
  {
    value: 'scheduled',
    label: 'Agendado',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800',
    count: 0
  },
  {
    value: 'confirmed',
    label: 'Confirmado',
    color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800',
    count: 0
  },
  {
    value: 'in-progress',
    label: 'Em Atendimento',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100 text-orange-800',
    count: 0
  },
  {
    value: 'completed',
    label: 'Concluído',
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100 text-gray-800',
    count: 0
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
    color: 'bg-red-500',
    lightColor: 'bg-red-100 text-red-800',
    count: 0
  },
  {
    value: 'no-show',
    label: 'Faltou',
    color: 'bg-gray-400',
    lightColor: 'bg-gray-100 text-gray-600',
    count: 0
  }
]

// Quick date range presets
const datePresets = [
  {
    label: 'Hoje',
    getValue: () => ({
      start: moment().startOf('day').toDate(),
      end: moment().endOf('day').toDate()
    })
  },
  {
    label: 'Esta Semana',
    getValue: () => ({
      start: moment().startOf('week').toDate(),
      end: moment().endOf('week').toDate()
    })
  },
  {
    label: 'Este Mês',
    getValue: () => ({
      start: moment().startOf('month').toDate(),
      end: moment().endOf('month').toDate()
    })
  },
  {
    label: 'Próxima Semana',
    getValue: () => ({
      start: moment().add(1, 'week').startOf('week').toDate(),
      end: moment().add(1, 'week').endOf('week').toDate()
    })
  },
  {
    label: 'Próximo Mês',
    getValue: () => ({
      start: moment().add(1, 'month').startOf('month').toDate(),
      end: moment().add(1, 'month').endOf('month').toDate()
    })
  }
]

export function CalendarFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  professionals
}: CalendarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<CalendarFiltersType>(filters)
  const [searchQuery, setSearchQuery] = useState('')

  // Update local filters when props change
  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Filter professionals based on search
  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle service type filter
  const toggleServiceType = (serviceType: string) => {
    setLocalFilters(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(serviceType)
        ? prev.serviceTypes.filter(s => s !== serviceType)
        : [...prev.serviceTypes, serviceType]
    }))
  }

  // Toggle status filter
  const toggleStatus = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  // Toggle professional filter
  const toggleProfessional = (professionalId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      professionals: prev.professionals.includes(professionalId)
        ? prev.professionals.filter(p => p !== professionalId)
        : [...prev.professionals, professionalId]
    }))
  }

  // Set date range
  const setDateRange = (range: { start: Date; end: Date }) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: range
    }))
  }

  // Clear specific filter
  const clearServiceTypes = () => {
    setLocalFilters(prev => ({ ...prev, serviceTypes: [] }))
  }

  const clearStatuses = () => {
    setLocalFilters(prev => ({ ...prev, statuses: [] }))
  }

  const clearProfessionals = () => {
    setLocalFilters(prev => ({ ...prev, professionals: [] }))
  }

  const clearDateRange = () => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: { start: null, end: null }
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters: CalendarFiltersType = {
      serviceTypes: [],
      statuses: [],
      professionals: [],
      dateRange: { start: null, end: null }
    }
    setLocalFilters(emptyFilters)
  }

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  // Count active filters
  const activeFiltersCount = 
    localFilters.serviceTypes.length +
    localFilters.statuses.length + 
    localFilters.professionals.length +
    (localFilters.dateRange.start || localFilters.dateRange.end ? 1 : 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros da Agenda</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Tudo
            </Button>
          </DialogTitle>
          <DialogDescription>
            Filtre as consultas por tipo de serviço, status, profissional ou período
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Types Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Tipos de Serviço</span>
                </CardTitle>
                {localFilters.serviceTypes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearServiceTypes}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((service) => (
                  <div
                    key={service.value}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      localFilters.serviceTypes.includes(service.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => toggleServiceType(service.value)}
                  >
                    <Checkbox
                      checked={localFilters.serviceTypes.includes(service.value)}
                      readOnly
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={cn('w-3 h-3 rounded-full', service.color)} />
                        <span className="font-medium text-sm">{service.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Status das Consultas</span>
                </CardTitle>
                {localFilters.statuses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearStatuses}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {statusTypes.map((status) => (
                  <div
                    key={status.value}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      localFilters.statuses.includes(status.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => toggleStatus(status.value)}
                  >
                    <Checkbox
                      checked={localFilters.statuses.includes(status.value)}
                      readOnly
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={cn('w-3 h-3 rounded-full', status.color)} />
                        <span className="font-medium text-sm">{status.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professionals Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profissionais</span>
                </CardTitle>
                {localFilters.professionals.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearProfessionals}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar profissional..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Professionals List */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredProfessionals.map((professional) => (
                  <div
                    key={professional.id}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      localFilters.professionals.includes(professional.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => toggleProfessional(professional.id)}
                  >
                    <Checkbox
                      checked={localFilters.professionals.includes(professional.id)}
                      readOnly
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: professional.color }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {professional.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {professional.specialization}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={professional.availability ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {professional.availability ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Período</span>
                </CardTitle>
                {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Quick Presets */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {datePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(preset.getValue())}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Custom Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Data Início</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.start 
                      ? moment(localFilters.dateRange.start).format('YYYY-MM-DD')
                      : ''
                    }
                    onChange={(e) => {
                      const startDate = e.target.value ? new Date(e.target.value) : null
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: startDate }
                      }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Data Fim</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.end
                      ? moment(localFilters.dateRange.end).format('YYYY-MM-DD')
                      : ''
                    }
                    onChange={(e) => {
                      const endDate = e.target.value ? new Date(e.target.value) : null
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: endDate }
                      }))
                    }}
                    min={localFilters.dateRange.start 
                      ? moment(localFilters.dateRange.start).format('YYYY-MM-DD')
                      : undefined
                    }
                  />
                </div>
              </div>

              {/* Selected Range Display */}
              {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Período selecionado:
                  </p>
                  <p className="font-medium">
                    {localFilters.dateRange.start 
                      ? moment(localFilters.dateRange.start).format('DD/MM/YYYY')
                      : '...'
                    } até {localFilters.dateRange.end
                      ? moment(localFilters.dateRange.end).format('DD/MM/YYYY')
                      : '...'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={applyFilters}>
            Aplicar Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}