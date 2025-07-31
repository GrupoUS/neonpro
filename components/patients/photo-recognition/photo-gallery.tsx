'use client'

/**
 * Patient Photo Gallery Component
 * Displays patient photos with privacy controls and management features
 * 
 * @author APEX Master Developer
 */

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Download, Trash2, Shield, Calendar, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface PhotoGalleryProps {
  patientId: string
  patientName: string
  onPhotoDeleted?: (photoId: string) => void
  allowDelete?: boolean
  allowDownload?: boolean
}

interface PatientPhoto {
  id: string
  fileName: string
  photoType: string
  fileSize: number
  dimensions: { width: number; height: number }
  uploadedAt: string
  uploadedBy: string
  storageUrl: string
  metadata: {
    quality: {
      score: number
      issues: string[]
    }
    facialFeatures?: {
      detected: boolean
      confidence: number
    }
  }
}

interface PrivacyControls {
  allowFacialRecognition: boolean
  allowPhotoSharing: boolean
  dataRetentionPeriod: number
  accessLevel: 'public' | 'restricted' | 'private'
  consentGiven: boolean
  consentDate: string
}

const PHOTO_TYPE_LABELS = {
  profile: 'Perfil',
  before: 'Antes',
  after: 'Depois',
  progress: 'Progresso',
  document: 'Documento',
  other: 'Outro'
}

const PHOTO_TYPE_COLORS = {
  profile: 'bg-blue-100 text-blue-800',
  before: 'bg-orange-100 text-orange-800',
  after: 'bg-green-100 text-green-800',
  progress: 'bg-purple-100 text-purple-800',
  document: 'bg-gray-100 text-gray-800',
  other: 'bg-yellow-100 text-yellow-800'
}

export function PhotoGallery({
  patientId,
  patientName,
  onPhotoDeleted,
  allowDelete = true,
  allowDownload = true
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PatientPhoto[]>([])
  const [privacyControls, setPrivacyControls] = useState<PrivacyControls | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhotoType, setSelectedPhotoType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<PatientPhoto | null>(null)
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    loadPhotos()
    loadPrivacyControls()
  }, [patientId])

  const loadPhotos = async () => {
    try {
      const response = await fetch(
        `/api/patients/photos/upload?patientId=${patientId}${selectedPhotoType !== 'all' ? `&photoType=${selectedPhotoType}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load photos')
      }

      const result = await response.json()
      setPhotos(result.data || [])
    } catch (error) {
      toast({
        title: 'Erro ao carregar fotos',
        description: 'Não foi possível carregar as fotos do paciente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPrivacyControls = async () => {
    try {
      const response = await fetch(
        `/api/patients/photos/privacy?patientId=${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()
        setPrivacyControls(result.data)
      }
    } catch (error) {
      console.error('Error loading privacy controls:', error)
    }
  }

  const updatePrivacyControls = async (newControls: Partial<PrivacyControls>) => {
    try {
      const response = await fetch('/api/patients/photos/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify({
          patientId,
          privacyControls: { ...privacyControls, ...newControls }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update privacy controls')
      }

      const result = await response.json()
      setPrivacyControls(result.data)
      
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de privacidade foram atualizadas com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar configurações',
        description: 'Não foi possível atualizar as configurações de privacidade.',
        variant: 'destructive'
      })
    }
  }

  const deletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(
        `/api/patients/photos/privacy?photoId=${photoId}&reason=user_request`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      setPhotos(photos.filter(photo => photo.id !== photoId))
      onPhotoDeleted?.(photoId)
      
      toast({
        title: 'Foto excluída',
        description: 'A foto foi excluída com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir foto',
        description: 'Não foi possível excluir a foto.',
        variant: 'destructive'
      })
    }
  }

  const downloadPhoto = async (photo: PatientPhoto) => {
    try {
      const response = await fetch(photo.storageUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Download iniciado',
        description: 'O download da foto foi iniciado.'
      })
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível fazer o download da foto.',
        variant: 'destructive'
      })
    }
  }

  const filteredPhotos = photos.filter(photo => 
    selectedPhotoType === 'all' || photo.photoType === selectedPhotoType
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Galeria de Fotos - {patientName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivacyDialog(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacidade
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {/* Photo Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedPhotoType} onValueChange={setSelectedPhotoType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(PHOTO_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              {filteredPhotos.length} foto(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Display */}
      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma foto encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              {viewMode === 'grid' ? (
                <div>
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={photo.storageUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={PHOTO_TYPE_COLORS[photo.photoType as keyof typeof PHOTO_TYPE_COLORS]}>
                        {PHOTO_TYPE_LABELS[photo.photoType as keyof typeof PHOTO_TYPE_LABELS]}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate">{photo.fileName}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(photo.fileSize)}</span>
                        <span>{formatDate(photo.uploadedAt)}</span>
                      </div>
                      <div className="flex gap-1">
                        {allowDownload && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPhoto(photo)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        {allowDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir foto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePhoto(photo.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={photo.storageUrl}
                      alt={photo.fileName}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{photo.fileName}</p>
                        <Badge className={PHOTO_TYPE_COLORS[photo.photoType as keyof typeof PHOTO_TYPE_COLORS]}>
                          {PHOTO_TYPE_LABELS[photo.photoType as keyof typeof PHOTO_TYPE_LABELS]}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>{formatFileSize(photo.fileSize)} • {photo.dimensions.width}x{photo.dimensions.height}</p>
                        <p>{formatDate(photo.uploadedAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {allowDownload && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPhoto(photo)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {allowDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir foto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePhoto(photo.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.fileName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedPhoto.storageUrl}
                alt={selectedPhoto.fileName}
                className="w-full h-auto max-h-96 object-contain rounded"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Tipo:</strong> {PHOTO_TYPE_LABELS[selectedPhoto.photoType as keyof typeof PHOTO_TYPE_LABELS]}</p>
                  <p><strong>Tamanho:</strong> {formatFileSize(selectedPhoto.fileSize)}</p>
                  <p><strong>Dimensões:</strong> {selectedPhoto.dimensions.width}x{selectedPhoto.dimensions.height}</p>
                </div>
                <div>
                  <p><strong>Enviado em:</strong> {formatDate(selectedPhoto.uploadedAt)}</p>
                  <p><strong>Qualidade:</strong> {Math.round(selectedPhoto.metadata.quality.score * 100)}%</p>
                  {selectedPhoto.metadata.facialFeatures?.detected && (
                    <p><strong>Rosto detectado:</strong> {Math.round(selectedPhoto.metadata.facialFeatures.confidence * 100)}%</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Privacy Controls Dialog */}
      {privacyControls && (
        <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações de Privacidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="facial-recognition">Permitir reconhecimento facial</Label>
                <Switch
                  id="facial-recognition"
                  checked={privacyControls.allowFacialRecognition}
                  onCheckedChange={(checked) => 
                    updatePrivacyControls({ allowFacialRecognition: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="photo-sharing">Permitir compartilhamento de fotos</Label>
                <Switch
                  id="photo-sharing"
                  checked={privacyControls.allowPhotoSharing}
                  onCheckedChange={(checked) => 
                    updatePrivacyControls({ allowPhotoSharing: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de acesso</Label>
                <Select 
                  value={privacyControls.accessLevel} 
                  onValueChange={(value) => 
                    updatePrivacyControls({ accessLevel: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="restricted">Restrito</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                <p>Consentimento dado em: {formatDate(privacyControls.consentDate)}</p>
                <p>Retenção de dados: {privacyControls.dataRetentionPeriod} dias</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}