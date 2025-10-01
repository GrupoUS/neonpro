/**
 * Clinical Documentation Component
 * 
 * Sistema de documentação clínica para clínicas estéticas brasileiras
 * Com histórico médico, registros de tratamento e conformidade ANVISA
 * 
 * @component ClinicalDocumentation
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui'
import { Button } from '@neonpro/ui'
import { Badge } from '@neonpro/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui'
import { AccessibilityProvider } from '@neonpro/ui'
import { ScreenReaderAnnouncer } from '@neonpro/ui'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { MobileHealthcareButton } from '@/components/ui/mobile-healthcare-button'

import {
  ClinicalNote,
  DocumentAttachment,
  TreatmentProgress,
  TreatmentMeasurements,
  ClinicalWorkflowComponentProps
} from './types'

interface ClinicalDocumentationProps extends ClinicalWorkflowComponentProps {
  patientId: string
  treatmentSessionId?: string
  clinicalNotes?: ClinicalNote[]
  treatmentProgress?: TreatmentProgress[]
  onNoteCreate?: (note: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onNoteUpdate?: (noteId: string, note: Partial<ClinicalNote>) => Promise<void>
  onProgressUpdate?: (progress: Partial<TreatmentProgress>) => Promise<void>
  onFileUpload?: (file: File, type: string) => Promise<DocumentAttachment>
  onEmergencyAlert?: (alert: any) => void
}

const NOTE_TYPES = [
  { value: 'initial_assessment', label: 'Avaliação Inicial' },
  { value: 'progress_note', label: 'Nota de Evolução' },
  { value: 'treatment_note', label: 'Nota de Tratamento' },
  { value: 'follow_up', label: 'Acompanhamento' },
  { value: 'discharge_summary', label: 'Sumário de Alta' }
] as const

export const ClinicalDocumentation: React.FC<ClinicalDocumentationProps> = ({
  patientId,
  treatmentSessionId,
  staffId,
  healthcareContext,
  className,
  clinicalNotes = [],
  treatmentProgress = [],
  onNoteCreate,
  onNoteUpdate,
  onProgressUpdate,
  onFileUpload,
  onEmergencyAlert
}) => {
  const [activeTab, setActiveTab] = useState('notes')
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Form states
  const [newNote, setNewNote] = useState({
    type: 'progress_note' as const,
    content: '',
    tags: [] as string[],
    isConfidential: false
  })

  const [progressForm, setProgressForm] = useState({
    status: 'in_progress' as const,
    progressPercentage: 0,
    notes: '',
    measurements: [] as TreatmentMeasurements[]
  })

  // Monitor offline status for mobile clinical use
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Filter notes based on search and type
  const filteredNotes = clinicalNotes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || note.type === filterType
    return matchesSearch && matchesType
  })

  const handleNoteSubmit = useCallback(async () => {
    if (!newNote.content.trim()) {
      return
    }

    try {
      setIsSubmitting(true)

      const noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId,
        authorId: staffId,
        authorRole: 'medico', // This should come from staff context
        type: newNote.type,
        content: newNote.content,
        tags: newNote.tags,
        isConfidential: newNote.isConfidential
      }

      if (onNoteCreate) {
        await onNoteCreate(noteData)
      }

      // Reset form
      setNewNote({
        type: 'progress_note',
        content: '',
        tags: [],
        isConfidential: false
      })

      setIsEditing(false)
      setSelectedNote(null)

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Nota clínica salva com sucesso')
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [newNote, patientId, staffId, onNoteCreate])

  const handleProgressSubmit = useCallback(async () => {
    if (!treatmentSessionId) return

    try {
      setIsSubmitting(true)

      const progressData: Partial<TreatmentProgress> = {
        treatmentSessionId,
        patientId,
        professionalId: staffId,
        status: progressForm.status,
        progressPercentage: progressForm.progressPercentage,
        notes: progressForm.notes,
        measurements: progressForm.measurements
      }

      if (onProgressUpdate) {
        await onProgressUpdate(progressData)
      }

      // Reset form
      setProgressForm({
        status: 'in_progress',
        progressPercentage: 0,
        notes: '',
        measurements: []
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Progresso do tratamento atualizado com sucesso')
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [progressForm, treatmentSessionId, patientId, staffId, onProgressUpdate])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onFileUpload) return

    try {
      setIsSubmitting(true)
      const attachment = await onFileUpload(file, 'clinical_document')
      
      // Add file reference to current note or create new one
      if (selectedNote) {
        // Update existing note with attachment
        if (onNoteUpdate) {
          await onNoteUpdate(selectedNote.id, {
            attachments: [...(selectedNote.attachments || []), attachment]
          })
        }
      } else {
        // Create new note with attachment
        setNewNote(prev => ({
          ...prev,
          content: `${prev.content}\n\n[Arquivo anexado: ${file.name}]`
        }))
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce(`Arquivo ${file.name} anexado com sucesso`)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedNote, onFileUpload, onNoteUpdate])

  const handleEmergency = useCallback(() => {
    if (onEmergencyAlert) {
      onEmergencyAlert({
        id: `emergency-${Date.now()}`,
        type: 'medical_emergency',
        severity: 'high',
        patientId,
        location: 'Documentação Clínica',
        description: 'Emergência durante documentação clínica',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        status: 'active',
        responseTeam: []
      })
    }
  }, [onEmergencyAlert, patientId, staffId])

  const handleAddTag = useCallback((tag: string) => {
    if (tag && !newNote.tags.includes(tag)) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }, [newNote.tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])

  const addMeasurement = useCallback(() => {
    setProgressForm(prev => ({
      ...prev,
      measurements: [...prev.measurements, {
        area: '',
        beforeValue: 0,
        unit: 'cm',
        date: new Date().toISOString().split('T')[0]
      }]
    }))
  }, [])

  const updateMeasurement = useCallback((index: number, field: string, value: any) => {
    setProgressForm(prev => ({
      ...prev,
      measurements: prev.measurements.map((meas, i) => 
        i === index ? { ...meas, [field]: value } : meas
      )
    }))
  }, [])

  const removeMeasurement = useCallback((index: number) => {
    setProgressForm(prev => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index)
    }))
  }, [])

  return (
    <AccessibilityProvider>
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Documentação Clínica
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Histórico médico e registros de tratamento com conformidade ANVISA
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                <MobileHealthcareButton
                  variant="emergency"
                  size="lg"
                  onClick={handleEmergency}
                  aria-label="Acionar emergência"
                >
                  Emergência
                </MobileHealthcareButton>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notas Clínicas</TabsTrigger>
            <TabsTrigger value="progress">Progresso do Tratamento</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            {/* Notes List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <AccessibilityInput
                      placeholder="Buscar notas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="all">Todos os tipos</option>
                      {NOTE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    Nova Nota
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onClick={() => setSelectedNote(note)}
                      onEdit={() => {
                        setSelectedNote(note)
                        setNewNote({
                          type: note.type,
                          content: note.content,
                          tags: note.tags,
                          isConfidential: note.isConfidential
                        })
                        setIsEditing(true)
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Note Editor */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedNote ? 'Editar Nota' : 'Nova Nota Clínica'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <HealthcareFormGroup label="Tipo de Nota" context={healthcareContext}>
                    <select
                      value={newNote.type}
                      onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {NOTE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>

                  <HealthcareFormGroup label="Conteúdo" context={healthcareContext}>
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      rows={8}
                      placeholder="Descreva os detalhes da avaliação, procedimento ou evolução do paciente..."
                    />
                  </HealthcareFormGroup>

                  <HealthcareFormGroup label="Tags" context={healthcareContext}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newNote.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                    <AccessibilityInput
                      placeholder="Adicionar tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag((e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </HealthcareFormGroup>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newNote.isConfidential}
                        onChange={(e) => setNewNote(prev => ({ ...prev, isConfidential: e.target.checked }))}
                      />
                      Nota confidencial
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isSubmitting}
                      >
                        Anexar Arquivo
                      </Button>
                      <Button
                        onClick={handleNoteSubmit}
                        disabled={isSubmitting || !newNote.content.trim()}
                        loading={isSubmitting}
                      >
                        {selectedNote ? 'Atualizar' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Tratamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Status" context={healthcareContext}>
                    <select
                      value={progressForm.status}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="not_started">Não Iniciado</option>
                      <option value="in_progress">Em Progresso</option>
                      <option value="completed">Concluído</option>
                      <option value="complications">Complicações</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </HealthcareFormGroup>

                  <HealthcareFormGroup label="Progresso (%)" context={healthcareContext}>
                    <AccessibilityInput
                      type="number"
                      min="0"
                      max="100"
                      value={progressForm.progressPercentage}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) || 0 }))}
                    />
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Observações" context={healthcareContext}>
                  <textarea
                    value={progressForm.notes}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Observações sobre o progresso do tratamento..."
                  />
                </HealthcareFormGroup>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Medições</h4>
                    <Button variant="outline" onClick={addMeasurement}>
                      Adicionar Medição
                    </Button>
                  </div>
                  
                  {progressForm.measurements.map((measurement, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <HealthcareFormGroup label="Área" context={healthcareContext}>
                        <AccessibilityInput
                          value={measurement.area}
                          onChange={(e) => updateMeasurement(index, 'area', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Valor" context={healthcareContext}>
                        <AccessibilityInput
                          type="number"
                          value={measurement.beforeValue}
                          onChange={(e) => updateMeasurement(index, 'beforeValue', parseFloat(e.target.value) || 0)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Unidade" context={healthcareContext}>
                        <select
                          value={measurement.unit}
                          onChange={(e) => updateMeasurement(index, 'unit', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                          <option value="ml">ml</option>
                          <option value="mg">mg</option>
                          <option value="%">%</option>
                        </select>
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Data" context={healthcareContext}>
                        <AccessibilityInput
                          type="date"
                          value={measurement.date}
                          onChange={(e) => updateMeasurement(index, 'date', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMeasurement(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleProgressSubmit}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Salvar Progresso
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentProgress.map(progress => (
                    <ProgressCard key={progress.id} progress={progress} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {clinicalNotes.flatMap(note => note.attachments || []).map(attachment => (
                    <AttachmentCard key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AccessibilityProvider>
  )
}

// Sub-components
const NoteCard: React.FC<{
  note: ClinicalNote
  isSelected: boolean
  onClick: () => void
  onEdit: () => void
}> = ({ note, isSelected, onClick, onEdit }) => {
  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      initial_assessment: 'Avaliação Inicial',
      progress_note: 'Nota de Evolução',
      treatment_note: 'Nota de Tratamento',
      follow_up: 'Acompanhamento',
      discharge_summary: 'Sumário de Alta'
    }
    return typeMap[type] || type
  }

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{getTypeLabel(note.type)}</Badge>
          {note.isConfidential && (
            <Badge variant="destructive">Confidencial</Badge>
          )}
        </div>
        <span className="text-sm text-gray-600">
          {new Date(note.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
        {note.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}>
          Editar
        </Button>
      </div>
    </div>
  )
}

const ProgressCard: React.FC<{ progress: TreatmentProgress }> = ({ progress }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'gray',
      in_progress: 'blue',
      completed: 'green',
      complications: 'red',
      cancelled: 'yellow'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_started: 'Não Iniciado',
      in_progress: 'Em Progresso',
      completed: 'Concluído',
      complications: 'Complicações',
      cancelled: 'Cancelado'
    }
    return labels[status] || status
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Badge variant={getStatusColor(progress.status) as any}>
          {getStatusLabel(progress.status)}
        </Badge>
        <span className="text-sm text-gray-600">
          {progress.progressPercentage}% concluído
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>
      {progress.notes && (
        <p className="text-sm text-gray-700">{progress.notes}</p>
      )}
    </div>
  )
}

const AttachmentCard: React.FC<{ attachment: DocumentAttachment }> = ({ attachment }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div className="p-4 border rounded-lg text-center">
      <div className="text-4xl mb-2">{getFileIcon(attachment.type)}</div>
      <p className="text-sm font-medium truncate">{attachment.filename}</p>
      <p className="text-xs text-gray-600">
        {(attachment.size / 1024).toFixed(1)} KB
      </p>
    </div>
  )
}

export default ClinicalDocumentation