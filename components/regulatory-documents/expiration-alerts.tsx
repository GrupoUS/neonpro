'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Settings, 
  Bell,
  Eye,
  Edit,
  X 
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface RegulatoryAlert {
  id: string
  document_id: string
  alert_type: 'expiring' | 'expired' | 'renewal_required' | 'review_due'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  due_date: string
  acknowledged: boolean
  created_at: string
  document?: {
    document_type: string
    document_number?: string
    authority: string
    expiration_date?: string
  }
}

interface ExpirationAlertsProps {
  onViewDocument?: (documentId: string) => void
  onEditDocument?: (documentId: string) => void
  compact?: boolean
  showSettings?: boolean
}

export function ExpirationAlerts({ 
  onViewDocument, 
  onEditDocument,
  compact = false,
  showSettings = true 
}: ExpirationAlertsProps) {
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/regulatory-documents/alerts')
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      
      const result = await response.json()
      setAlerts(result.alerts || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setError('Erro ao carregar alertas')
      toast.error('Erro ao carregar alertas')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/regulatory-documents/alerts/${alertId}/acknowledge`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        throw new Error('Failed to acknowledge alert')
      }
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ))
      
      toast.success('Alerta reconhecido')
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      toast.error('Erro ao reconhecer alerta')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Calendar className="h-4 w-4" />
      case 'low':
        return <Bell className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'expiring':
        return 'Expirando'
      case 'expired':
        return 'Expirado'
      case 'renewal_required':
        return 'Renovação Necessária'
      case 'review_due':
        return 'Revisão Pendente'
      default:
        return type
    }
  }

  const filteredAlerts = showAcknowledged 
    ? alerts 
    : alerts.filter(alert => !alert.acknowledged)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchAlerts}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (filteredAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showAcknowledged 
                ? 'Nenhum alerta encontrado'
                : 'Nenhum alerta pendente'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Compliance
            {filteredAlerts.length > 0 && (
              <Badge variant="secondary">{filteredAlerts.length}</Badge>
            )}
          </CardTitle>
          
          {showSettings && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAcknowledged(!showAcknowledged)}
              >
                {showAcknowledged ? 'Ocultar reconhecidos' : 'Mostrar reconhecidos'}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchAlerts}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.alert_type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="secondary" className="text-xs">
                          Reconhecido
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {alert.document?.document_type}
                      {alert.document?.document_number && ` (${alert.document.document_number})`}
                    </p>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Vence: {new Date(alert.due_date).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        {alert.document?.authority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-3">
                  {onViewDocument && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDocument(alert.document_id)}
                      title="Visualizar documento"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onEditDocument && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditDocument(alert.document_id)}
                      title="Editar documento"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      title="Reconhecer alerta"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}