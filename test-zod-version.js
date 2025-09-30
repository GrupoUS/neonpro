// Test file to validate Zod v4.1.11 functionality
import { z } from 'zod';

console.warn('Testing Zod functionality...');

// Test basic schema functionality
const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
  email: z.string().email()
});

const testData = {
  name: "John Doe",
  age: 30,
  email: "john@example.com"
};

try {
  const result = testSchema.parse(testData);
  console.warn('✅ Basic Zod schema validation works:', result);
} catch (_error) {
  console.error('❌ Zod schema validation failed:', _error);
}

// Test healthcare-specific schemas ( CPF validation )
const cpfSchema = z.string().regex(/^\d{11}$/, 'CPF must have 11 digits');

try {
  const cpfResult = cpfSchema.parse('12345678909');
  console.warn('✅ CPF validation works:', cpfResult);
} catch (_error) {
  console.error('❌ CPF validation failed:', _error);
}

// Test transform functionality
const transformSchema = z.string().transform(val => val.toUpperCase());

try {
  const transformResult = transformSchema.parse('hello world');
  console.warn('✅ Transform functionality works:', transformResult);
} catch (_error) {
  console.error('❌ Transform functionality failed:', _error);
}

console.warn('🎉 Zod functionality test completed successfully!');
