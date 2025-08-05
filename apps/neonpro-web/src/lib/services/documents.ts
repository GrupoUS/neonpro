import { createClient } from '@/lib/supabase/client'

export interface Document {
  id: string
  entity_type: 'vendor' | 'payable'
  entity_id: string
  document_type: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface UploadDocumentData {
  file: File
  entityType: 'vendor' | 'payable'
  entityId: string
  documentType: string
  fileName: string
}

class DocumentsService {
  private supabase = createClient()

  async uploadDocument(data: UploadDocumentData): Promise<Document> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate unique file path
      const fileExtension = data.file.name.split('.').pop()
      const timestamp = Date.now()
      const uniqueFileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`
      const filePath = `documents/${data.entityType}/${data.entityId}/${uniqueFileName}`

      // Upload file to storage
      const { error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      // Save document metadata to database
      const documentData = {
        id: crypto.randomUUID(),
        entity_type: data.entityType,
        entity_id: data.entityId,
        document_type: data.documentType,
        file_name: data.fileName,
        file_path: filePath,
        file_size: data.file.size,
        mime_type: data.file.type,
        uploaded_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: document, error: dbError } = await this.supabase
        .from('ap_documents')
        .insert(documentData)
        .select()
        .single()

      if (dbError) throw dbError

      return document
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  async getDocuments(entityType: 'vendor' | 'payable', entityId: string): Promise<Document[]> {
    try {
      const { data, error } = await this.supabase
        .from('ap_documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  }

  async downloadDocument(documentId: string, fileName: string): Promise<void> {
    try {
      // Get document metadata
      const { data: document, error: docError } = await this.supabase
        .from('ap_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Download file from storage
      const { data, error } = await this.supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const link = window.document.createElement('a')
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document metadata
      const { data: document, error: docError } = await this.supabase
        .from('ap_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (docError) throw docError

      // Delete file from storage
      const { error: storageError } = await this.supabase.storage
        .from('documents')
        .remove([document.file_path])

      if (storageError) throw storageError

      // Delete document metadata from database
      const { error: dbError } = await this.supabase
        .from('ap_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  async getDocumentsByType(documentType: string): Promise<Document[]> {
    try {
      const { data, error } = await this.supabase
        .from('ap_documents')
        .select('*')
        .eq('document_type', documentType)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching documents by type:', error)
      throw error
    }
  }

  async updateDocumentType(documentId: string, newType: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ap_documents')
        .update({
          document_type: newType,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating document type:', error)
      throw error
    }
  }
}

export const createdocumentsService = () => new DocumentsService()

