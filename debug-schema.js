// Debug script to test schema behavior
import { createStockAlertConfigSchema } from './apps/web/app/lib/types/stock-alerts.ts';

const validCreateAlertConfig = {
  clinicId: '123e4567-e89b-12d3-a456-426614174000',
  productId: '223e4567-e89b-12d3-a456-426614174001',
  alertType: 'low_stock',
  thresholdValue: 10,
  thresholdUnit: 'quantity',
  severityLevel: 'medium',
  isActive: true,
  notificationChannels: ['email'],
  createdBy: '323e4567-e89b-12d3-a456-426614174002',
};

const invalidCreate = {
  ...validCreateAlertConfig,
  id: '123e4567-e89b-12d3-a456-426614174000',
};

console.log('Testing schema with ID field...');
const result = createStockAlertConfigSchema.safeParse(invalidCreate);
console.log('Result success:', result.success);
console.log('Result data:', result.data);
console.log('Result error:', result.error);

// Let's also check the schema shape
console.log('\nSchema shape:');
console.log('Schema keys:', Object.keys(createStockAlertConfigSchema.shape || {}));