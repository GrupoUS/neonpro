import { describe, expect, it } from 'vitest';
import { InMemoryKPIService } from '../../index';

// Contract: duplicate rejection & provisionalSince set when provisional flag true

describe('KPIService.register (contract)', () => {
  it('sets provisionalSince when provisional flag provided', async () => {
    const svc = new InMemoryKPIService();
    const rec = await svc.register({ id: 'KPI-NO_SHOW', name: 'No-show Rate', provisional: true });
    expect(rec.status).toBe('Provisional');
    expect(rec.provisionalSince).toBeInstanceOf(Date);
  });

  it('rejects duplicate id registration', async () => {
    const svc = new InMemoryKPIService();
    await svc.register({ id: 'KPI-NO_SHOW', name: 'No-show Rate' });
    await expect(svc.register({ id: 'KPI-NO_SHOW', name: 'No-show Rate' })).rejects.toThrow(
      /duplicate/i,
    );
  });
});
