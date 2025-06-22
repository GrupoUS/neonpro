'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp,
  Plus,
  Calendar,
  FileText,
  Loader2,
  Save
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Evolution {
  id: string
  evolution_text: string
  created_at: string
  updated_at: string
}

interface MedicalRecordEvolutionsProps {
  medicalRecordId: string
}

export function MedicalRecordEvolutions({ medicalRecordId }: MedicalRecordEvolutionsProps) {
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newEvolution, setNewEvolution] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadEvolutions()
  }, [medicalRecordId])

  const loadEvolutions = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('medical_record_evolutions')
        .select('*')
        .eq('medical_record_id', medicalRecordId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar evoluções:', error)
        setError('Erro ao carregar evoluções')
        return
      }

      setEvolutions(data || [])
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error)
      setError('Erro ao carregar evoluções')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvolution = async () => {
    if (!newEvolution.trim()) return

    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('medical_record_evolutions')
        .insert([{
          medical_record_id: medicalRecordId,
          user_id: user.id,
          evolution_text: newEvolution.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])

      if (error) throw error

      setNewEvolution('')
      setShowForm(false)
      loadEvolutions() // Recarregar a lista
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar evolução')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando evoluções...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header com botão para nova evolução */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Evolução do Tratamento
            </CardTitle>
            <Button 
              onClick={() => setShowForm(!showForm)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Evolução
            </Button>
          </div>
        </CardHeader>

        {/* Formulário para nova evolução */}
        {showForm && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new_evolution">Nova Evolução</Label>
                <Textarea
                  id="new_evolution"
                  value={newEvolution}
                  onChange={(e) => setNewEvolution(e.target.value)}
                  placeholder="Descreva a evolução do tratamento..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setNewEvolution('')
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEvolution}
                  disabled={saving || !newEvolution.trim()}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de evoluções */}
      {evolutions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nenhuma evolução registrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece registrando a primeira evolução do tratamento.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {evolutions.map((evolution) => (
            <Card key={evolution.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(evolution.created_at)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {evolution.evolution_text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
