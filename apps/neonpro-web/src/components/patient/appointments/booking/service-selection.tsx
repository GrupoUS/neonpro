'use client'

import { createClient } from '@/app/utils/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Clock, DollarSign, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  category: string
  is_active: boolean
}

interface ServiceSelectionProps {
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
  className?: string
}

export function ServiceSelection({ 
  selectedService, 
  onServiceSelect,
  className = ""
}: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Erro ao carregar serviços. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(services.map(service => service.category))]
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

  if (loading) {
    return (
      <div className={`flex justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className={`${className} border-red-200 bg-red-50`}>
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Escolha o Serviço
        </h2>
        <p className="text-gray-600">
          Selecione o serviço desejado para continuar com o agendamento
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'Todos' : category}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedService?.id === service.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:border-blue-300'
            }`}
            onClick={() => onServiceSelect(service)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedService?.id === service.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onServiceSelect(service)
              }
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{service.name}</span>
                {selectedService?.id === service.id && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Selecionado
                  </Badge>
                )}
              </CardTitle>
              <Badge variant="outline" className="w-fit capitalize">
                {service.category}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600 text-sm">{service.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'Nenhum serviço disponível no momento'
              : `Nenhum serviço encontrado na categoria "${selectedCategory}"`
            }
          </p>
        </div>
      )}
    </div>
  )
}
