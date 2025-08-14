/**
 * Date diagnostic test
 */

describe('Date Diagnostic', () => {
  it('should diagnose date behavior in Jest', () => {
    const futureDate = '2026-12-31T14:00:00.000Z';
    const appointmentDate = new Date(futureDate);
    const now = new Date();
    
    // Force test failure to see values
    expect({
      futureDate,
      appointmentDate: appointmentDate.toISOString(),
      appointmentDateStr: appointmentDate.toString(),
      now: now.toISOString(),
      nowStr: now.toString(),
      comparison: appointmentDate > now,
      appointmentTime: appointmentDate.getTime(),
      nowTime: now.getTime(),
      timeDiff: appointmentDate.getTime() - now.getTime()
    }).toEqual('FORCE_FAILURE_TO_SEE_VALUES');
  });
});