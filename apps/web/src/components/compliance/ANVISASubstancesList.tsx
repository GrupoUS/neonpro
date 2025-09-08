import { Badge, } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import { Input, } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ControlledSubstanceClass, } from '@/lib/compliance/anvisa-controlled-substances'
import { Search, } from 'lucide-react'
import type React from 'react'
import {
  getSubstanceClassConfig, /*, SUBSTANCE_CLASS_CONFIG*/
} from '../../constants/anvisa-configs' // SUBSTANCE_CLASS_CONFIG unused import
import type { ANVISASubstance, } from '../../types/compliance'

interface ANVISASubstancesListProps {
  substances: ANVISASubstance[]
  searchTerm: string
  selectedClass: ControlledSubstanceClass | 'all'
  onSearchChange: (value: string,) => void
  onClassChange: (value: ControlledSubstanceClass | 'all',) => void
  loading: boolean
}

export const ANVISASubstancesList: React.FC<ANVISASubstancesListProps> = ({
  substances,
  searchTerm,
  selectedClass,
  onSearchChange,
  onClassChange,
  loading,
},) => {
  const getClassBadgeVariant = (controlledClass: ControlledSubstanceClass,) => {
    // Map classes to badge variants based on severity
    if (controlledClass === 'A1' || controlledClass === 'A2') return 'destructive'
    if (controlledClass === 'A3' || controlledClass === 'B1') return 'default'
    return 'secondary'
  }

  const getClassIcon = (controlledClass: ControlledSubstanceClass,) => {
    const config = getSubstanceClassConfig(controlledClass,)
    const IconComponent = config.icon
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Substâncias Controladas</span>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar substância..."
              value={searchTerm}
              onChange={(e,) => onSearchChange(e.target.value,)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={selectedClass}
              onValueChange={(value: string,) =>
                onClassChange(value as ControlledSubstanceClass | 'all',)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classes</SelectItem>
                <SelectItem value="A1">A1 - Narcóticos</SelectItem>
                <SelectItem value="A2">A2 - Psicotrópicos</SelectItem>
                <SelectItem value="A3">A3 - Imunossupressores</SelectItem>
                <SelectItem value="B1">B1 - Psicotrópicos</SelectItem>
                <SelectItem value="B2">B2 - Psicotrópicos</SelectItem>
                <SelectItem value="C1">C1 - Ret. Especial</SelectItem>
                <SelectItem value="C2">C2 - Ret. Comum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading
          ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-2 text-gray-600">Carregando substâncias...</span>
            </div>
          )
          : substances.length === 0
          ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma substância encontrada</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {substances.map((substance,) => {
                const config = getSubstanceClassConfig(substance.controlledClass,)
                return (
                  <div
                    key={substance.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getClassIcon(substance.controlledClass,)}
                          <Badge variant={getClassBadgeVariant(substance.controlledClass,)}>
                            {substance.controlledClass}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {substance.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {substance.activeIngredient}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Classe: {config.label}</span>
                        <span>•</span>
                        <span>{config.description}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {substance.manufacturer}
                      </div>
                      <div className="text-xs text-gray-500">
                        Registro: {substance.registrationNumber}
                      </div>
                    </div>
                  </div>
                )
              },)}
            </div>
          )}
      </CardContent>
    </Card>
  )
}
