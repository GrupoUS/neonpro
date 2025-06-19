import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Stethoscope, CreditCard } from 'lucide-react'

// Simulate fetching recent activity data
async function getRecentActivity() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: 1,
      type: 'appointment',
      title: 'New appointment scheduled',
      description: 'Dr. Smith with John Doe',
      time: '2 minutes ago',
      icon: Calendar,
      status: 'scheduled'
    },
    {
      id: 2,
      type: 'treatment',
      title: 'Treatment completed',
      description: 'Facial treatment for Jane Smith',
      time: '15 minutes ago',
      icon: Stethoscope,
      status: 'completed'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      description: '$250 from Michael Johnson',
      time: '1 hour ago',
      icon: CreditCard,
      status: 'completed'
    },
    {
      id: 4,
      type: 'patient',
      title: 'New patient registered',
      description: 'Sarah Wilson joined the clinic',
      time: '2 hours ago',
      icon: User,
      status: 'new'
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Appointment cancelled',
      description: 'Dr. Johnson with Robert Brown',
      time: '3 hours ago',
      icon: Calendar,
      status: 'cancelled'
    }
  ]
}

export async function RecentActivity() {
  const activities = await getRecentActivity()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'new':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
