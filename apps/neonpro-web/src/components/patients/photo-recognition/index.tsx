'use client'

/**
 * Photo Recognition System - Main Integration Component
 * Combines all photo recognition features into a unified interface
 * 
 * @author APEX Master Developer
 */

import React, { useState, useEffect } from 'react'
import { Camera, Upload, Eye, Shield, BarChart3, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

// Import photo recognition components
import { PhotoUpload } from './photo-upload'
import { IdentityVerification } from './identity-verification'
import { PhotoGallery } from './photo-gallery'
import { PrivacyControls } from './privacy-controls'

interface PhotoRecognitionSystemProps {
  patientId: string
  patientName: string
  patientEmail?: string
  onSystemUpdate?: (data: any) => void
  defaultTab?: string
  permissions?: {
    canUpload: boolean
    canVerify: boolean
    canManagePrivacy: boolean
    canViewStats: boolean
    canDelete: boolean
  }
}

interface SystemStats {
  totalPhotos: number
  photosByType: Record<string, number>
  verificationAttempts: number
  successfulVerifications: number
  averageConfidence: number
  privacyCompliance: {
    consentGiven: boolean
    lgpdCompliant: boolean
    dataRetentionDays: number
  }
  storageUsage: {
    totalSize: number
    averageFileSize: number
  }
  recentActivity: {
    lastUpload?: string
    lastVerification?: string
    lastPrivacyUpdate?: string
  }
}

const DEFAULT_PERMISSIONS = {
  canUpload: true,
  canVerify: true,
  canManagePrivacy: true,
  canViewStats: true,
  canDelete: false
}

const PHOTO_TYPE_LABELS = {
  profile: 'Perfil',
  before: 'Antes',
  after: 'Depois',
  progress: 'Progresso',
  document: 'Documento',
  other: 'Outro'
}

export function PhotoRecognitionSystem({
  patientId,
  patientName,
  patientEmail,
  onSystemUpdate,
  defaultTab = 'gallery',
  permissions = DEFAULT_PERMISSIONS
}: PhotoRecognitionSystemProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { toast } = useToast()

  useEffect(() => {
    loadSystemStats()
  }, [patientId, refreshKey])

  const loadSystemStats = async () => {
    if (!permissions.canViewStats) {
      setIsLoadingStats(false)
      return
    }

    try {
      const response = await fetch(
        `/api/patients/photos/stats?patientId=${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()
        setSystemStats(result.data)
      }
    } catch (error) {
      console.error('Error loading system stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleSystemUpdate = (updateData: any) => {
    // Refresh stats when system is updated
    setRefreshKey(prev => prev + 1)
    onSystemUpdate?.(updateData)
  }

  const handlePhotoUploaded = (photoData: any) => {
    toast({
      title: 'Foto enviada com sucesso',
      description: `A foto ${photoData.fileName} foi processada e armazenada.`
    })
    handleSystemUpdate({ type: 'photo_uploaded', data: photoData })
  }

  const handleVerificationCompleted = (verificationData: any) => {
    toast({
      title: 'Verificação concluída',
      description: `Identidade verificada com ${Math.round(verificationData.confidence * 100)}% de confiança.`
    })
    handleSystemUpdate({ type: 'verification_completed', data: verificationData })
  }

  const handlePrivacyUpdated = (privacyData: any) => {
    toast({
      title: 'Configurações atualizadas',
      description: 'As configurações de privacidade foram atualizadas com sucesso.'
    })
    handleSystemUpdate({ type: 'privacy_updated', data: privacyData })
  }

  const handlePhotoDeleted = (photoId: string) => {
    toast({
      title: 'Foto excluída',
      description: 'A foto foi removida do sistema com sucesso.'
    })
    handleSystemUpdate({ type: 'photo_deleted', data: { photoId } })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getComplianceStatus = () => {
    if (!systemStats?.privacyCompliance) return null
    
    const { consentGiven, lgpdCompliant } = systemStats.privacyCompliance
    
    if (consentGiven && lgpdCompliant) {
      return { status: 'compliant', label: 'Conforme', color: 'bg-green-100 text-green-800' }
    } else if (consentGiven && !lgpdCompliant) {
      return { status: 'partial', label: 'Parcial', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'non-compliant', label: 'Não conforme', color: 'bg-red-100 text-red-800' }
    }
  }

  const renderStatsOverview = () => {
    if (isLoadingStats) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!systemStats || !permissions.canViewStats) {
      return null
    }

    const complianceStatus = getComplianceStatus()

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Photos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Fotos</p>
                <p className="text-2xl font-bold">{systemStats.totalPhotos}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Verification Success Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {systemStats.verificationAttempts > 0 
                    ? Math.round((systemStats.successfulVerifications / systemStats.verificationAttempts) * 100)
                    : 0
                  }%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Armazenamento</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(systemStats.storageUsage.totalSize)}
                </p>
              </div>
              <Upload className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* LGPD Compliance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformidade LGPD</p>
                {complianceStatus && (
                  <Badge className={complianceStatus.color}>
                    {complianceStatus.label}
                  </Badge>
                )}
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPhotoTypeBreakdown = () => {
    if (!systemStats?.photosByType || !permissions.canViewStats) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(systemStats.photosByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-600">
                  {PHOTO_TYPE_LABELS[type as keyof typeof PHOTO_TYPE_LABELS] || type}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderRecentActivity = () => {
    if (!systemStats?.recentActivity || !permissions.canViewStats) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Último upload:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastUpload)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Última verificação:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastVerification)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Última atualização de privacidade:</span>
              <span className="text-sm font-medium">
                {formatDate(systemStats.recentActivity.lastPrivacyUpdate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Sistema de Reconhecimento Facial - {patientName}
            </CardTitle>
            <div className="flex items-center gap-2">
              {patientEmail && (
                <Badge variant="outline">{patientEmail}</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshKey(prev => prev + 1)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      {renderStatsOverview()}
      {renderPhotoTypeBreakdown()}
      {renderRecentActivity()}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Galeria
          </TabsTrigger>
          
          {permissions.canUpload && (
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          )}
          
          {permissions.canVerify && (
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Verificar
            </TabsTrigger>
          )}
          
          {permissions.canManagePrivacy && (
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
          )}
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <PhotoGallery
            patientId={patientId}
            patientName={patientName}
            onPhotoDeleted={handlePhotoDeleted}
            allowDelete={permissions.canDelete}
            allowDownload={true}
          />
        </TabsContent>

        {/* Upload Tab */}
        {permissions.canUpload && (
          <TabsContent value="upload" className="space-y-4">
            <PhotoUpload
              patientId={patientId}
              patientName={patientName}
              onPhotoUploaded={handlePhotoUploaded}
              maxFileSize={10 * 1024 * 1024} // 10MB
              allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
              enableFacialRecognition={true}
            />
          </TabsContent>
        )}

        {/* Verification Tab */}
        {permissions.canVerify && (
          <TabsContent value="verify" className="space-y-4">
            <IdentityVerification
              patientId={patientId}
              patientName={patientName}
              onVerificationCompleted={handleVerificationCompleted}
              enableCamera={true}
              confidenceThreshold={0.8}
            />
          </TabsContent>
        )}

        {/* Privacy Tab */}
        {permissions.canManagePrivacy && (
          <TabsContent value="privacy" className="space-y-4">
            <PrivacyControls
              patientId={patientId}
              patientName={patientName}
              onPrivacyUpdated={handlePrivacyUpdated}
              readOnly={false}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// Export individual components for standalone use
export {
  PhotoUpload,
  IdentityVerification,
  PhotoGallery,
  PrivacyControls
}

// Export types for external use
export type {
  PhotoRecognitionSystemProps
}