import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import { AlertTriangle, FileText, RefreshCw, Shield, } from 'lucide-react'
import type React from 'react'
import type { ANVISASubstance, ControlledPrescription, } from '../../types/compliance'

interface ANVISAHeaderProps {
  substances: ANVISASubstance[]
  prescriptions: ControlledPrescription[]
  loading: boolean
  onRefresh: () => void
}

export const ANVISAHeader: React.FC<ANVISAHeaderProps> = ({
  substances,
  prescriptions,
  loading,
  onRefresh,
},) => {
  const activeSubstances = substances.length
  const activePrescriptions = prescriptions.filter(p => p.status === 'prescribed').length
  const expiredPrescriptions = prescriptions.filter(p => p.status === 'expired').length
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ANVISA - Controle de Substâncias
            </h1>
            <p className="text-gray-600">
              Rastreamento e controle de substâncias controladas
            </p>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Substâncias Ativas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubstances}</div>
            <p className="text-xs text-muted-foreground">
              Substâncias controladas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prescrições Ativas
            </CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {activePrescriptions}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Prescrições aguardando dispensação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prescrições Dispensadas
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {dispensedPrescriptions}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispensedPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Prescrições já dispensadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prescrições Expiradas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Prescrições que expiraram
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
