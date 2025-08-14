import AppointmentBookingFlow from '@/components/patient/appointments/booking/appointment-booking-flow'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Agendar Consulta | Portal do Paciente',
  description: 'Agende sua consulta de forma rápida e fácil através do nosso portal online.',
}

export default function PatientBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Suspense 
          fallback={
            <div className="flex justify-center items-center min-h-96">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <AppointmentBookingFlow />
        </Suspense>
      </div>
    </div>
  )
}
