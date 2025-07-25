const { z } = require('zod');

console.log('Testing base date validation:');
const test1 = z.string().date().safeParse('2025-01-01');
console.log('z.string().date().safeParse("2025-01-01"):', JSON.stringify(test1, null, 2));

const test2 = z.string().date().safeParse('2025-01-02');
console.log('z.string().date().safeParse("2025-01-02"):', JSON.stringify(test2, null, 2));

console.log('\nTesting full object with base validation only:');
const baseSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  transactionType: z.string().optional(),
  search: z.string().optional()
});

const testData = {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-02',
  transactionType: 'receipt',
  search: 'test'
};

const baseResult = baseSchema.safeParse(testData);
console.log('Base schema result:', JSON.stringify(baseResult, null, 2));