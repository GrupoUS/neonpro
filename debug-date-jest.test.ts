describe('Date Parsing Debug', () => {
  it('should parse dates correctly in Jest environment', () => {
    // Test the exact same logic from our validation
    const dateStr1 = "2025-01-01";
    const dateStr2 = "2025-01-02";
    
    console.log('=== Jest Date Parsing Test ===');
    console.log('Input strings:', { dateStr1, dateStr2 });
    
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    
    console.log('Parsed dates:', { date1, date2 });
    console.log('Date1 string:', date1.toString());
    console.log('Date2 string:', date2.toString());
    console.log('Date1 toISOString:', date1.toISOString());
    console.log('Date2 toISOString:', date2.toISOString());
    console.log('Date1 getTime:', date1.getTime());
    console.log('Date2 getTime:', date2.getTime());
    console.log('Comparison date1 < date2:', date1 < date2);
    console.log('Comparison date1.getTime() < date2.getTime():', date1.getTime() < date2.getTime());
    
    // Current date for reference
    const now = new Date();
    console.log('Current date:', now);
    console.log('Current date toISOString:', now.toISOString());
    
    // Test if Date constructor is working properly
    expect(date1.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(date2.toISOString()).toBe('2025-01-02T00:00:00.000Z');
    expect(date1 < date2).toBe(true);
  });
});