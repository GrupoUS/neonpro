import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static header component
function AIRecommendationsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered insights and treatment recommendations for optimal patient care
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline">
          <Brain className="mr-2 h-4 w-4" />
          Generate New Insights
        </Button>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          AI Analysis
        </Button>
      </div>
    </div>
  )
}

// Simulate fetching AI recommendations data
async function getAIRecommendations() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    insights: [
      {
        id: 1,
        type: 'treatment_optimization',
        title: 'Treatment Protocol Optimization',
        description: 'Based on patient response patterns, consider adjusting the facial rejuvenation protocol for John Doe',
        confidence: 92,
        priority: 'high',
        patient: 'John Doe',
        recommendations: [
          'Increase vitamin C concentration by 15%',
          'Add hyaluronic acid booster',
          'Extend treatment interval to 10 days'
        ],
        expectedOutcome: 'Improved skin hydration and faster results',
        generatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'scheduling_optimization',
        title: 'Appointment Scheduling Optimization',
        description: 'AI detected optimal time slots for better patient satisfaction and clinic efficiency',
        confidence: 87,
        priority: 'medium',
        patient: null,
        recommendations: [
          'Schedule laser treatments in morning slots (9-11 AM)',
          'Reserve afternoon for consultations',
          'Block Fridays for follow-up appointments'
        ],
        expectedOutcome: '15% increase in patient satisfaction and 20% better time utilization',
        generatedAt: '2024-01-15T09:15:00Z'
      },
      {
        id: 3,
        type: 'risk_assessment',
        title: 'Patient Risk Assessment',
        description: 'Potential adverse reaction risk identified for upcoming chemical peel treatment',
        confidence: 78,
        priority: 'high',
        patient: 'Sarah Davis',
        recommendations: [
          'Perform patch test 48 hours before treatment',
          'Reduce acid concentration by 20%',
          'Schedule additional consultation',
          'Prepare emergency protocols'
        ],
        expectedOutcome: 'Reduced risk of adverse reactions and improved safety',
        generatedAt: '2024-01-15T08:45:00Z'
      },
      {
        id: 4,
        type: 'revenue_optimization',
        title: 'Revenue Enhancement Opportunity',
        description: 'AI identified upselling opportunities based on patient treatment history',
        confidence: 85,
        priority: 'medium',
        patient: 'Multiple Patients',
        recommendations: [
          'Offer maintenance packages for completed treatments',
          'Suggest complementary treatments for current patients',
          'Implement loyalty program for frequent visitors'
        ],
        expectedOutcome: 'Potential 25% increase in monthly revenue',
        generatedAt: '2024-01-15T07:20:00Z'
      },
      {
        id: 5,
        type: 'equipment_maintenance',
        title: 'Equipment Maintenance Alert',
        description: 'Predictive maintenance suggests laser equipment calibration needed',
        confidence: 94,
        priority: 'high',
        patient: null,
        recommendations: [
          'Schedule laser calibration within 7 days',
          'Perform full diagnostic check',
          'Update treatment protocols if needed',
          'Document all maintenance activities'
        ],
        expectedOutcome: 'Prevent equipment downtime and maintain treatment quality',
        generatedAt: '2024-01-15T06:00:00Z'
      }
    ],
    summary: {
      totalInsights: 5,
      highPriority: 3,
      mediumPriority: 2,
      lowPriority: 0,
      avgConfidence: 87.2
    }
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'treatment_optimization':
      return TrendingUp
    case 'risk_assessment':
      return AlertTriangle
    case 'scheduling_optimization':
      return Clock
    case 'revenue_optimization':
      return CheckCircle
    case 'equipment_maintenance':
      return Brain
    default:
      return Brain
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return 'text-green-600'
  if (confidence >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

async function AIRecommendationsList() {
  const data = await getAIRecommendations()

  return (
    <div className="space-y-6">
      {data.insights.map((insight) => {
        const Icon = getTypeIcon(insight.type)
        
        return (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.patient ? `Patient: ${insight.patient}` : 'General Recommendation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority} priority
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">Confidence</p>
                    <p className={`text-lg font-bold ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{insight.description}</p>
              
              <div className="space-y-3">
                <h4 className="font-medium">AI Recommendations:</h4>
                <ul className="space-y-2">
                  {insight.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Expected Outcome:</h4>
                <p className="text-sm text-blue-800">{insight.expectedOutcome}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Generated: {new Date(insight.generatedAt).toLocaleString()}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Implement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function AIRecommendationsSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="flex space-x-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <AIRecommendationsHeader />
      
      {/* AI Insights Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-green-600">+2 new today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-green-600">High accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600">This month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic AI Recommendations List - Streamed */}
      <Suspense fallback={<AIRecommendationsSkeleton />}>
        <AIRecommendationsList />
      </Suspense>
    </div>
  )
}
