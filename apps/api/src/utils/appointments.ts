import { prisma } from '../lib/prisma'

export async function hasConflict(params: { clinicId: string; professionalId: string; startTime: Date; endTime: Date; excludeId?: string }) {
  const where: any = {
    clinicId: params.clinicId,
    professionalId: params.professionalId,
    status: { in: ['scheduled', 'confirmed'] },
    ...(params.excludeId ? { NOT: { id: params.excludeId } } : {}),
    OR: [
      { startTime: { lt: params.endTime }, endTime: { gt: params.startTime } },
    ],
  }
  const count = await prisma.appointment.count({ where })
  return count > 0
}
