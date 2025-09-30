import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Progress } from '../../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Droplet, 
  Moon, 
  Activity,
  Smile,
  Sparkles,
  Target,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Sun
} from 'lucide-react'

// NeonPro Aesthetic Brand Colors
const NEONPRO_COLORS = {
  primary: '#AC9469',      // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031',     // Healthcare Professional - Trust & Reliability
  accent: '#D2AA60',       // Gold Accent - Premium Services
  neutral: '#B4AC9C',      // Calming Light Beige
  background: '#D2D0C8',   // Soft Gray Background
  wellness: '#E8D5B7',     // Soft wellness tone
  luxury: '#B8860B',       // Gold luxury accent
  purpleAccent: '#9B7EBD', // Soft purple for elegance
}

export interface WellnessMetrics {
  hydrationLevel: number // 0-100
  sleepQuality: number // 0-100
  stressLevel: number // 0-100 (inverse - higher is better)
  skinHealth: number // 0-100
  energyLevel: number // 0-100
  satisfactionScore: number // 0-10
  lastUpdated: Date
}

export interface WellnessGoal {
  id: string
  title: string
  description: string
  category: 'hydration' | 'sleep' | 'skincare' | 'wellness' | 'lifestyle'
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  isCompleted: boolean
  milestones: Array<{
    id: string
    title: string
    value: number
    isAchieved: boolean
    achievedAt?: Date
  }>
}

export interface WellnessReminder {
  id: string
  title: string
  type: 'water' | 'skincare' | 'exercise' | 'meditation' | 'appointment'
  time: string
  isCompleted: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
}

export interface WellnessTrackerProps {
  clientId: string
  clientName: string
  avatarUrl?: string
  metrics: WellnessMetrics
  goals: WellnessGoal[]
  reminders: WellnessReminder[]
  treatmentHistory: Array<{
    date: Date
    treatment: string
    satisfaction: number
    notes?: string
  }>
  onUpdateMetrics?: (metrics: Partial<WellnessMetrics>) => void
  onAddGoal?: (goal: Omit<WellnessGoal, 'id' | 'currentValue' | 'isCompleted'>) => void
  onUpdateGoal?: (goalId: string, currentValue: number) => void
  onAddReminder?: (reminder: Omit<WellnessReminder, 'id' | 'isCompleted'>) => void
  onCompleteReminder?: (reminderId: string) => void
  className?: string
}

const WELLNESS_CATEGORIES = {
  hydration: {
    name: 'Hidratação',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: <Droplet className="h-4 w-4" />,
    description: 'Níveis adequados de hidratação para saúde da pele'
  },
  sleep: {
    name: 'Sono',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: <Moon className="h-4 w-4" />,
    description: 'Qualidade do sono para recuperação celular'
  },
  skincare: {
    name: 'Cuidados com a Pele',
    color: '#EC4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Rotina de cuidados para manter a saúde da pele'
  },
  wellness: {
    name: 'Bem-Estar',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    icon: <Heart className="h-4 w-4" />,
    description: 'Equilíbrio emocional e mental'
  },
  lifestyle: {
    name: 'Estilo de Vida',
    color: '#F59E0B',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    icon: <Sun className="h-4 w-4" />,
    description: 'Hábitos saudáveis para qualidade de vida'
  }
}

const REMINDER_TYPES = {
  water: {
    name: 'Água',
    icon: <Droplet className="h-4 w-4" />,
    color: '#3B82F6'
  },
  skincare: {
    name: 'Cuidados com a Pele',
    icon: <Sparkles className="h-4 w-4" />,
    color: '#EC4899'
  },
  exercise: {
    name: 'Exercício',
    icon: <Activity className="h-4 w-4" />,
    color: '#10B981'
  },
  meditation: {
    name: 'Meditação',
    icon: <Heart className="h-4 w-4" />,
    color: '#8B5CF6'
  },
  appointment: {
    name: 'Consulta',
    icon: <Calendar className="h-4 w-4" />,
    color: NEONPRO_COLORS.primary
  }
}

export const WellnessTracker: React.FC<WellnessTrackerProps> = ({
  clientId,
  clientName,
  avatarUrl,
  metrics,
  goals,
  reminders,
  treatmentHistory,
  onUpdateMetrics,
  onAddGoal,
  onUpdateGoal,
  onAddReminder,
  onCompleteReminder,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [todayReminders, setTodayReminders] = useState(reminders.filter(r => !r.isCompleted))

  // Calculate overall wellness score
  const overallWellnessScore = Math.round(
    (metrics.hydrationLevel + metrics.sleepQuality + metrics.stressLevel + 
     metrics.skinHealth + metrics.energyLevel) / 5
  )

  const getWellnessGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: '#10B981', label: 'Excelente' }
    if (score >= 80) return { grade: 'A', color: '#34D399', label: 'Ótimo' }
    if (score >= 70) return { grade: 'B', color: '#F59E0B', label: 'Bom' }
    if (score >= 60) return { grade: 'C', color: '#F97316', label: 'Regular' }
    return { grade: 'D', color: '#EF4444', label: 'Precisa Melhorar' }
  }

  const wellnessGrade = getWellnessGrade(overallWellnessScore)

  const getMetricIcon = (metric: string) => {
    const icons: Record<string, React.ReactNode> = {
      hydrationLevel: <Droplet className="h-4 w-4" />,
      sleepQuality: <Moon className="h-4 w-4" />,
      stressLevel: <Heart className="h-4 w-4" />,
      skinHealth: <Sparkles className="h-4 w-4" />,
      energyLevel: <Sun className="h-4 w-4" />,
      satisfactionScore: <Smile className="h-4 w-4" />
    }
    return icons[metric] || <Activity className="h-4 w-4" />
  }

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      hydrationLevel: 'Hidratação',
      sleepQuality: 'Qualidade do Sono',
      stressLevel: 'Nível de Estresse',
      skinHealth: 'Saúde da Pele',
      energyLevel: 'Nível de Energia',
      satisfactionScore: 'Satisfação'
    }
    return labels[metric] || metric
  }

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleCompleteReminder = (reminderId: string) => {
    setTodayReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, isCompleted: true } : r
    ))
    onCompleteReminder?.(reminderId)
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Sua jornada de bem-estar está progredindo maravilhosamente!",
      "Cada pequeno passo conta para uma grande transformação!",
      "Você está no caminho certo para uma vida mais saudável!",
      "Seu compromisso com o bem-estar é inspirador!",
      "Continue assim, os resultados estão aparecendo!"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Wellness Header */}
      <Card className={`${NEONPRO_COLORS.wellness} border-2`} style={{ borderColor: NEONPRO_COLORS.neutral }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2" style={{ borderColor: NEONPRO_COLORS.primary }}>
                <AvatarImage src={avatarUrl} alt={clientName} />
                <AvatarFallback className="text-base font-semibold">
                  {clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Painel de Bem-Estar
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {clientName} • Cliente #{clientId}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold mb-1" style={{ color: wellnessGrade.color }}>
                {overallWellnessScore}
              </div>
              <Badge 
                variant="default" 
                className="mb-2"
                style={{ backgroundColor: wellnessGrade.color, color: 'white' }}
              >
                {wellnessGrade.grade} - {wellnessGrade.label}
              </Badge>
              <div className="text-xs text-gray-600">
                Última atualização: {metrics.lastUpdated.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <Progress value={overallWellnessScore} className="h-3" />
            <p className="text-sm text-center text-gray-700 italic">
              {getMotivationalMessage()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
             onClick={() => setSelectedMetric('hydrationLevel')}>
          <div className="flex justify-center mb-2">
            <Droplet className="h-6 w-6 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.hydrationLevel)}`}>
            {metrics.hydrationLevel}%
          </div>
          <div className="text-xs text-gray-600">Hidratação</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
             onClick={() => setSelectedMetric('sleepQuality')}>
          <div className="flex justify-center mb-2">
            <Moon className="h-6 w-6 text-purple-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.sleepQuality)}`}>
            {metrics.sleepQuality}%
          </div>
          <div className="text-xs text-gray-600">Sono</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
             onClick={() => setSelectedMetric('stressLevel')}>
          <div className="flex justify-center mb-2">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.stressLevel)}`}>
            {metrics.stressLevel}%
          </div>
          <div className="text-xs text-gray-600">Bem-Estar</div>
        </div>

        <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200 cursor-pointer hover:bg-pink-100 transition-colors"
             onClick={() => setSelectedMetric('skinHealth')}>
          <div className="flex justify-center mb-2">
            <Sparkles className="h-6 w-6 text-pink-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.skinHealth)}`}>
            {metrics.skinHealth}%
          </div>
          <div className="text-xs text-gray-600">Saúde da Pele</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
             onClick={() => setSelectedMetric('energyLevel')}>
          <div className="flex justify-center mb-2">
            <Sun className="h-6 w-6 text-yellow-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.energyLevel)}`}>
            {metrics.energyLevel}%
          </div>
          <div className="text-xs text-gray-600">Energia</div>
        </div>

        <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
             onClick={() => setSelectedMetric('satisfactionScore')}>
          <div className="flex justify-center mb-2">
            <Smile className="h-6 w-6 text-indigo-600" />
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.satisfactionScore * 10)}`}>
            {metrics.satisfactionScore}/10
          </div>
          <div className="text-xs text-gray-600">Satisfação</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="reminders">Lembretes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => {
              const category = WELLNESS_CATEGORIES[goal.category]
              const progress = (goal.currentValue / goal.targetValue) * 100
              
              return (
                <Card key={goal.id} className={`${category.bgColor} ${category.borderColor} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div style={{ color: category.color }}>
                          {category.icon}
                        </div>
                        <CardTitle className="text-base">{goal.title}</CardTitle>
                      </div>
                      {goal.isCompleted && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{goal.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-semibold">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-gray-600 text-right">
                        {Math.round(progress)}% completo
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      Prazo: {goal.deadline.toLocaleDateString('pt-BR')}
                    </div>
                    
                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Marcos:</div>
                        <div className="space-y-1">
                          {goal.milestones.map(milestone => (
                            <div key={milestone.id} className="flex items-center gap-2 text-xs">
                              {milestone.isAchieved ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Circle className="h-3 w-3 text-gray-400" />
                              )}
                              <span className={milestone.isAchieved ? 'text-gray-700' : 'text-gray-500'}>
                                {milestone.title} ({milestone.value} {goal.unit})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!goal.isCompleted && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Atualizar Progresso
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          <Button
            onClick={() => onAddGoal?.({
              title: '',
              description: '',
              category: 'wellness',
              targetValue: 100,
              unit: '',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              milestones: []
            })}
            className="w-full"
            style={{ backgroundColor: NEONPRO_COLORS.primary, color: 'white' }}
          >
            <Target className="h-4 w-4 mr-2" />
            Adicionar Nova Meta
          </Button>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lembretes de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayReminders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-lg font-semibold">Todos os lembretes concluídos!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ótimo trabalho mantendo sua rotina de bem-estar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayReminders.map(reminder => {
                    const reminderType = REMINDER_TYPES[reminder.type]
                    
                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div style={{ color: reminderType.color }}>
                            {reminderType.icon}
                          </div>
                          <div>
                            <div className="font-medium">{reminder.title}</div>
                            <div className="text-sm text-gray-600">
                              {reminder.time} • {reminderType.name}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleCompleteReminder(reminder.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => onAddReminder?.({
                    title: '',
                    type: 'water',
                    time: '09:00',
                    frequency: 'daily'
                  })}
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Adicionar Lembrete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Tratamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {treatmentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum tratamento registrado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {treatmentHistory.map((treatment, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{treatment.treatment}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(treatment.satisfaction)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">
                              ({treatment.satisfaction}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {treatment.date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      {treatment.notes && (
                        <div className="text-sm text-gray-700 p-2 bg-white rounded border border-gray-200">
                          <strong>Nota:</strong> {treatment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wellness Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Insights de Bem-Estar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Forte</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Sua hidratação está excelente! Continue bebendo água regularmente.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Atenção</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Considere melhorar a qualidade do sono para melhores resultados.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Conquista</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Você mantém sua rotina de cuidados por 7 dias consecutivos!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Recomendações Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Aumente a ingestão de água</div>
                      <div className="text-xs text-gray-600">
                        Beba 2-3 copos extras por dia para melhor hidratação da pele
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Melhore a higiene do sono</div>
                      <div className="text-xs text-gray-600">
                        Tente dormir 30 minutos mais cedo e evite telas antes de dormir
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-pink-600 mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Consistência nos cuidados</div>
                      <div className="text-xs text-gray-600">
                        Mantenha sua rotina de skincare mesmo nos dias mais ocupados
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div>
                      <div className="font-medium text-sm">Pratique relaxamento</div>
                      <div className="text-xs text-gray-600">
                        10 minutos de meditação podem reduzir o estresse significativamente
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WellnessTracker