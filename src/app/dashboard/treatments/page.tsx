import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Stethoscope, Plus, Search, Clock, DollarSign, User, Brain } from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static header component
function TreatmentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Treatments</h1>
        <p className="text-muted-foreground">
          Manage treatment plans and track patient progress
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            className="pl-10 w-64"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Treatment
        </Button>
      </div>
    </div>
  )
}

// Simulate fetching treatments data
async function getTreatments() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: 1,
      name: 'Facial Rejuvenation',
      patient: 'John Doe',
      doctor: 'Dr. Smith',
      startDate: '2024-01-10',
      duration: '4 weeks',
      cost: 1200,
      status: 'in_progress',
      progress: 60,
      aiRecommendations: [
        'Consider adding vitamin C serum',
        'Increase hydration protocol'
      ],
      nextSession: '2024-01-20'
    },
    {
      id: 2,
      name: 'Botox Treatment',
      patient: 'Jane Wilson',
      doctor: 'Dr. Johnson',
      startDate: '2024-01-08',
      duration: '1 session',
      cost: 450,
      status: 'completed',
      progress: 100,
      aiRecommendations: [
        'Schedule follow-up in 3 months',
        'Monitor for any adverse reactions'
      ],
      nextSession: null
    },
    {
      id: 3,
      name: 'Laser Hair Removal',
      patient: 'Michael Brown',
      doctor: 'Dr. Smith',
      startDate: '2024-01-05',
      duration: '8 sessions',
      cost: 800,
      status: 'in_progress',
      progress: 37,
      aiRecommendations: [
        'Avoid sun exposure',
        'Use recommended aftercare products'
      ],
      nextSession: '2024-01-25'
    },
    {
      id: 4,
      name: 'Chemical Peel',
      patient: 'Sarah Davis',
      doctor: 'Dr. Johnson',
      startDate: '2024-01-12',
      duration: '3 sessions',
      cost: 600,
      status: 'planned',
      progress: 0,
      aiRecommendations: [
        'Prepare skin with gentle cleanser',
        'Discontinue retinoids 1 week prior'
      ],
      nextSession: '2024-01-22'
    },
    {
      id: 5,
      name: 'Microneedling',
      patient: 'Robert Wilson',
      doctor: 'Dr. Smith',
      startDate: '2024-01-15',
      duration: '6 sessions',
      cost: 900,
      status: 'in_progress',
      progress: 16,
      aiRecommendations: [
        'Apply growth factor serum',
        'Maintain strict sun protection'
      ],
      nextSession: '2024-01-29'
    }
  ]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'planned':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

async function TreatmentsList() {
  const treatments = await getTreatments()

  return (
    <div className="space-y-6">
      {treatments.map((treatment) => (
        <Card key={treatment.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{treatment.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {treatment.patient} • {treatment.doctor}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(treatment.status)}>
                {treatment.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{treatment.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cost</p>
                  <p className="text-sm text-muted-foreground">${treatment.cost}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Started</p>
                  <p className="text-sm text-muted-foreground">{treatment.startDate}</p>
                </div>
              </div>
              
              {treatment.nextSession && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Next Session</p>
                    <p className="text-sm text-muted-foreground">{treatment.nextSession}</p>
                  </div>
                </div>
              )}
            </div>
            
            {treatment.status === 'in_progress' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{treatment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${treatment.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-medium">AI Recommendations</h4>
              </div>
              <ul className="space-y-1">
                {treatment.aiRecommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="w-1 h-1 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm">
                Update Progress
              </Button>
              <Button variant="outline" size="sm">
                Schedule Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TreatmentsSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="flex space-x-2 pt-2">
              {[...Array(3)].map((_, k) => (
                <div key={k} className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function TreatmentsPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <TreatmentsHeader />
      
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-green-600">+8 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-green-600">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-green-600">+2% improvement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-green-600">+22% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic Treatments List - Streamed */}
      <Suspense fallback={<TreatmentsSkeleton />}>
        <TreatmentsList />
      </Suspense>
    </div>
  )
}
