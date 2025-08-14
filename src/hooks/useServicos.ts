'use client'

import { useState, useCallback } from 'react'

// Healthcare Service Interface
interface HealthcareService {
  id: string
  name: string
  description: string
  category: 'estetica' | 'clinica' | 'cirurgica' | 'preventiva'
  subcategory: string
  duration: number // in minutes
  price: number
  promotionalPrice?: number
  isPromotion: boolean
  
  // Medical Classification
  procedures: {
    primary: string // TUSS code
    secondary?: string[]
  }
  icd10Codes?: string[]
  specialtyRequired: string[]
  
  // Requirements & Contraindications
  requirements: {
    age: { min?: number; max?: number }
    gender?: 'male' | 'female' | 'both'
    prerequisites: string[]
    contraindications: string[]
  }
  
  // ANVISA Compliance
  anvisaCompliance: {
    requiresAuthorization: boolean
    registrationNumber?: string
    riskClass?: 'I' | 'II' | 'III' | 'IV'
    requiredCertifications: string[]
  }
  
  // Equipment & Materials
  equipment: {
    required: string[]
    consumables: string[]
    medications?: string[]
  }
  
  // Booking & Scheduling
  scheduling: {
    advanceBookingDays: number
    cancellationPolicy: number // hours
    reschedulePolicy: number // hours
    availableDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
    timeSlots: string[]
  }
  
  // Follow-up
  followUp: {
    required: boolean
    sessions?: number
    intervalDays?: number
    monitoring: string[]
  }
  
  // Performance Metrics
  metrics: {
    bookingCount: number
    satisfaction: number
    conversionRate: number
    averageRating: number
    reviewCount: number
    revenueGenerated: number
  }
  
  // Status & Availability
  status: 'active' | 'inactive' | 'discontinued' | 'under_review'
  availability: 'available' | 'limited' | 'unavailable'
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Service Category Configuration
interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  services: string[] // service IDs
  regulations: string[]
  requirements: string[]
}

// Service Package Interface
interface ServicePackage {
  id: string
  name: string
  description: string
  serviceIds: string[]
  totalPrice: number
  discountPercentage: number
  finalPrice: number
  validity: number // days
  terms: string[]
  status: 'active' | 'inactive'
}

// Service Review Interface
interface ServiceReview {
  id: string
  serviceId: string
  patientId: string
  patientName: string
  rating: number
  comment: string
  pros: string[]
  cons: string[]
  recommended: boolean
  verified: boolean
  date: string
  photos?: string[]
}

// Hook Interface
interface UseServicosReturn {
  // State
  services: HealthcareService[]
  categories: ServiceCategory[]
  packages: ServicePackage[]
  reviews: ServiceReview[]
  currentService: HealthcareService | null
  loading: boolean
  error: string | null
  
  // Service Actions
  fetchServices: () => Promise<void>
  fetchServiceById: (id: string) => Promise<HealthcareService | null>
  createService: (serviceData: Omit<HealthcareService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HealthcareService>
  updateService: (id: string, updates: Partial<HealthcareService>) => Promise<void>
  deleteService: (id: string) => Promise<void>
  toggleServiceStatus: (id: string) => Promise<void>
  
  // Package Actions
  createPackage: (packageData: Omit<ServicePackage, 'id'>) => Promise<ServicePackage>
  updatePackage: (id: string, updates: Partial<ServicePackage>) => Promise<void>
  deletePackage: (id: string) => Promise<void>
  
  // Review Actions
  addReview: (review: Omit<ServiceReview, 'id' | 'date'>) => Promise<void>
  updateReview: (id: string, updates: Partial<ServiceReview>) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  
  // Search & Filter
  searchServices: (query: string) => HealthcareService[]
  filterByCategory: (category: string) => HealthcareService[]
  filterByPriceRange: (min: number, max: number) => HealthcareService[]
  filterByDuration: (min: number, max: number) => HealthcareService[]
  filterByRating: (minRating: number) => HealthcareService[]
  
  // Analytics
  getServiceMetrics: (serviceId: string) => any
  getCategoryMetrics: (category: string) => any
  getRevenueProjection: (serviceId: string, months: number) => number
  
  // Validation
  validateANVISACompliance: (service: HealthcareService) => { valid: boolean; errors: string[] }
  validatePricing: (service: HealthcareService) => { valid: boolean; errors: string[] }
  validateSchedulingRules: (service: HealthcareService) => { valid: boolean; errors: string[] }
  
  // Booking Support
  checkServiceAvailability: (serviceId: string, date: string, time: string) => Promise<boolean>
  getAvailableSlots: (serviceId: string, date: string) => Promise<string[]>
  calculateServicePrice: (serviceId: string, promotions?: string[]) => number
}

// Mock Data
const mockHealthcareServices: HealthcareService[] = [
  {
    id: 'service-001',
    name: 'Botox Terapêutico',
    description: 'Aplicação de toxina botulínica tipo A para tratamento de rugas de expressão e hiperidrose',
    category: 'estetica',
    subcategory: 'Injetáveis',
    duration: 60,
    price: 1200,
    promotionalPrice: 980,
    isPromotion: true,
    procedures: {
      primary: '40701020', // TUSS
      secondary: ['40701021']
    },
    icd10Codes: ['L70.9', 'R61.1'],
    specialtyRequired: ['Dermatologia', 'Cirurgia Plástica'],
    requirements: {
      age: { min: 18, max: 70 },
      gender: 'both',
      prerequisites: ['Consulta inicial obrigatória', 'Teste de alergia negativo'],
      contraindications: [
        'Gravidez e amamentação',
        'Infecção ativa no local',
        'Alergia à toxina botulínica',
        'Miastenia gravis'
      ]
    },
    anvisaCompliance: {
      requiresAuthorization: true,
      registrationNumber: 'MS-1234567890',
      riskClass: 'III',
      requiredCertifications: ['ANVISA', 'FDA']
    },
    equipment: {
      required: ['Seringas descartáveis', 'Agulhas 30G'],
      consumables: ['Álcool 70%', 'Algodão', 'Luvas descartáveis'],
      medications: ['Toxina Botulínica Tipo A']
    },
    scheduling: {
      advanceBookingDays: 30,
      cancellationPolicy: 24,
      reschedulePolicy: 12,
      availableDays: ['tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['09:00', '10:00', '14:00', '15:00', '16:00']
    },
    followUp: {
      required: true,
      sessions: 1,
      intervalDays: 14,
      monitoring: ['Avaliação de resultado', 'Possíveis efeitos colaterais']
    },
    metrics: {
      bookingCount: 156,
      satisfaction: 4.8,
      conversionRate: 85,
      averageRating: 4.9,
      reviewCount: 142,
      revenueGenerated: 187200
    },
    status: 'active',
    availability: 'available',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: 'service-002',
    name: 'Preenchimento com Ácido Hialurônico',
    description: 'Preenchimento facial com ácido hialurônico para correção de sulcos e aumento de volume',
    category: 'estetica',
    subcategory: 'Preenchimento',
    duration: 90,
    price: 1800,
    isPromotion: false,
    procedures: {
      primary: '40701030',
      secondary: ['40701031', '40701032']
    },
    specialtyRequired: ['Dermatologia', 'Cirurgia Plástica'],
    requirements: {
      age: { min: 21, max: 65 },
      gender: 'both',
      prerequisites: ['Consulta inicial', 'Assinatura de termo de consentimento'],
      contraindications: [
        'Gravidez e amamentação',
        'Inflamação ou infecção ativa',
        'Alergia ao ácido hialurônico',
        'Distúrbios de coagulação'
      ]
    },
    anvisaCompliance: {
      requiresAuthorization: true,
      registrationNumber: 'MS-9876543210',
      riskClass: 'III',
      requiredCertifications: ['ANVISA', 'CE']
    },
    equipment: {
      required: ['Seringas 1ml', 'Agulhas 27G', 'Cânulas rombas'],
      consumables: ['Antisséptico', 'Gaze estéril', 'Gelo'],
      medications: ['Ácido Hialurônico', 'Lidocaína tópica']
    },
    scheduling: {
      advanceBookingDays: 45,
      cancellationPolicy: 48,
      reschedulePolicy: 24,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['09:00', '10:30', '14:00', '15:30']
    },
    followUp: {
      required: true,
      sessions: 2,
      intervalDays: 7,
      monitoring: ['Edema', 'Equimose', 'Simetria', 'Satisfação do resultado']
    },
    metrics: {
      bookingCount: 89,
      satisfaction: 4.7,
      conversionRate: 78,
      averageRating: 4.6,
      reviewCount: 76,
      revenueGenerated: 160200
    },
    status: 'active',
    availability: 'available',
    createdAt: '2024-02-20T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: 'service-003',
    name: 'Limpeza de Pele Profunda',
    description: 'Limpeza facial profunda com extração de comedões e hidratação',
    category: 'clinica',
    subcategory: 'Facial',
    duration: 75,
    price: 180,
    isPromotion: false,
    procedures: {
      primary: '40801010'
    },
    specialtyRequired: ['Esteticista', 'Dermatologia'],
    requirements: {
      age: { min: 14 },
      gender: 'both',
      prerequisites: ['Avaliação da pele'],
      contraindications: [
        'Lesões abertas',
        'Acne inflamada severa',
        'Dermatite ativa'
      ]
    },
    anvisaCompliance: {
      requiresAuthorization: false,
      requiredCertifications: []
    },
    equipment: {
      required: ['Vaporizador', 'Extrator de comedões', 'Lupa'],
      consumables: ['Produtos de limpeza', 'Máscara facial', 'Protetor solar'],
      medications: []
    },
    scheduling: {
      advanceBookingDays: 14,
      cancellationPolicy: 4,
      reschedulePolicy: 2,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: ['09:00', '10:30', '14:00', '15:30', '17:00']
    },
    followUp: {
      required: false,
      monitoring: ['Reações na pele', 'Orientações de cuidado']
    },
    metrics: {
      bookingCount: 298,
      satisfaction: 4.5,
      conversionRate: 92,
      averageRating: 4.4,
      reviewCount: 256,
      revenueGenerated: 53640
    },
    status: 'active',
    availability: 'available',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-12-15T00:00:00.000Z',
    createdBy: 'admin'
  }
]

const mockServiceCategories: ServiceCategory[] = [
  {
    id: 'estetica',
    name: 'Procedimentos Estéticos',
    description: 'Tratamentos estéticos minimamente invasivos',
    icon: 'Sparkles',
    color: 'bg-purple-500',
    services: ['service-001', 'service-002'],
    regulations: ['ANVISA', 'CFM'],
    requirements: ['Médico especialista', 'Equipamentos certificados']
  },
  {
    id: 'clinica',
    name: 'Clínica Geral',
    description: 'Tratamentos clínicos e preventivos',
    icon: 'Stethoscope',
    color: 'bg-blue-500',
    services: ['service-003'],
    regulations: ['CFM', 'Vigilância Sanitária'],
    requirements: ['Profissional qualificado']
  },
  {
    id: 'cirurgica',
    name: 'Cirúrgica',
    description: 'Procedimentos cirúrgicos ambulatoriais',
    icon: 'Scissors',
    color: 'bg-red-500',
    services: [],
    regulations: ['ANVISA', 'CFM', 'CRM'],
    requirements: ['Médico cirurgião', 'Centro cirúrgico']
  },
  {
    id: 'preventiva',
    name: 'Medicina Preventiva',
    description: 'Check-ups e exames preventivos',
    icon: 'Shield',
    color: 'bg-green-500',
    services: [],
    regulations: ['CFM'],
    requirements: ['Médico', 'Equipamentos diagnósticos']
  }
]

const mockServicePackages: ServicePackage[] = [
  {
    id: 'package-001',
    name: 'Rejuvenescimento Facial Completo',
    description: 'Botox + Preenchimento + Limpeza de Pele',
    serviceIds: ['service-001', 'service-002', 'service-003'],
    totalPrice: 3180,
    discountPercentage: 15,
    finalPrice: 2703,
    validity: 90,
    terms: [
      'Válido por 90 dias',
      'Reagendamento com 24h de antecedência',
      'Não cumulativo com outras promoções'
    ],
    status: 'active'
  }
]

const mockServiceReviews: ServiceReview[] = [
  {
    id: 'review-001',
    serviceId: 'service-001',
    patientId: 'patient-001',
    patientName: 'Ana Silva',
    rating: 5,
    comment: 'Excelente resultado! Profissional muito competente e cuidadosa.',
    pros: ['Resultado natural', 'Profissional experiente', 'Atendimento personalizado'],
    cons: [],
    recommended: true,
    verified: true,
    date: '2025-01-10T00:00:00.000Z'
  },
  {
    id: 'review-002',
    serviceId: 'service-002',
    patientId: 'patient-002',
    patientName: 'Maria Santos',
    rating: 4,
    comment: 'Muito bom resultado, apenas um pouco de inchaço nos primeiros dias.',
    pros: ['Resultado duradouro', 'Técnica apurada'],
    cons: ['Inchaço inicial'],
    recommended: true,
    verified: true,
    date: '2025-01-08T00:00:00.000Z'
  }
]

// Custom Hook
export const useServicos = (): UseServicosReturn => {
  const [services, setServices] = useState<HealthcareService[]>(mockHealthcareServices)
  const [categories, setCategories] = useState<ServiceCategory[]>(mockServiceCategories)
  const [packages, setPackages] = useState<ServicePackage[]>(mockServicePackages)
  const [reviews, setReviews] = useState<ServiceReview[]>(mockServiceReviews)
  const [currentService, setCurrentService] = useState<HealthcareService | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setServices(mockHealthcareServices)
    } catch (err) {
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchServiceById = useCallback(async (id: string): Promise<HealthcareService | null> => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const service = mockHealthcareServices.find(s => s.id === id) || null
      setCurrentService(service)
      return service
    } catch (err) {
      setError('Erro ao carregar serviço')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async (serviceData: Omit<HealthcareService, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthcareService> => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newService: HealthcareService = {
        ...serviceData,
        id: `service-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setServices(prev => [...prev, newService])
      return newService
    } catch (err) {
      setError('Erro ao criar serviço')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateService = useCallback(async (id: string, updates: Partial<HealthcareService>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setServices(prev => prev.map(service => 
        service.id === id 
          ? { ...service, ...updates, updatedAt: new Date().toISOString() }
          : service
      ))
    } catch (err) {
      setError('Erro ao atualizar serviço')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteService = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setServices(prev => prev.filter(service => service.id !== id))
    } catch (err) {
      setError('Erro ao deletar serviço')
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleServiceStatus = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setServices(prev => prev.map(service => 
        service.id === id 
          ? { 
              ...service, 
              status: service.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString()
            }
          : service
      ))
    } catch (err) {
      setError('Erro ao alterar status do serviço')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPackage = useCallback(async (packageData: Omit<ServicePackage, 'id'>): Promise<ServicePackage> => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newPackage: ServicePackage = {
        ...packageData,
        id: `package-${Date.now()}`
      }
      
      setPackages(prev => [...prev, newPackage])
      return newPackage
    } catch (err) {
      setError('Erro ao criar pacote')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePackage = useCallback(async (id: string, updates: Partial<ServicePackage>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPackages(prev => prev.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ))
    } catch (err) {
      setError('Erro ao atualizar pacote')
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePackage = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setPackages(prev => prev.filter(pkg => pkg.id !== id))
    } catch (err) {
      setError('Erro ao deletar pacote')
    } finally {
      setLoading(false)
    }
  }, [])

  const addReview = useCallback(async (review: Omit<ServiceReview, 'id' | 'date'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newReview: ServiceReview = {
        ...review,
        id: `review-${Date.now()}`,
        date: new Date().toISOString()
      }
      
      setReviews(prev => [...prev, newReview])
      
      // Update service metrics
      setServices(prev => prev.map(service => 
        service.id === review.serviceId
          ? {
              ...service,
              metrics: {
                ...service.metrics,
                reviewCount: service.metrics.reviewCount + 1,
                averageRating: ((service.metrics.averageRating * service.metrics.reviewCount) + review.rating) / (service.metrics.reviewCount + 1)
              }
            }
          : service
      ))
    } catch (err) {
      setError('Erro ao adicionar avaliação')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReview = useCallback(async (id: string, updates: Partial<ServiceReview>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setReviews(prev => prev.map(review => 
        review.id === id ? { ...review, ...updates } : review
      ))
    } catch (err) {
      setError('Erro ao atualizar avaliação')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteReview = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviews(prev => prev.filter(review => review.id !== id))
    } catch (err) {
      setError('Erro ao deletar avaliação')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchServices = useCallback((query: string): HealthcareService[] => {
    return services.filter(service => 
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase()) ||
      service.subcategory.toLowerCase().includes(query.toLowerCase())
    )
  }, [services])

  const filterByCategory = useCallback((category: string): HealthcareService[] => {
    return services.filter(service => service.category === category)
  }, [services])

  const filterByPriceRange = useCallback((min: number, max: number): HealthcareService[] => {
    return services.filter(service => {
      const price = service.isPromotion ? service.promotionalPrice || service.price : service.price
      return price >= min && price <= max
    })
  }, [services])

  const filterByDuration = useCallback((min: number, max: number): HealthcareService[] => {
    return services.filter(service => service.duration >= min && service.duration <= max)
  }, [services])

  const filterByRating = useCallback((minRating: number): HealthcareService[] => {
    return services.filter(service => service.metrics.averageRating >= minRating)
  }, [services])

  const getServiceMetrics = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return null

    const serviceReviews = reviews.filter(r => r.serviceId === serviceId)
    const recentReviews = serviceReviews.filter(r => 
      new Date(r.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    return {
      ...service.metrics,
      recentReviewCount: recentReviews.length,
      recommendationRate: (serviceReviews.filter(r => r.recommended).length / serviceReviews.length) * 100,
      totalRevenue: service.metrics.revenueGenerated,
      averageSessionValue: service.metrics.revenueGenerated / service.metrics.bookingCount
    }
  }, [services, reviews])

  const getCategoryMetrics = useCallback((category: string) => {
    const categoryServices = services.filter(s => s.category === category)
    
    const totalBookings = categoryServices.reduce((acc, service) => acc + service.metrics.bookingCount, 0)
    const totalRevenue = categoryServices.reduce((acc, service) => acc + service.metrics.revenueGenerated, 0)
    const avgSatisfaction = categoryServices.reduce((acc, service) => acc + service.metrics.satisfaction, 0) / categoryServices.length
    
    return {
      serviceCount: categoryServices.length,
      totalBookings,
      totalRevenue,
      averageSatisfaction: avgSatisfaction,
      activeServices: categoryServices.filter(s => s.status === 'active').length
    }
  }, [services])

  const getRevenueProjection = useCallback((serviceId: string, months: number): number => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return 0

    const monthlyRevenue = service.metrics.revenueGenerated / 12 // Assuming yearly data
    const growthRate = service.metrics.conversionRate / 100
    
    return monthlyRevenue * months * (1 + growthRate)
  }, [services])

  const validateANVISACompliance = useCallback((service: HealthcareService): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (service.anvisaCompliance.requiresAuthorization && !service.anvisaCompliance.registrationNumber) {
      errors.push('Número de registro ANVISA obrigatório')
    }
    
    if (service.anvisaCompliance.requiresAuthorization && !service.anvisaCompliance.riskClass) {
      errors.push('Classe de risco deve ser definida')
    }
    
    if (service.category === 'cirurgica' && !service.anvisaCompliance.requiredCertifications.includes('ANVISA')) {
      errors.push('Certificação ANVISA obrigatória para procedimentos cirúrgicos')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  const validatePricing = useCallback((service: HealthcareService): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (service.price <= 0) {
      errors.push('Preço deve ser maior que zero')
    }
    
    if (service.isPromotion && (!service.promotionalPrice || service.promotionalPrice >= service.price)) {
      errors.push('Preço promocional deve ser menor que o preço normal')
    }
    
    if (service.duration <= 0) {
      errors.push('Duração deve ser maior que zero')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  const validateSchedulingRules = useCallback((service: HealthcareService): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (service.scheduling.availableDays.length === 0) {
      errors.push('Pelo menos um dia da semana deve estar disponível')
    }
    
    if (service.scheduling.timeSlots.length === 0) {
      errors.push('Pelo menos um horário deve estar disponível')
    }
    
    if (service.scheduling.cancellationPolicy < 0) {
      errors.push('Política de cancelamento não pode ser negativa')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  const checkServiceAvailability = useCallback(async (serviceId: string, date: string, time: string): Promise<boolean> => {
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const service = services.find(s => s.id === serviceId)
      if (!service) return false
      
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      
      return service.scheduling.availableDays.includes(dayOfWeek) && 
             service.scheduling.timeSlots.includes(time) &&
             service.status === 'active' &&
             service.availability === 'available'
    } catch (err) {
      return false
    } finally {
      setLoading(false)
    }
  }, [services])

  const getAvailableSlots = useCallback(async (serviceId: string, date: string): Promise<string[]> => {
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const service = services.find(s => s.id === serviceId)
      if (!service) return []
      
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      
      if (!service.scheduling.availableDays.includes(dayOfWeek)) {
        return []
      }
      
      return service.scheduling.timeSlots
    } catch (err) {
      return []
    } finally {
      setLoading(false)
    }
  }, [services])

  const calculateServicePrice = useCallback((serviceId: string, promotions: string[] = []): number => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return 0
    
    let finalPrice = service.isPromotion && service.promotionalPrice 
      ? service.promotionalPrice 
      : service.price
    
    // Apply additional promotions if any
    promotions.forEach(promotion => {
      if (promotion === 'first_time') {
        finalPrice *= 0.9 // 10% discount for first-time clients
      }
      if (promotion === 'loyalty') {
        finalPrice *= 0.95 // 5% discount for loyalty program
      }
    })
    
    return finalPrice
  }, [services])

  return {
    // State
    services,
    categories,
    packages,
    reviews,
    currentService,
    loading,
    error,
    
    // Service Actions
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    
    // Package Actions
    createPackage,
    updatePackage,
    deletePackage,
    
    // Review Actions
    addReview,
    updateReview,
    deleteReview,
    
    // Search & Filter
    searchServices,
    filterByCategory,
    filterByPriceRange,
    filterByDuration,
    filterByRating,
    
    // Analytics
    getServiceMetrics,
    getCategoryMetrics,
    getRevenueProjection,
    
    // Validation
    validateANVISACompliance,
    validatePricing,
    validateSchedulingRules,
    
    // Booking Support
    checkServiceAvailability,
    getAvailableSlots,
    calculateServicePrice
  }
}