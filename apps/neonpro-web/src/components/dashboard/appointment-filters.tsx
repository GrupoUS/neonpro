'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  X, 
  CalendarDays, 
  Users, 
  Clock,
  Search,
  RotateCcw
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { AppointmentFilters, Appointment } from '@/hooks/use-appointments-manager'

interface AppointmentFiltersProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: Partial<AppointmentFilters>) => void
  onClearFilters: () => void
  professionals?: Array<{ id: string; name: string }>
  className?: string
}

export function AppointmentFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  professionals = [],
  className
}: AppointmentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // Count active filters
  const activeFiltersCount = [
    filters.professionalId,
    filters.status,
    filters.patientName,
    filters.dateRange === 'custom' && (filters.startDate || filters.endDate)
  ].filter(Boolean).length

  const statusOptions: { value: Appointment['status']; label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Concluído' },
    { value: 'no_show', label: 'Não Compareceu' },
    { value: 'rescheduled', label: 'Reagendado' }
  ]

  const dateRangeOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'custom', label: 'Período Personalizado' }
  ]

  return (
    <div className={cn('', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  <CardDescription>
                    Refine sua busca por agendamentos
                  </CardDescription>
                </div>
                
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Date Range Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Período
                </Label>
                
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value: any) => onFiltersChange({ dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Date Range */}
                {filters.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Data Inicial</Label>
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !filters.startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {filters.startDate ? (
                              format(filters.startDate, 'dd/MM/yyyy', { locale: pt })
                            ) : (
                              'Selecionar'
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date) => {
                              onFiltersChange({ startDate: date })
                              setStartDateOpen(false)
                            }}
                            locale={pt}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Data Final</Label>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !filters.endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {filters.endDate ? (
                              format(filters.endDate, 'dd/MM/yyyy', { locale: pt })
                            ) : (
                              'Selecionar'
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => {
                              onFiltersChange({ endDate: date })
                              setEndDateOpen(false)
                            }}
                            disabled={(date) => 
                              filters.startDate ? date < filters.startDate : false
                            }
                            locale={pt}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Professional Filter */}
              {professionals.length > 0 && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Profissional
                  </Label>
                  
                  <Select 
                    value={filters.professionalId || ''} 
                    onValueChange={(value) => 
                      onFiltersChange({ professionalId: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os profissionais" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os profissionais</SelectItem>
                      {professionals.map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status
                </Label>
                
                <Select 
                  value={filters.status || ''} 
                  onValueChange={(value: any) => 
                    onFiltersChange({ status: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Patient Search */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Paciente
                </Label>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do paciente..."
                    value={filters.patientName || ''}
                    onChange={(e) => onFiltersChange({ patientName: e.target.value || undefined })}
                    className="pl-10"
                  />
                  {filters.patientName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ patientName: undefined })}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.professionalId && (
            <Badge variant="secondary" className="gap-1">
              Profissional: {professionals.find(p => p.id === filters.professionalId)?.name || 'Selecionado'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ professionalId: undefined })}
              />
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ status: undefined })}
              />
            </Badge>
          )}
          
          {filters.patientName && (
            <Badge variant="secondary" className="gap-1">
              Paciente: {filters.patientName}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ patientName: undefined })}
              />
            </Badge>
          )}
          
          {filters.dateRange === 'custom' && (filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="gap-1">
              Período: {filters.startDate && format(filters.startDate, 'dd/MM', { locale: pt })} - {filters.endDate && format(filters.endDate, 'dd/MM', { locale: pt })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ startDate: undefined, endDate: undefined, dateRange: 'week' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}