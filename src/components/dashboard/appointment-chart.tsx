import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Simulate fetching appointment data
async function getAppointmentData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    thisWeek: [
      { day: 'Mon', appointments: 8 },
      { day: 'Tue', appointments: 12 },
      { day: 'Wed', appointments: 6 },
      { day: 'Thu', appointments: 15 },
      { day: 'Fri', appointments: 10 },
      { day: 'Sat', appointments: 4 },
      { day: 'Sun', appointments: 2 }
    ],
    total: 57,
    change: '+12%'
  }
}

export async function AppointmentChart() {
  const data = await getAppointmentData()
  const maxAppointments = Math.max(...data.thisWeek.map(d => d.appointments))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Appointments</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">{data.total}</span>
          <span className="text-sm text-green-600">{data.change}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.thisWeek.map((day) => (
            <div key={day.day} className="flex items-center space-x-3">
              <div className="w-8 text-sm text-muted-foreground">
                {day.day}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(day.appointments / maxAppointments) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">
                    {day.appointments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Average per day</span>
            <span className="font-medium">
              {Math.round(data.total / 7)} appointments
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
