"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  FileImage, 
  Calendar as CalendarIcon,
  Shield,
  Eye,
  Download,
  Trash2,
  ZoomIn,
  RotateCcw,
  Info,
  Lock
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface PhotoMetadata {
  date: Date
  treatmentType: string
  category: 'before' | 'after' | 'during'
  notes: string
  tags: string[]
  anatomicalArea: string
}

interface UploadedPhoto {
  id: string
  fileName: string
  filePath: string
  publicUrl: string
  metadata: PhotoMetadata
  uploadDate: Date
  fileSize: number
  mimeType: string
  lgpdConsented: boolean
  patient_id: string
}

interface PhotoUploadSystemProps {
  patientId: string
  onPhotosUploaded?: (photos: UploadedPhoto[]) => void
  readonly?: boolean
  className?: string
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 10

const TREATMENT_TYPES = [
  'Preenchimento',
  'Botox',
  'Laser',
  'Peeling',
  'Harmonização Facial',
  'Limpeza de Pele',
  'Microagulhamento',
  'Radiofrequência',
  'Criolipólise',
  'Outro'
]

const ANATOMICAL_AREAS = [
  'Face Completa',
  'Testa',
  'Área dos Olhos',
  'Nariz',
  'Bochechas',
  'Lábios',
  'Queixo',
  'Pescoço',
  'Corpo',
  'Abdômen',
  'Braços',
  'Pernas',
  'Outro'
]

export function PhotoUploadSystem({ 
  patientId, 
  onPhotosUploaded,
  readonly = false,
  className 
}: PhotoUploadSystemProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<UploadedPhoto | null>(null)
  const [photoMetadata, setPhotoMetadata] = useState<PhotoMetadata>({
    date: new Date(),
    treatmentType: '',
    category: 'before',
    notes: '',
    tags: [],
    anatomicalArea: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  // Load existing photos
  useEffect(() => {
    loadExistingPhotos()
  }, [patientId])

  // Verificar consentimento LGPD para fotos
  useEffect(() => {
    checkLGPDConsent()
  }, [patientId])

  const checkLGPDConsent = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('lgpd_consents')
        .eq('id', patientId)
        .single()

      if (error) throw error

      const consents = data?.lgpd_consents as any
      const photoConsent = consents?.photo_consent || false
      setLgpdConsent(photoConsent)

      if (!photoConsent) {
        setError('Paciente não possui consentimento LGPD para armazenamento de fotos. Atualize o consentimento primeiro.')
      }
    } catch (err) {
      console.error('Erro ao verificar consentimento LGPD:', err)
      setError('Erro ao verificar consentimento LGPD')
    }
  }

  const loadExistingPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_photos')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from('patient-photos')
            .createSignedUrl(photo.file_path, 3600) // 1 hora

          return {
            id: photo.id,
            fileName: photo.file_name,
            filePath: photo.file_path,
            publicUrl: urlData?.signedUrl || '',
            metadata: photo.metadata as PhotoMetadata,
            uploadDate: new Date(photo.created_at),
            fileSize: photo.file_size,
            mimeType: photo.mime_type,
            lgpdConsented: photo.lgpd_consented,
            patient_id: photo.patient_id
          }
        })
      )

      setUploadedPhotos(photosWithUrls)
    } catch (err) {
      console.error('Erro ao carregar fotos:', err)
      setError('Erro ao carregar fotos existentes')
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (readonly || !lgpdConsent) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [readonly, lgpdConsent])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (readonly || !lgpdConsent) return

    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [readonly, lgpdConsent])

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`Tipo de arquivo não permitido: ${file.name}. Use apenas JPG, PNG, HEIC ou WebP.`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`Arquivo muito grande: ${file.name}. Máximo: 10MB.`)
        return false
      }
      return true
    })

    if (files.length + validFiles.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} arquivos permitidos`)
      return
    }

    setFiles(prev => [...prev, ...validFiles])
    setError(null)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const compressImage = (file: File, quality: number = 0.7): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Desenhar e comprimir
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, file.type, quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFiles = async () => {
    if (!lgpdConsent) {
      setError('Consentimento LGPD para fotos é obrigatório')
      return
    }

    if (files.length === 0) {
      setError('Selecione pelo menos uma foto')
      return
    }

    if (!photoMetadata.treatmentType || !photoMetadata.anatomicalArea) {
      setError('Preencha todos os campos obrigatórios (Tipo de Tratamento e Área Anatômica)')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Comprimir imagem
        const compressedBlob = await compressImage(file)
        
        // Gerar nome único
        const fileExt = file.name.split('.').pop()
        const fileName = `${patientId}/${Date.now()}-${index}.${fileExt}`
        
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('patient-photos')
          .upload(fileName, compressedBlob, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Salvar metadados no banco
        const { data: photoData, error: dbError } = await supabase
          .from('patient_photos')
          .insert({
            patient_id: patientId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            metadata: photoMetadata,
            lgpd_consented: lgpdConsent
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Atualizar progresso
        setUploadProgress(prev => prev + (100 / files.length))

        return photoData
      })

      await Promise.all(uploadPromises)

      setSuccess(`${files.length} foto(s) enviada(s) com sucesso!`)
      setFiles([])
      setPhotoMetadata({
        date: new Date(),
        treatmentType: '',
        category: 'before',
        notes: '',
        tags: [],
        anatomicalArea: ''
      })
      
      // Recarregar fotos
      await loadExistingPhotos()
      
      if (onPhotosUploaded) {
        onPhotosUploaded(uploadedPhotos)
      }

    } catch (err) {
      console.error('Erro no upload:', err)
      setError('Erro ao enviar fotos. Tente novamente.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deletePhoto = async (photoId: string, filePath: string) => {
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('patient-photos')
        .remove([filePath])

      if (storageError) throw storageError

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('patient_photos')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError

      // Atualizar lista local
      setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId))
      setSuccess('Foto deletada com sucesso')

    } catch (err) {
      console.error('Erro ao deletar foto:', err)
      setError('Erro ao deletar foto')
    }
  }

  const downloadPhoto = async (photo: UploadedPhoto) => {
    try {
      const { data, error } = await supabase.storage
        .from('patient-photos')
        .download(photo.filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Erro ao baixar foto:', err)
      setError('Erro ao baixar foto')
    }
  }

  if (!lgpdConsent) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            Sistema de Fotos Médicas
          </CardTitle>
          <CardDescription>
            Gerenciamento seguro de fotos com conformidade LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Consentimento LGPD Necessário</AlertTitle>
            <AlertDescription>
              O paciente deve fornecer consentimento específico para armazenamento de fotos médicas antes de prosseguir. 
              Atualize o consentimento LGPD do paciente primeiro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Sistema de Fotos Médicas
          <Badge variant="outline" className="text-green-600">
            LGPD Conforme
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload seguro de fotos médicas com metadados completos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Fotos</TabsTrigger>
            <TabsTrigger value="gallery">
              Galeria ({uploadedPhotos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {!readonly && (
              <>
                {/* Área de Upload */}
                <div
                  ref={dropRef}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        Arraste fotos aqui ou clique para selecionar
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        JPG, PNG, HEIC, WebP • Máximo 10MB por arquivo • Até {MAX_FILES} fotos
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Selecionar Fotos
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Arquivos Selecionados */}
                {files.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Arquivos Selecionados ({files.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileImage className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadados da Foto */}
                {files.length > 0 && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-sm font-medium">Informações das Fotos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Data */}
                      <div className="space-y-2">
                        <Label>Data da Foto</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !photoMetadata.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {photoMetadata.date ? (
                                format(photoMetadata.date, "PPP", { locale: ptBR })
                              ) : (
                                "Selecione uma data"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={photoMetadata.date}
                              onSelect={(date) => 
                                setPhotoMetadata(prev => ({ ...prev, date: date || new Date() }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Tipo de Tratamento */}
                      <div className="space-y-2">
                        <Label>Tipo de Tratamento *</Label>
                        <Select
                          value={photoMetadata.treatmentType}
                          onValueChange={(value) => 
                            setPhotoMetadata(prev => ({ ...prev, treatmentType: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tratamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {TREATMENT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Categoria */}
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={photoMetadata.category}
                          onValueChange={(value: 'before' | 'after' | 'during') => 
                            setPhotoMetadata(prev => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Antes</SelectItem>
                            <SelectItem value="during">Durante</SelectItem>
                            <SelectItem value="after">Depois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Área Anatômica */}
                      <div className="space-y-2">
                        <Label>Área Anatômica *</Label>
                        <Select
                          value={photoMetadata.anatomicalArea}
                          onValueChange={(value) => 
                            setPhotoMetadata(prev => ({ ...prev, anatomicalArea: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                          <SelectContent>
                            {ANATOMICAL_AREAS.map(area => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        placeholder="Observações sobre as fotos (opcional)"
                        value={photoMetadata.notes}
                        onChange={(e) => 
                          setPhotoMetadata(prev => ({ ...prev, notes: e.target.value }))
                        }
                        rows={3}
                      />
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Enviando fotos...</Label>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    {/* Botão de Upload */}
                    <Button
                      onClick={uploadFiles}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar {files.length} Foto(s)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {/* Galeria de Fotos */}
            {uploadedPhotos.length === 0 ? (
              <div className="text-center py-8">
                <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma foto encontrada</p>
                <p className="text-sm text-muted-foreground">
                  As fotos enviadas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative group">
                      {photo.publicUrl && (
                        <img
                          src={photo.publicUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadPhoto(photo)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {!readonly && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePhoto(photo.id, photo.filePath)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {photo.metadata.category === 'before' ? 'Antes' :
                             photo.metadata.category === 'after' ? 'Depois' : 'Durante'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(photo.uploadDate, "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{photo.metadata.treatmentType}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.metadata.anatomicalArea}
                        </p>
                        {photo.metadata.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {photo.metadata.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Visualização */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedPhoto.fileName}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="max-h-96 flex items-center justify-center">
                    <img
                      src={selectedPhoto.publicUrl}
                      alt={selectedPhoto.fileName}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Tratamento:</p>
                      <p className="text-muted-foreground">{selectedPhoto.metadata.treatmentType}</p>
                    </div>
                    <div>
                      <p className="font-medium">Categoria:</p>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.category === 'before' ? 'Antes' :
                         selectedPhoto.metadata.category === 'after' ? 'Depois' : 'Durante'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Área:</p>
                      <p className="text-muted-foreground">{selectedPhoto.metadata.anatomicalArea}</p>
                    </div>
                    <div>
                      <p className="font-medium">Data:</p>
                      <p className="text-muted-foreground">
                        {format(selectedPhoto.metadata.date, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    {selectedPhoto.metadata.notes && (
                      <div className="col-span-2">
                        <p className="font-medium">Observações:</p>
                        <p className="text-muted-foreground">{selectedPhoto.metadata.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}