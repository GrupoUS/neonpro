'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Download } from 'lucide-react'

interface MedicalRecordsHeaderProps {
  onSearch?: (query: string) => void
  onFilter?: (filter: string) => void
  onExport?: () => void
}

export function MedicalRecordsHeader({ 
  onSearch, 
  onFilter, 
  onExport 
}: MedicalRecordsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Busca */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar prontuários..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros e ações */}
      <div className="flex gap-2">
        {/* Filtro por tipo */}
        <Select onValueChange={onFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os prontuários</SelectItem>
            <SelectItem value="recent">Recentes (30 dias)</SelectItem>
            <SelectItem value="active">Tratamentos ativos</SelectItem>
            <SelectItem value="completed">Tratamentos concluídos</SelectItem>
          </SelectContent>
        </Select>

        {/* Exportar */}
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  )
}
