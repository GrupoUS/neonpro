'use client'

/**
 * Photo Upload Component with Facial Recognition
 * Handles patient photo upload with real-time recognition feedback
 * 
 * @author APEX Master Developer
 */

import React, { useState, useRef, useCallback } from 'react'
import { Upload, Camera, AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface PhotoUploadProps {
  patientId: string
  onUploadSuccess?: (result: any) => void
  onUploadError?: (error: string) => void
  allowedTypes?: string[]
  maxFileSize?: number
  enableRecognition?: boolean
}

interface UploadResult {
  photoId: string
  metadata: {
    fileName: string
    fileSize: number
    dimensions: { width: number; height: number }
    quality: {
      score: number
      issues: string[]
      recommendations: string[]
    }
  }
  recognition?: {
    success: boolean
    confidence: number
    matchesFound: number
  }
}

const PHOTO_TYPES = [
  { value: 'profile', label: 'Foto de Perfil' },
  { value: 'before', label: 'Antes do Tratamento' },
  { value: 'after', label: 'Depois do Tratamento' },
  { value: 'progress', label: 'Progresso' },
  { value: 'document', label: 'Documento' },
  { value: 'other', label: 'Outro' }
]

export function PhotoUpload({
  patientId,
  onUploadSuccess,
  onUploadError,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  enableRecognition = true
}: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoType, setPhotoType] = useState<string>('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [enableFacialRecognition, setEnableFacialRecognition] = useState(enableRecognition)
  const [showPreview, setShowPreview] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas arquivos JPEG, PNG e WebP são permitidos.',
        variant: 'destructive'
      })
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo deve ter no máximo ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    setUploadResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [allowedTypes, maxFileSize, toast])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const uploadPhoto = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)
      formData.append('patientId', patientId)
      formData.append('photoType', photoType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/patients/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadResult(result.data)
      
      toast({
        title: 'Upload realizado com sucesso!',
        description: enableFacialRecognition && result.data.recognition
          ? `Reconhecimento facial: ${result.data.recognition.confidence}% de confiança`
          : 'Foto enviada com sucesso.'
      })

      onUploadSuccess?.(result.data)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: 'Erro no upload',
        description: errorMessage,
        variant: 'destructive'
      })
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload de Foto do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="photo-type">Tipo de Foto</Label>
          <Select value={photoType} onValueChange={setPhotoType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de foto" />
            </SelectTrigger>
            <SelectContent>
              {PHOTO_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Facial Recognition Toggle */}
        {enableRecognition && (
          <div className="flex items-center space-x-2">
            <Switch
              id="facial-recognition"
              checked={enableFacialRecognition}
              onCheckedChange={setEnableFacialRecognition}
            />
            <Label htmlFor="facial-recognition">
              Habilitar reconhecimento facial
            </Label>
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {Math.round(selectedFile.size / 1024)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">Arraste uma foto aqui</p>
                <p className="text-gray-500">ou clique para selecionar</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewUrl && showPreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pré-visualização</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="relative max-w-md mx-auto">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Enviando...</Label>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Upload realizado com sucesso!</p>
                
                {uploadResult.recognition && (
                  <div className="flex items-center gap-2">
                    <Badge variant={uploadResult.recognition.success ? 'default' : 'secondary'}>
                      Reconhecimento: {uploadResult.recognition.confidence}%
                    </Badge>
                    {uploadResult.recognition.matchesFound > 0 && (
                      <Badge variant="outline">
                        {uploadResult.recognition.matchesFound} correspondência(s)
                      </Badge>
                    )}
                  </div>
                )}
                
                {uploadResult.metadata.quality.score < 0.7 && (
                  <div className="text-sm text-amber-600">
                    <p>Qualidade da imagem pode ser melhorada:</p>
                    <ul className="list-disc list-inside">
                      {uploadResult.metadata.quality.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={uploadPhoto}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Foto
              </>
            )}
          </Button>
          
          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              onClick={resetUpload}
              disabled={isUploading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
