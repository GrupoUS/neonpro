/**
 * Test to see what Jest actually thinks the current date is
 */

describe('Jest Date Investigation', () => {
  it('should show what Jest thinks now is', () => {
    const now = new Date();
    const futureDate = new Date('2025-01-25T14:00:00.000Z');
    const comparison = futureDate > now;
    
    // Force failure to see actual values
    expect({
      now: now.toISOString(),
      nowTime: now.getTime(),
      futureDate: futureDate.toISOString(),
      futureTime: futureDate.getTime(),
      comparison: comparison,
      timeDiff: futureDate.getTime() - now.getTime(),
      dateNow: Date.now()
    }).toEqual('SHOW_ME_THE_VALUES');
  });
});
