'use client'

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input, } from '@/components/ui/input'
import { Label, } from '@/components/ui/label'
import { Progress, } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator, } from '@/components/ui/separator'
import { Switch, } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip'
import type { LGPDPhotoConsentStatus, TreatmentPhoto, TreatmentSession, } from '@/types/treatments'
import { motion, } from 'framer-motion'
import {
  Calendar,
  Camera,
  Download,
  Eye,
  EyeOff,
  Grid,
  Image as ImageIcon,
  Lock,
  MoreHorizontal,
  Search,
  Share,
  Shield,
  Trash2,
  Upload,
  Zap,
  ZoomIn,
} from 'lucide-react'
import { useState, } from 'react'

// Visual components maintaining NeonPro design
interface NeonGradientCardProps {
  children: React.ReactNode
  className?: string
}

const NeonGradientCard = ({
  children,
  className = '',
}: NeonGradientCardProps,) => (
  <motion.div
    animate={{ opacity: 1, y: 0, }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20, }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10">{children}</div>
  </motion.div>
)

// Props interface
interface BeforeAfterSecureGalleryProps {
  treatmentSessionId: string
  photos: TreatmentPhoto[]
  sessions?: TreatmentSession[]
  consentStatus: LGPDPhotoConsentStatus
  onPhotoUpload?: (
    file: File,
    type: 'before' | 'after' | 'during' | 'follow_up',
  ) => void
  onPhotoDelete?: (photoId: string,) => void
  onPhotoShare?: (photoId: string, expiryHours: number,) => void
  onConsentUpdate?: (newStatus: LGPDPhotoConsentStatus,) => void
  canEdit?: boolean
  canShare?: boolean
  showMetadata?: boolean
  enableComparison?: boolean
  className?: string
}

// Filter and view options
type PhotoFilter = 'all' | 'before' | 'after' | 'during' | 'follow_up'
type ViewMode = 'grid' | 'comparison' | 'timeline'

// Photo upload data
interface PhotoUploadData {
  file: File | null
  type: 'before' | 'after' | 'during' | 'follow_up'
  anatomicalRegion: string
  photoAngle: string
  lightingConditions: string
}

export function BeforeAfterSecureGallery({
  _treatmentSessionId: _treatmentSessionId,
  photos,
  sessions = [],
  consentStatus,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoShare,
  onConsentUpdate,
  canEdit = false,
  canShare = false,
  showMetadata = true,
  enableComparison = true,
  className = '',
}: BeforeAfterSecureGalleryProps,) {
  // State management
  const [viewMode, setViewMode,] = useState<ViewMode>('grid',)
  const [photoFilter, setPhotoFilter,] = useState<PhotoFilter>('all',)
  const [searchQuery, setSearchQuery,] = useState('',)
  const [selectedPhoto, setSelectedPhoto,] = useState<TreatmentPhoto | null>()
  const [showUploadDialog, setShowUploadDialog,] = useState(false,)
  const [uploadData, setUploadData,] = useState<PhotoUploadData>({
    file: undefined,
    type: 'before',
    anatomicalRegion: '',
    photoAngle: '',
    lightingConditions: '',
  },)
  const [privacyBlurred, setPrivacyBlurred,] = useState(true,)
  const [showShareDialog, setShowShareDialog,] = useState(false,)
  const [shareExpiryHours, setShareExpiryHours,] = useState(24,)

  // Filter photos based on current filters
  const filteredPhotos = photos.filter((photo,) => {
    const matchesFilter = photoFilter === 'all' || photo.photo_type === photoFilter
    const matchesSearch = searchQuery === ''
      || photo.anatomical_region
        .toLowerCase()
        .includes(searchQuery.toLowerCase(),)
      || photo.photo_angle.toLowerCase().includes(searchQuery.toLowerCase(),)
    return matchesFilter && matchesSearch
  },)

  // Group photos for comparison
  const beforePhotos = photos.filter((p,) => p.photo_type === 'before')
  const afterPhotos = photos.filter((p,) => p.photo_type === 'after')

  // Get consent status information
  const getConsentStatusInfo = (status: LGPDPhotoConsentStatus,) => {
    switch (status) {
      case 'granted': {
        return {
          label: 'Consentimento Concedido',
          color: 'text-green-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Fotos podem ser capturadas e armazenadas',
        }
      }
      case 'withdrawn': {
        return {
          label: 'Consentimento Retirado',
          color: 'text-red-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Fotos existentes serão anonimizadas',
        }
      }
      case 'expired': {
        return {
          label: 'Consentimento Expirado',
          color: 'text-orange-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Renovação de consentimento necessária',
        }
      }
      case 'pending': {
        return {
          label: 'Aguardando Consentimento',
          color: 'text-yellow-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Consentimento LGPD ainda não fornecido',
        }
      }
      case 'refused': {
        return {
          label: 'Consentimento Recusado',
          color: 'text-red-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Paciente não autoriza documentação fotográfica',
        }
      }
      default: {
        return {
          label: 'Status Desconhecido',
          color: 'text-gray-500',
          icon: <Shield className="h-4 w-4" />,
          description: 'Status de consentimento não definido',
        }
      }
    }
  }

  const consentInfo = getConsentStatusInfo(consentStatus,)

  // Photo upload handler
  const handlePhotoUpload = async () => {
    if (!(uploadData.file && onPhotoUpload)) {
      return
    }

    await onPhotoUpload(uploadData.file, uploadData.type,)
    setShowUploadDialog(false,)
    setUploadData({
      file: undefined,
      type: 'before',
      anatomicalRegion: '',
      photoAngle: '',
      lightingConditions: '',
    },)
  }

  // Photo share handler
  const handlePhotoShare = async (photo: TreatmentPhoto,) => {
    if (!onPhotoShare) {
      return
    }

    await onPhotoShare(photo.id, shareExpiryHours,)
    setShowShareDialog(false,)
  }

  // File input handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>,) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadData((prev,) => ({ ...prev, file, }))
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Consent Status */}
      <NeonGradientCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                Galeria Segura - Antes e Depois
              </CardTitle>
              <CardDescription className="text-slate-300">
                Documentação fotográfica com proteção LGPD
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${consentInfo.color}`}>
                {consentInfo.icon}
                <span className="font-medium text-sm">{consentInfo.label}</span>
              </div>
              {canEdit && consentStatus === 'granted' && (
                <Button onClick={() => setShowUploadDialog(true,)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Foto
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-blue-100">
              {consentInfo.description}
              {consentStatus === 'granted' && (
                <>
                  <br />
                  <strong>Proteções LGPD:</strong>{' '}
                  Anonimização automática, criptografia de armazenamento, acesso auditado e controle
                  de retenção.
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </NeonGradientCard>
      {/* Consent Management - Show if not granted */}
      {consentStatus !== 'granted' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gerenciamento de Consentimento LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para utilizar a documentação fotográfica, é necessário o consentimento LGPD do
              paciente conforme a Lei 13.709/2018.
            </p>

            {onConsentUpdate && (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => onConsentUpdate('granted',)}
                >
                  Solicitar Consentimento
                </Button>
                {consentStatus === 'expired' && (
                  <Button
                    className="flex-1"
                    onClick={() => onConsentUpdate('granted',)}
                    variant="outline"
                  >
                    Renovar Consentimento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Gallery Controls - Only show if consent granted */}
      {consentStatus === 'granted' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    className="w-64"
                    onChange={(e,) => setSearchQuery(e.target.value,)}
                    placeholder="Buscar por região anatômica..."
                    value={searchQuery}
                  />
                </div>
                <Select
                  onValueChange={(value,) => setPhotoFilter(value as PhotoFilter,)}
                  value={photoFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Fotos</SelectItem>
                    <SelectItem value="before">Antes</SelectItem>
                    <SelectItem value="after">Depois</SelectItem>
                    <SelectItem value="during">Durante</SelectItem>
                    <SelectItem value="follow_up">Acompanhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm" htmlFor="privacy-blur">
                    Privacidade
                  </Label>
                  <Switch
                    checked={privacyBlurred}
                    id="privacy-blur"
                    onCheckedChange={setPrivacyBlurred}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {privacyBlurred
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {privacyBlurred
                            ? 'Fotos com desfoque de privacidade'
                            : 'Fotos sem desfoque'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Separator className="h-6" orientation="vertical" />

                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setViewMode('grid',)}
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  {enableComparison && (
                    <Button
                      onClick={() => setViewMode('comparison',)}
                      size="sm"
                      variant={viewMode === 'comparison' ? 'default' : 'outline'}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setViewMode('timeline',)}
                    size="sm"
                    variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
      {/* Photo Gallery Content */}
      {consentStatus === 'granted' && (
        <div className="space-y-6">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPhotos.map((photo,) => (
                <Card
                  className="group transition-all hover:shadow-lg"
                  key={photo.id}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {photo.photo_type === 'before' && 'Antes'}
                        {photo.photo_type === 'after' && 'Depois'}
                        {photo.photo_type === 'during' && 'Durante'}
                        {photo.photo_type === 'follow_up' && 'Acompanhamento'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedPhoto(photo,)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          {canShare && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPhoto(photo,)
                                setShowShareDialog(true,)
                              }}
                            >
                              <Share className="mr-2 h-4 w-4" />
                              Compartilhar
                            </DropdownMenuItem>
                          )}
                          {showMetadata && (
                            <DropdownMenuItem
                              onClick={() => setSelectedPhoto(photo,)}
                            >
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Metadados
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {canEdit && onPhotoDelete && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onPhotoDelete(photo.id,)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      {/* Placeholder for actual image */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                        <div className="text-center">
                          <ImageIcon className="mx-auto mb-2 h-12 w-12 text-slate-500" />
                          <p className="text-slate-600 text-sm">
                            {privacyBlurred
                              ? 'Foto Protegida'
                              : 'Imagem Médica'}
                          </p>
                          {privacyBlurred && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-lg">
                              <Lock className="h-8 w-8 text-slate-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Watermark overlay */}
                      {photo.watermarked && (
                        <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
                          NeonPro Healthcare
                        </div>
                      )}

                      {/* Privacy indicator */}
                      {photo.face_blurred && (
                        <div className="absolute top-2 left-2">
                          <Badge className="text-xs" variant="secondary">
                            <Shield className="mr-1 h-3 w-3" />
                            Privacidade LGPD
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Região:</span>
                        <span className="font-medium">
                          {photo.anatomical_region}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {new Date(photo.uploaded_at,).toLocaleDateString(
                            'pt-BR',
                          )}
                        </span>
                      </div>
                      {photo.access_count > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Acessos:
                          </span>
                          <span className="font-medium">
                            {photo.access_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPhotos.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    Nenhuma foto encontrada
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {photoFilter === 'all'
                      ? 'Nenhuma foto foi adicionada ainda.'
                      : `Nenhuma foto do tipo "${photoFilter}" encontrada.`}
                  </p>
                  {canEdit && (
                    <Button onClick={() => setShowUploadDialog(true,)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Adicionar Primeira Foto
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {viewMode === 'comparison' && enableComparison && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Before Photos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">Antes</Badge>
                      Fotos Iniciais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {beforePhotos.map((photo,) => (
                        <div
                          className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                          key={photo.id}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                            {privacyBlurred && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-lg">
                                <Lock className="h-6 w-6 text-slate-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {beforePhotos.length === 0 && (
                        <div className="col-span-2 py-8 text-center">
                          <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">
                            Nenhuma foto &quot;antes&quot; disponível
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* After Photos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">Depois</Badge>
                      Fotos de Resultado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {afterPhotos.map((photo,) => (
                        <div
                          className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                          key={photo.id}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                            {privacyBlurred && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-lg">
                                <Lock className="h-6 w-6 text-slate-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {afterPhotos.length === 0 && (
                        <div className="col-span-2 py-8 text-center">
                          <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">
                            Nenhuma foto &quot;depois&quot; disponível
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Analysis */}
              {beforePhotos.length > 0 && afterPhotos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Análise de Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="font-bold text-2xl text-green-600">
                          {beforePhotos.length}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Fotos Iniciais
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-blue-600">
                          {afterPhotos.length}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Fotos de Resultado
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-purple-600">
                          {Math.round(
                            (afterPhotos.length / beforePhotos.length) * 100,
                          )}
                          %
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Documentação Completa
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {viewMode === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Linha do Tempo Fotográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session, _index,) => {
                    const sessionPhotos = photos.filter(
                      (p,) => p.treatment_session_id === session.id,
                    )
                    return (
                      <div
                        className="flex gap-4 rounded-lg border p-4"
                        key={session.id}
                      >
                        <div className="w-32 flex-shrink-0">
                          <div className="font-medium text-sm">
                            Sessão {session.session_number}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(
                              session.actual_date || session.scheduled_date,
                            ).toLocaleDateString('pt-BR',)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-2 overflow-x-auto">
                            {sessionPhotos.map((photo,) => (
                              <div
                                className="h-16 w-16 flex-shrink-0 rounded border bg-muted"
                                key={photo.id}
                              >
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  {privacyBlurred && (
                                    <div className="absolute inset-0 rounded bg-white/30 backdrop-blur-sm">
                                      <Lock className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-4 w-4 transform text-slate-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {sessionPhotos.length === 0 && (
                              <div className="text-muted-foreground text-sm">
                                Nenhuma foto desta sessão
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  },)}
                  {sessions.length === 0 && (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        Nenhuma sessão registrada
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )} {/* Photo Upload Dialog */}
      <Dialog onOpenChange={setShowUploadDialog} open={showUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Foto Clínica</DialogTitle>
            <DialogDescription>
              Upload de foto com proteção LGPD automática e metadados clínicos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Proteções Automáticas:</strong>{' '}
                Desfoque facial, watermark da clínica, criptografia de armazenamento e audit trail
                de acesso.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photo-file">Arquivo da Foto *</Label>
                <Input
                  accept="image/*"
                  id="photo-file"
                  onChange={handleFileSelect}
                  required
                  type="file"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo-type">Tipo da Foto *</Label>
                <Select
                  onValueChange={(value,) =>
                    setUploadData((prev,) => ({
                      ...prev,
                      type: value as unknown,
                    }))}
                  value={uploadData.type}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Antes do Tratamento</SelectItem>
                    <SelectItem value="during">Durante o Tratamento</SelectItem>
                    <SelectItem value="after">Após o Tratamento</SelectItem>
                    <SelectItem value="follow_up">Acompanhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anatomical-region">Região Anatômica *</Label>
                <Input
                  id="anatomical-region"
                  onChange={(e,) =>
                    setUploadData((prev,) => ({
                      ...prev,
                      anatomicalRegion: e.target.value,
                    }))}
                  placeholder="Ex: Face, Abdômen, Braços"
                  required
                  value={uploadData.anatomicalRegion}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo-angle">Ângulo da Foto *</Label>
                <Input
                  id="photo-angle"
                  onChange={(e,) =>
                    setUploadData((prev,) => ({
                      ...prev,
                      photoAngle: e.target.value,
                    }))}
                  placeholder="Ex: Frontal, Lateral Direita, Perfil"
                  required
                  value={uploadData.photoAngle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lighting-conditions">
                Condições de Iluminação
              </Label>
              <Input
                id="lighting-conditions"
                onChange={(e,) =>
                  setUploadData((prev,) => ({
                    ...prev,
                    lightingConditions: e.target.value,
                  }))}
                placeholder="Ex: Luz natural, Flash, Iluminação controlada"
                value={uploadData.lightingConditions}
              />
            </div>

            <Alert>
              <ImageIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Padronização Fotográfica:</strong>{' '}
                Para melhores resultados de comparação, mantenha distância, ângulo e iluminação
                consistentes entre as sessões.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => setShowUploadDialog(false,)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!(
                  uploadData.file
                  && uploadData.anatomicalRegion
                  && uploadData.photoAngle
                )}
                onClick={handlePhotoUpload}
              >
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Photo Share Dialog */}
      <Dialog onOpenChange={setShowShareDialog} open={showShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Foto Segura</DialogTitle>
            <DialogDescription>
              Gerar link temporário com controle de acesso LGPD.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Compartilhamento Seguro:</strong>{' '}
                Link temporário com expiração automática e auditoria de acesso conforme LGPD.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="expiry-hours">Tempo de Expiração</Label>
              <Select
                onValueChange={(value,) => setShareExpiryHours(Number.parseInt(value, 10,),)}
                value={shareExpiryHours.toString()}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="72">3 dias</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground text-sm">
              <strong>Recursos do Link:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Expiração automática após o período selecionado</li>
                <li>Rastreamento de acessos para auditoria</li>
                <li>Watermark de proteção da clínica</li>
                <li>Impossibilidade de download direto</li>
                <li>Conformidade com diretrizes LGPD</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => setShowShareDialog(false,)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => selectedPhoto && handlePhotoShare(selectedPhoto,)}
              >
                <Share className="mr-2 h-4 w-4" />
                Gerar Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Photo Detail Dialog */}
      <Dialog
        onOpenChange={() => setSelectedPhoto(undefined,)}
        open={Boolean(selectedPhoto,)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Foto</DialogTitle>
            <DialogDescription>
              Informações completas e metadados clínicos
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Photo Display */}
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-4 h-16 w-16 text-slate-500" />
                        <p className="font-medium text-lg text-slate-600">
                          {selectedPhoto.photo_type === 'before'
                            && 'Foto Antes'}
                          {selectedPhoto.photo_type === 'after'
                            && 'Foto Depois'}
                          {selectedPhoto.photo_type === 'during'
                            && 'Foto Durante'}
                          {selectedPhoto.photo_type === 'follow_up'
                            && 'Foto Acompanhamento'}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {selectedPhoto.anatomical_region}
                        </p>
                        {privacyBlurred && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-lg">
                            <div className="text-center">
                              <Lock className="mx-auto mb-2 h-12 w-12 text-slate-600" />
                              <p className="text-slate-600 text-sm">
                                Proteção LGPD Ativada
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedPhoto.watermarked && (
                      <div className="absolute right-4 bottom-4 rounded bg-black/70 px-3 py-2 text-sm text-white">
                        NeonPro Healthcare
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Seguro
                    </Button>
                    {canShare && (
                      <Button
                        className="flex-1"
                        onClick={() => setShowShareDialog(true,)}
                        size="sm"
                        variant="outline"
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Compartilhar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4">
                  <Tabs className="w-full" defaultValue="clinical">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clinical">Clínico</TabsTrigger>
                      <TabsTrigger value="technical">Técnico</TabsTrigger>
                      <TabsTrigger value="security">Segurança</TabsTrigger>
                    </TabsList>

                    <TabsContent className="space-y-3" value="clinical">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium">
                            {selectedPhoto.photo_type === 'before'
                              && 'Antes do Tratamento'}
                            {selectedPhoto.photo_type === 'after'
                              && 'Após Tratamento'}
                            {selectedPhoto.photo_type === 'during'
                              && 'Durante Tratamento'}
                            {selectedPhoto.photo_type === 'follow_up'
                              && 'Acompanhamento'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Região:</span>
                          <p className="font-medium">
                            {selectedPhoto.anatomical_region}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ângulo:</span>
                          <p className="font-medium">
                            {selectedPhoto.photo_angle}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Iluminação:
                          </span>
                          <p className="font-medium">
                            {selectedPhoto.lighting_conditions}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Upload:</span>
                          <p className="font-medium">
                            {new Date(
                              selectedPhoto.uploaded_at,
                            ).toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Por:</span>
                          <p className="font-medium">
                            {selectedPhoto.uploaded_by}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent className="space-y-3" value="technical">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Arquivo:
                          </span>
                          <p className="font-medium">
                            {selectedPhoto.original_filename}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Tamanho:
                          </span>
                          <p className="font-medium">
                            {(
                              selectedPhoto.file_size_bytes
                              / 1024
                              / 1024
                            ).toFixed(2,)} MB
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Dimensões:
                          </span>
                          <p className="font-medium">
                            {selectedPhoto.image_width}x
                            {selectedPhoto.image_height}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hash:</span>
                          <p className="font-medium font-mono text-xs">
                            {selectedPhoto.file_hash.slice(0, 12,)}...
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent className="space-y-3" value="security">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Consentimento:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.lgpd_consent_id}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Escopo:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.consent_scope
                                  === 'clinical_only' && 'Apenas Clínico'}
                              {selectedPhoto.consent_scope
                                  === 'marketing_allowed' && 'Marketing Permitido'}
                              {selectedPhoto.consent_scope
                                  === 'research_allowed' && 'Pesquisa Permitida'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Anonimização:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.anonymization_applied
                                ? 'Aplicada'
                                : 'Não Aplicada'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Desfoque Facial:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.face_blurred ? 'Ativo' : 'Inativo'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Acessos:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.access_count}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Último Acesso:
                            </span>
                            <p className="font-medium">
                              {selectedPhoto.last_accessed
                                ? new Date(
                                  selectedPhoto.last_accessed,
                                ).toLocaleDateString('pt-BR',)
                                : 'Nunca'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Retenção de Dados:
                            </span>
                            <span className="font-medium text-sm">
                              {selectedPhoto.retention_period_days} dias
                            </span>
                          </div>
                          {selectedPhoto.deletion_scheduled_date && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-sm">
                                Exclusão Agendada:
                              </span>
                              <span className="font-medium text-sm">
                                {new Date(
                                  selectedPhoto.deletion_scheduled_date,
                                ).toLocaleDateString('pt-BR',)}
                              </span>
                            </div>
                          )}
                          <Progress
                            className="h-2"
                            value={100
                              - ((new Date(
                                  selectedPhoto.deletion_scheduled_date
                                    || Date.now(),
                                ).getTime()
                                  - Date.now())
                                  / (selectedPhoto.retention_period_days
                                    * 24
                                    * 60
                                    * 60
                                    * 1000))
                                * 100}
                          />
                        </div>

                        <Alert className="border-green-500/50 bg-green-500/10">
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            Esta foto está em conformidade com a LGPD e protegida por criptografia
                            de ponta a ponta.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BeforeAfterSecureGallery
