import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Plus, Filter } from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static header component
function AppointmentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your clinic appointments and schedule
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
    </div>
  )
}

// Simulate fetching appointments data
async function getAppointments() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: 1,
      patient: 'John Doe',
      doctor: 'Dr. Smith',
      time: '09:00 AM',
      date: '2024-01-15',
      treatment: 'Facial Treatment',
      status: 'confirmed',
      duration: 60
    },
    {
      id: 2,
      patient: 'Jane Wilson',
      doctor: 'Dr. Johnson',
      time: '10:30 AM',
      date: '2024-01-15',
      treatment: 'Botox Consultation',
      status: 'scheduled',
      duration: 45
    },
    {
      id: 3,
      patient: 'Michael Brown',
      doctor: 'Dr. Smith',
      time: '02:00 PM',
      date: '2024-01-15',
      treatment: 'Laser Treatment',
      status: 'completed',
      duration: 90
    },
    {
      id: 4,
      patient: 'Sarah Davis',
      doctor: 'Dr. Johnson',
      time: '03:30 PM',
      date: '2024-01-15',
      treatment: 'Chemical Peel',
      status: 'cancelled',
      duration: 75
    },
    {
      id: 5,
      patient: 'Robert Wilson',
      doctor: 'Dr. Smith',
      time: '04:45 PM',
      date: '2024-01-15',
      treatment: 'Consultation',
      status: 'scheduled',
      duration: 30
    }
  ]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

async function AppointmentsList() {
  const appointments = await getAppointments()

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{appointment.patient}</h3>
                  <p className="text-sm text-muted-foreground">
                    with {appointment.doctor}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {appointment.time} ({appointment.duration}min)
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="font-medium">{appointment.treatment}</p>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <AppointmentsHeader />
      
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-green-600">+12% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">79% confirmation rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">5% cancellation rate</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic Appointments List - Streamed */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<AppointmentsSkeleton />}>
            <AppointmentsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
