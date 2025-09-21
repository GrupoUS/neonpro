import { describe, expect, it, vi } from 'vitest';
import { hasConflict } from '../utils/appointments';

vi.mock(_'../lib/prisma',_() => ({
  prisma: {
    appointment: {
      count: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe(_'appointments conflict detection',_() => {
  it(_'returns true when overlapping exists',_async () => {
    const ok = await hasConflict({
      clinicId: 'c',
      professionalId: 'p',
      startTime: new Date('2025-01-01T10:00:00Z'),
      endTime: new Date('2025-01-01T11:00:00Z'),
    });
    expect(ok).toBe(true);
  });
});
