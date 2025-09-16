import { describe, expect, it, vi } from 'vitest';
import { hasConflict } from '../utils/appointments';

vi.mock('../lib/prisma', () => ({
  prisma: {
    appointment: {
      count: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe('appointments conflict detection', () => {
  it('returns true when overlapping exists', async () => {
    const ok = await hasConflict({
      clinicId: 'c',
      professionalId: 'p',
      startTime: new Date('2025-01-01T10:00:00Z'),
      endTime: new Date('2025-01-01T11:00:00Z'),
    });
    expect(ok).toBe(true);
  });
});
