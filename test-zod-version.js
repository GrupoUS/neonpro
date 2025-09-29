// Test file to validate Zod v4.1.11 functionality
import { z } from 'zod';

console.log('Testing Zod version:', z.version);

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
  console.log('✅ Basic Zod schema validation works:', result);
} catch (error) {
  console.error('❌ Zod schema validation failed:', error);
}

// Test healthcare-specific schemas ( CPF validation )
const cpfSchema = z.string().regex(/^\d{11}$/, 'CPF must have 11 digits');

try {
  const cpfResult = cpfSchema.parse('12345678909');
  console.log('✅ CPF validation works:', cpfResult);
} catch (error) {
  console.error('❌ CPF validation failed:', error);
}

// Test transform functionality
const transformSchema = z.string().transform(val => val.toUpperCase());

try {
  const transformResult = transformSchema.parse('hello world');
  console.log('✅ Transform functionality works:', transformResult);
} catch (error) {
  console.error('❌ Transform functionality failed:', error);
}

console.log('🎉 Zod v4.1.11 test completed successfully!');