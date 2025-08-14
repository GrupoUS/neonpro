// Trial Management Dashboard Component - STORY-SUB-002 Task 4
// Advanced trial management interface with user journey visualization
// Based on research: SaaS trial management best practices + shadcn/ui patterns
// Created: 2025-01-22

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Mail,
  Phone,
  MessageSquare,
  Zap,
  Target,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types from our trial management system
interface TrialUser {
  id: string
  userId: string
  email: string
  name: string
  avatar?: string
  stage: 'onboarding' | 'exploring' | 'engaged' | 'converting' | 'churning'
  startDate: Date
  endDate: Date
  daysRemaining: number
  conversionProbability: number
  lastActivity: Date
  features: string[]
  source: string
  plan: string
}interface TrialAction {
  id: string
  type: 'email' | 'call' | 'message' | 'feature-highlight'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  impact: number
}

interface TrialManagementProps {
  className?: string
}

// Stage color mapping
const STAGE_COLORS = {
  onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
  exploring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  engaged: 'bg-green-100 text-green-800 border-green-200',
  converting: 'bg-purple-100 text-purple-800 border-purple-200',
  churning: 'bg-red-100 text-red-800 border-red-200'
}

// Priority colors
const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

export function TrialManagement({ className }: TrialManagementProps) {
  const [trials, setTrials] = useState<TrialUser[]>([])
  const [actions, setActions] = useState<TrialAction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')

  // Fetch trial data
  useEffect(() => {
    const fetchTrialData = async () => {
      try {
        setLoading(true)
        const [trialsResponse, actionsResponse] = await Promise.all([
          fetch('/api/trial-management/active-trials'),
          fetch('/api/trial-management/recommended-actions')
        ])
        
        const trialsData = await trialsResponse.json()
        const actionsData = await actionsResponse.json()
        
        setTrials(trialsData)
        setActions(actionsData)
      } catch (error) {
        console.error('Failed to fetch trial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialData()
  }, [])  // Mock data for demonstration
  const mockTrials: TrialUser[] = [
    {
      id: '1',
      userId: 'usr_123',
      email: 'john.doe@company.com',
      name: 'John Doe',
      stage: 'engaged',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29'),
      daysRemaining: 7,
      conversionProbability: 78,
      lastActivity: new Date('2025-01-21'),
      features: ['Analytics', 'Reports', 'Integrations'],
      source: 'Google Ads',
      plan: 'Professional'
    },
    {
      id: '2',
      userId: 'usr_124',
      email: 'sarah.wilson@startup.com',
      name: 'Sarah Wilson',
      stage: 'churning',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-24'),
      daysRemaining: 2,
      conversionProbability: 23,
      lastActivity: new Date('2025-01-18'),
      features: ['Basic Features'],
      source: 'Organic',
      plan: 'Starter'
    },
    {
      id: '3',
      userId: 'usr_125',
      email: 'mike.chen@enterprise.com',
      name: 'Mike Chen',
      stage: 'converting',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-26'),
      daysRemaining: 4,
      conversionProbability: 92,
      lastActivity: new Date('2025-01-22'),
      features: ['All Features', 'Custom Integrations', 'Premium Support'],
      source: 'Referral',
      plan: 'Enterprise'
    }
  ]

  const mockActions: TrialAction[] = [
    {
      id: '1',
      type: 'email',
      title: 'Send feature discovery email',
      description: 'Help Sarah discover key features she hasn\'t used yet',
      priority: 'high',
      impact: 85
    },
    {
      id: '2',
      type: 'call',
      title: 'Schedule conversion call',
      description: 'Mike shows high conversion probability - time for sales call',
      priority: 'high',
      impact: 92
    },
    {
      id: '3',
      type: 'feature-highlight',
      title: 'Highlight advanced analytics',
      description: 'John is engaged but hasn\'t explored analytics yet',
      priority: 'medium',
      impact: 67
    }
  ]

  // Filter trials based on search and stage
  const filteredTrials = mockTrials.filter(trial => {
    const matchesSearch = trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = stageFilter === 'all' || trial.stage === stageFilter
    return matchesSearch && matchesStage
  })  // Get stage icon
  const getStageIcon = (stage: TrialUser['stage']) => {
    switch (stage) {
      case 'onboarding': return <Users className="h-4 w-4" />
      case 'exploring': return <Search className="h-4 w-4" />
      case 'engaged': return <CheckCircle className="h-4 w-4" />
      case 'converting': return <TrendingUp className="h-4 w-4" />
      case 'churning': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Get action icon
  const getActionIcon = (type: TrialAction['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'feature-highlight': return <Zap className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trial Management</h2>
          <p className="text-muted-foreground">
            Monitor and optimize active trial users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {mockTrials.length} Active Trials
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trials by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Stages</option>
          <option value="onboarding">Onboarding</option>
          <option value="exploring">Exploring</option>
          <option value="engaged">Engaged</option>
          <option value="converting">Converting</option>
          <option value="churning">At Risk</option>
        </select>
      </div>      <Tabs defaultValue="trials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trials">Active Trials</TabsTrigger>
          <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
        </TabsList>

        {/* Active Trials Tab */}
        <TabsContent value="trials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrials.map((trial) => (
              <Card key={trial.id} className="relative overflow-hidden">
                {/* Risk indicator */}
                {trial.conversionProbability < 30 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      At Risk
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trial.avatar} />
                      <AvatarFallback>
                        {trial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {trial.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {trial.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Stage Badge */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', STAGE_COLORS[trial.stage])}
                    >
                      {getStageIcon(trial.stage)}
                      <span className="ml-1 capitalize">{trial.stage}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {trial.daysRemaining} days left
                    </span>
                  </div>

                  {/* Conversion Probability */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Conversion Probability</span>
                      <span className="font-medium">{trial.conversionProbability}%</span>
                    </div>
                    <Progress 
                      value={trial.conversionProbability} 
                      className="h-2"
                    />
                  </div>

                  {/* Features Used */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Features Used</span>
                    <div className="flex flex-wrap gap-1">
                      {trial.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {trial.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{trial.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>        {/* Recommended Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {mockActions.map((action) => (
              <Card key={action.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{action.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline"
                            className={cn('text-xs', PRIORITY_COLORS[action.priority])}
                          >
                            {action.priority} priority
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {action.impact}% impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <div className="flex items-center space-x-2 pt-2">
                        <Button size="sm" className="text-xs">
                          Execute Action
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Schedule Later
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}