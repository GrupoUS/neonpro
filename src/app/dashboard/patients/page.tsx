import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { User, Plus, Search, Phone, Mail, Calendar } from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static header component
function PatientsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground">
          Manage your patient database and medical records
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-10 w-64"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>
    </div>
  )
}

// Simulate fetching patients data
async function getPatients() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  return [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      lastVisit: '2024-01-10',
      totalVisits: 12,
      status: 'active',
      nextAppointment: '2024-01-20'
    },
    {
      id: 2,
      name: 'Jane Wilson',
      email: 'jane.wilson@email.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1990-07-22',
      lastVisit: '2024-01-08',
      totalVisits: 8,
      status: 'active',
      nextAppointment: '2024-01-18'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: '1978-11-30',
      lastVisit: '2024-01-05',
      totalVisits: 25,
      status: 'active',
      nextAppointment: null
    },
    {
      id: 4,
      name: 'Sarah Davis',
      email: 'sarah.davis@email.com',
      phone: '+1 (555) 456-7890',
      dateOfBirth: '1992-05-18',
      lastVisit: '2023-12-15',
      totalVisits: 6,
      status: 'inactive',
      nextAppointment: null
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1 (555) 567-8901',
      dateOfBirth: '1988-09-12',
      lastVisit: '2024-01-12',
      totalVisits: 15,
      status: 'active',
      nextAppointment: '2024-01-25'
    }
  ]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function calculateAge(dateOfBirth: string) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

async function PatientsList() {
  const patients = await getPatients()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <Card key={patient.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Age {calculateAge(patient.dateOfBirth)}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {patient.email}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              {patient.phone}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Last visit: {patient.lastVisit}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total visits:</span>
                <span className="font-medium">{patient.totalVisits}</span>
              </div>
              
              {patient.nextAppointment && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Next appointment:</span>
                  <span className="font-medium text-primary">{patient.nextAppointment}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PatientsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            
            <div className="pt-2 border-t space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PatientsPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <PatientsHeader />
      
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+15 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">987</div>
            <p className="text-xs text-muted-foreground">80% of total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-green-600">+20% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Visits/Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5</div>
            <p className="text-xs text-green-600">+0.5 improvement</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic Patients List - Streamed */}
      <Suspense fallback={<PatientsSkeleton />}>
        <PatientsList />
      </Suspense>
    </div>
  )
}
