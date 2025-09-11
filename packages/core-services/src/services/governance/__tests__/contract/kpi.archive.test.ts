import { describe, expect, it } from 'vitest';
import { InMemoryKPIService } from '../../index';

describe('KPIService.archive (contract)', () => {
  it('requires rationale and sets status Archived', async () => {
    const svc = new InMemoryKPIService();
    await svc.register({ id: 'KPI-X', name: 'X Metric' });
    const archived = await svc.archive({ id: 'KPI-X', rationale: 'Replaced by KPI-Y' });
    expect(archived.status).toBe('Archived');
  });

  it('throws if rationale missing', async () => {
    const svc = new InMemoryKPIService();
    await svc.register({ id: 'KPI-Y', name: 'Y Metric' });
    // @ts-expect-error testing missing rationale
    await expect(svc.archive({ id: 'KPI-Y' })).rejects.toThrow(/rationale/i);
  });
});
