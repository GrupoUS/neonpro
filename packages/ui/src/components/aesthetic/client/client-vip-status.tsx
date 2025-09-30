import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Progress } from '../../ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { 
  Star, 
  Crown, 
  Gem, 
  Heart, 
  Calendar, 
  Phone, 
  MessageCircle, 
  Award,
  TrendingUp,
  Sparkles,
  Shield
} from 'lucide-react'

// NeonPro Aesthetic Brand Colors
const NEONPRO_COLORS = {
  primary: '#AC9469',      // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031',     // Healthcare Professional - Trust & Reliability
  accent: '#D2AA60',       // Gold Accent - Premium Services
  neutral: '#B4AC9C',      // Calming Light Beige
  background: '#D2D0C8',   // Soft Gray Background
  luxury: '#B8860B',       // Gold luxury accent
  purpleAccent: '#9B7EBD', // Soft purple for elegance
}

export interface VIPClientStatusProps {
  clientId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  avatarUrl?: string
  vipLevel: 'silver' | 'gold' | 'platinum' | 'diamond'
  membershipSince: Date
  totalTreatments: number
  totalSpent: number
  upcomingAppointments: number
  loyaltyPoints: number
  preferredTreatments: string[]
  lastVisit: Date
  nextAppointment?: Date
  personalAesthetician?: string
  notes?: string
  onContactClient?: (type: 'phone' | 'message') => void
  onViewProfile?: () => void
  onScheduleTreatment?: () => void
  className?: string
}

const VIP_LEVELS = {
  silver: {
    name: 'Silver',
    color: '#C0C0C0',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    icon: <Star className="h-4 w-4" />,
    minSpent: 5000,
    benefits: ['10% desconto', 'Atendimento prioritário', 'Produtos exclusivos']
  },
  gold: {
    name: 'Gold',
    color: NEONPRO_COLORS.primary,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: <Crown className="h-4 w-4" />,
    minSpent: 15000,
    benefits: ['15% desconto', 'Acesso VIP', 'Tratamentos exclusivos', 'Consultor pessoal']
  },
  platinum: {
    name: 'Platinum',
    color: '#E5E4E2',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    icon: <Gem className="h-4 w-4" />,
    minSpent: 30000,
    benefits: ['20% desconto', 'Serviço concierge', 'Eventos exclusivos', 'Tratamentos premium']
  },
  diamond: {
    name: 'Diamond',
    color: '#B9F2FF',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: <Sparkles className="h-4 w-4" />,
    minSpent: 50000,
    benefits: ['25% desconto', 'Acesso irrestrito', 'Experiências personalizadas', 'Clínica privada']
  }
}

export const VIPClientStatus: React.FC<VIPClientStatusProps> = ({
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  avatarUrl,
  vipLevel,
  membershipSince,
  totalTreatments,
  totalSpent,
  upcomingAppointments,
  loyaltyPoints,
  preferredTreatments,
  lastVisit,
  nextAppointment,
  personalAesthetician,
  notes,
  onContactClient,
  onViewProfile,
  onScheduleTreatment,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [progressToNextLevel, setProgressToNextLevel] = useState(0)
  
  const levelConfig = VIP_LEVELS[vipLevel]
  
  // Calculate progress to next VIP level
  useEffect(() => {
    const levels = ['silver', 'gold', 'platinum', 'diamond'] as const
    const currentIndex = levels.indexOf(vipLevel)
    
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1]
      const nextLevelConfig = VIP_LEVELS[nextLevel]
      const currentLevelSpent = VIP_LEVELS[vipLevel].minSpent
      const progress = ((totalSpent - currentLevelSpent) / (nextLevelConfig.minSpent - currentLevelSpent)) * 100
      setProgressToNextLevel(Math.min(Math.max(progress, 0), 100))
    } else {
      setProgressToNextLevel(100) // Diamond is max level
    }
  }, [vipLevel, totalSpent])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDaysSinceLastVisit = () => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastVisit.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysSinceLastVisit = getDaysSinceLastVisit()
  const needsFollowUp = daysSinceLastVisit > 30

  return (
    <Card className={`w-full ${levelConfig.bgColor} ${levelConfig.borderColor} border-2 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2" style={{ borderColor: levelConfig.color }}>
              <AvatarImage src={avatarUrl} alt={clientName} />
              <AvatarFallback className="text-sm font-semibold">
                {clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-bold text-gray-800">
                  {clientName}
                </CardTitle>
                <Badge 
                  variant="default" 
                  className="text-xs px-2 py-1"
                  style={{ backgroundColor: levelConfig.color, color: 'white' }}
                >
                  <div className="flex items-center gap-1">
                    {levelConfig.icon}
                    {levelConfig.name}
                  </div>
                </Badge>
                {vipLevel === 'diamond' && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs animate-pulse">
                    <Crown className="h-3 w-3 mr-1" />
                    TOP VIP
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Cliente #{clientId}</span>
                <span>Desde {formatDate(membershipSince)}</span>
                {needsFollowUp && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Seguimento necessário
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {vipLevel === 'diamond' && (
              <div className="text-right">
                <div className="text-xs text-gray-600">Status</div>
                <div className="text-sm font-semibold text-purple-600">Premium</div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
              aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
            >
              <Sparkles className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{totalTreatments}</div>
            <div className="text-xs text-gray-600">Tratamentos</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-gray-600">Total Investido</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{loyaltyPoints}</div>
            <div className="text-xs text-gray-600">Pontos Fidelidade</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{upcomingAppointments}</div>
            <div className="text-xs text-gray-600">Próximos Agendamentos</div>
          </div>
        </div>
        
        {/* Progress to Next Level */}
        {vipLevel !== 'diamond' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso para próximo nível</span>
              <span className="font-semibold">{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              Faltam {formatCurrency(
                Object.values(VIP_LEVELS)[Object.keys(VIP_LEVELS).indexOf(vipLevel) + 1].minSpent - totalSpent
              )} para próximo nível
            </div>
          </div>
        )}
        
        {/* Preferred Treatments */}
        {preferredTreatments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Tratamentos Preferidos</div>
            <div className="flex flex-wrap gap-2">
              {preferredTreatments.slice(0, isExpanded ? undefined : 3).map((treatment, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {treatment}
                </Badge>
              ))}
              {!isExpanded && preferredTreatments.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{preferredTreatments.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Next Appointment */}
            {nextAppointment && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Próxima consulta:</span>
                <span className="font-semibold">{formatDate(nextAppointment)}</span>
              </div>
            )}
            
            {/* Personal Aesthetician */}
            {personalAesthetician && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Esteticista pessoal:</span>
                <span className="font-semibold">{personalAesthetician}</span>
              </div>
            )}
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientEmail && (
                <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <MessageCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 truncate">{clientEmail}</span>
                </div>
              )}
              
              {clientPhone && (
                <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{clientPhone}</span>
                </div>
              )}
            </div>
            
            {/* VIP Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Award className="h-4 w-4" />
                Benefícios VIP {levelConfig.name}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {levelConfig.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm p-2 bg-green-50 text-green-700 rounded">
                    <Shield className="h-3 w-3" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            {notes && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">Notas do Cliente</div>
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded border border-blue-200">
                  {notes}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContactClient?.('phone')}
                className="text-xs"
              >
                <Phone className="h-3 w-3 mr-1" />
                Telefone
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContactClient?.('message')}
                className="text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Mensagem
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onViewProfile}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Perfil
              </Button>
              
              <Button
                size="sm"
                onClick={onScheduleTreatment}
                className="text-xs"
                style={{ backgroundColor: NEONPRO_COLORS.primary, color: 'white' }}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Agendar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default VIPClientStatus