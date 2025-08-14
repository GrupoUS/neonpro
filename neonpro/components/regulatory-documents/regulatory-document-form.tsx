'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Upload, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { useRegulatoryCategories } from '@/hooks/use-regulatory-categories'
import { cn } from '@/lib/utils'
import type { RegulatoryDocument, CreateDocumentRequest, UpdateDocumentRequest } from '@/types/regulatory-documents'

const documentFormSchema = z.object({
  document_type: z.string().min(1, 'Tipo do documento é obrigatório'),
  document_category: z.string().min(1, 'Categoria é obrigatória'),
  authority: z.string().min(1, 'Autoridade é obrigatória'),
  document_number: z.string().optional(),
  issue_date: z.date({ required_error: 'Data de emissão é obrigatória' }),
  expiration_date: z.date().optional(),
  status: z.enum(['valid', 'expiring', 'expired', 'pending']).default('pending'),
  associated_professional_id: z.string().optional(),
  associated_equipment_id: z.string().optional(),
})

type DocumentFormData = z.infer<typeof documentFormSchema>

interface RegulatoryDocumentFormProps {
  document?: RegulatoryDocument
  onSubmit: (data: CreateDocumentRequest | UpdateDocumentRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function RegulatoryDocumentForm({
  document,
  onSubmit,
  onCancel,
  loading = false
}: RegulatoryDocumentFormProps) {
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
    size: number
  } | null>(null)
  const [uploading, setUploading] = useState(false)

  const { categories, authorities, groupedCategories } = useRegulatoryCategories()
  
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      document_type: document?.document_type || '',
      document_category: document?.document_category || '',
      authority: document?.authority || '',
      document_number: document?.document_number || '',
      issue_date: document ? new Date(document.issue_date) : undefined,
      expiration_date: document?.expiration_date ? new Date(document.expiration_date) : undefined,
      status: document?.status || 'pending',
      associated_professional_id: document?.associated_professional_id || '',
      associated_equipment_id: document?.associated_equipment_id || '',
    }
  })

  const selectedAuthority = form.watch('authority')
  const selectedCategory = form.watch('document_category')

  // Update authority when category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(cat => cat.name === selectedCategory)
      if (category && category.authority_name !== selectedAuthority) {
        form.setValue('authority', category.authority_name)
      }
    }
  }, [selectedCategory, categories, selectedAuthority, form])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use: PDF, JPG, PNG, WebP, DOC, DOCX')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', selectedCategory || 'general')
      if (document?.id) {
        formData.append('document_id', document.id)
      }

      const response = await fetch('/api/regulatory-documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const result = await response.json()
      setUploadedFile({
        url: result.file.url,
        name: result.file.name,
        size: result.file.size
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedFile = async () => {
    if (!uploadedFile) return

    try {
      await fetch('/api/regulatory-documents/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: uploadedFile.url.replace('/storage/v1/object/public/documents/', ''),
          documentId: document?.id
        }),
      })

      setUploadedFile(null)
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const handleSubmit = async (data: DocumentFormData) => {
    const submitData = {
      ...data,
      issue_date: data.issue_date.toISOString().split('T')[0],
      expiration_date: data.expiration_date?.toISOString().split('T')[0],
      file_url: uploadedFile?.url,
      file_name: uploadedFile?.name,
      file_size: uploadedFile?.size,
      // Remove empty strings
      document_number: data.document_number || undefined,
      associated_professional_id: data.associated_professional_id || undefined,
      associated_equipment_id: data.associated_equipment_id || undefined,
    }

    await onSubmit(submitData)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {document ? 'Editar Documento Regulatório' : 'Novo Documento Regulatório'}
        </CardTitle>
        <CardDescription>
          {document 
            ? 'Atualize as informações do documento regulatório'
            : 'Adicione um novo documento de compliance ou certificação'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Type */}
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Documento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Alvará Sanitário, Licença de Funcionamento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="document_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(groupedCategories).map(([authority, cats]) => (
                          <div key={authority}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              {authority}
                            </div>
                            {cats.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Authority */}
              <FormField
                control={form.control}
                name="authority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autoridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a autoridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {authorities.map((authority) => (
                          <SelectItem key={authority.authority_code} value={authority.authority_name}>
                            {authority.authority_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Number */}
              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Documento (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 12345/2024"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Issue Date */}
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Emissão</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Validade (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="valid">Válido</SelectItem>
                        <SelectItem value="expiring">Expirando</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Arquivo do Documento</Label>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                      >
                        Clique para fazer upload
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, WebP, DOC, DOCX (máx. 10MB)
                      </p>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="mt-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Fazendo upload...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeUploadedFile}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" />
                    Remover
                  </Button>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="min-w-[120px]"
              >
                {loading ? 'Salvando...' : document ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}