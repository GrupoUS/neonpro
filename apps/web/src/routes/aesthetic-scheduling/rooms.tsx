import { createFileRoute, useLoaderData } from '@tanstack/react-router'
// import { useQuery } from "@tanstack/react-query";
import { RoomAllocation } from '@/components/aesthetic-scheduling/RoomAllocation'
import { apiClient as api } from '@/lib/api.js'
import { logger } from '@/utils/logger.js'


// Define loader data type
interface RoomAllocationLoaderData {
  appointmentId?: string
  treatmentPlanId?: string
  date?: string
}

export const Route = createFileRoute('/aesthetic-scheduling/rooms')({
  component: RoomAllocationPage,
  loader: async ({ search }) => {
    const appointmentId = search.appointmentId as string
    const treatmentPlanId = search.treatmentPlanId as string
    const date = search.date as string

    return {
      appointmentId,
      treatmentPlanId,
      date,
    } as RoomAllocationLoaderData
  },
})

function RoomAllocationPage() {
  const loaderData = useLoaderData({ from: '/aesthetic-scheduling/rooms/' })

  return (
    <RoomAllocation
      appointmentId={loaderData.appointmentId}
      treatmentPlanId={loaderData.treatmentPlanId}
      date={loaderData.date ? new Date(loaderData.date) : new Date()}
      onRoomAllocation={async allocation => {
        try {
          const result = await api.aestheticScheduling.createRoomAllocation(allocation)
          return result
        } catch (error) {
          await logger.error('Error creating room allocation:')
          throw error
        }
      }}
    />
  )
}
