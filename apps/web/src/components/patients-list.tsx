import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string
  name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPatients() {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Map database fields to Patient interface
        const mappedPatients = data?.map(patient => ({
          ...patient,
          status: 'active' as const // Default status since it might not exist in DB
        })) || []

        setPatients(mappedPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
        setError('Erro ao carregar pacientes')
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Nenhum paciente encontrado</p>
          <Button asChild>
            <Link to="/patients/new">Adicionar Paciente</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pacientes ({patients.length})</h2>
        <Button asChild>
          <Link to="/patients/new">Novo Paciente</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <CardDescription>{patient.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {patient.phone && (
                  <p><span className="font-medium">Telefone:</span> {patient.phone}</p>
                )}
                {patient.date_of_birth && (
                  <p><span className="font-medium">Nascimento:</span> {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' :
                    patient.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status === 'active' ? 'Ativo' :
                     patient.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/patients/${patient.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}