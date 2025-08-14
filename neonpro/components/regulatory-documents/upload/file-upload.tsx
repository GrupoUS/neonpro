'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, X, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void
  onUploadError?: (error: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
  completed?: boolean
  url?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 1,
  disabled = false
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0] // Single file upload for regulatory documents
    
    // Validate file size
    if (file.size > maxSize) {
      const error = `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
      toast.error(error)
      onUploadError?.(error)
      return
    }

    setIsUploading(true)
    
    const uploadingFile: UploadingFile = {
      file,
      progress: 0
    }
    
    setUploadingFiles([uploadingFile])

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API endpoint
      const response = await fetch('/api/regulatory-documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Upload failed')
      }

      const result = await response.json()
      
      // Update file state to completed
      setUploadingFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, progress: 100, completed: true, url: result.url }
          : f
      ))

      // Call success callback
      onUploadComplete(result.url, file.name, file.size)
      
      toast.success('Arquivo enviado com sucesso!')

      // Clear files after a delay
      setTimeout(() => {
        setUploadingFiles([])
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload'
      
      setUploadingFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, error: errorMessage }
          : f
      ))
      
      toast.error(errorMessage)
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [maxSize, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: disabled || isUploading,
    multiple: false
  })

  const removeFile = (fileToRemove: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== fileToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center text-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive 
                  ? 'Solte o arquivo aqui...'
                  : 'Clique ou arraste o arquivo aqui'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, DOCX ou imagens até {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.name}>
                  {file.name}: {errors.map(e => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploadingFile.completed ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : uploadingFile.error ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadingFile.file)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {!uploadingFile.completed && !uploadingFile.error && (
                  <div className="mt-2">
                    <Progress value={uploadingFile.progress} className="h-2" />
                  </div>
                )}

                {uploadingFile.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {uploadingFile.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}