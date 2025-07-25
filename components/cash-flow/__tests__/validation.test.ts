// Cash Flow Validation Tests
// Testing Zod validation schemas

import { 
  validateCashFlowEntry,
  validateCashRegister,
  validateCashFlowFilters,
  CashFlowEntrySchema,
  CashRegisterSchema,
  CashFlowFiltersSchema
} from '../utils/validation';

describe('Cash Flow Validation', () => {
  describe('CashFlowEntrySchema', () => {
    const validEntry = {
      clinic_id: '123e4567-e89b-12d3-a456-426614174000',
      transaction_type: 'receipt',
      category: 'service_payment',
      amount: 100.50,
      currency: 'BRL',
      description: 'Test transaction',
      payment_method: 'cash',
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    };

    it('validates correct cash flow entry', () => {
      const result = validateCashFlowEntry(validEntry);
      expect(result.success).toBe(true);
    });

    it('rejects invalid clinic_id', () => {
      const result = validateCashFlowEntry({
        ...validEntry,
        clinic_id: 'invalid-uuid'
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Invalid clinic ID');
    });

    it('rejects negative amounts', () => {
      const result = validateCashFlowEntry({
        ...validEntry,
        amount: -50
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Amount must be positive');
    });

    it('rejects empty description', () => {
      const result = validateCashFlowEntry({
        ...validEntry,
        description: ''
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Description is required');
    });

    it('rejects invalid transaction type', () => {
      const result = validateCashFlowEntry({
        ...validEntry,
        transaction_type: 'invalid_type'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CashRegisterSchema', () => {
    const validRegister = {
      clinic_id: '123e4567-e89b-12d3-a456-426614174000',
      register_name: 'Caixa Principal',
      register_code: 'CX001',
      location: 'Recepção',
      responsible_user_id: '123e4567-e89b-12d3-a456-426614174001',
      opening_balance: 1000.00,
      is_active: true
    };

    it('validates correct cash register', () => {
      const result = validateCashRegister(validRegister);
      expect(result.success).toBe(true);
    });

    it('rejects empty register name', () => {
      const result = validateCashRegister({
        ...validRegister,
        register_name: ''
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Register name is required');
    });

    it('rejects negative opening balance', () => {
      const result = validateCashRegister({
        ...validRegister,
        opening_balance: -100
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Opening balance cannot be negative');
    });
  });

  describe('CashFlowFiltersSchema', () => {
    it('validates correct filters', () => {
      try {
        process.stderr.write('🚀 TEST STARTED: validates correct filters\n');
        
        // Test with clearly different dates using YYYY-MM-DD format (date strings, not datetime)
        const filters = {
          dateFrom: '2025-01-01',
          dateTo: '2025-01-02',
          transactionType: 'receipt',
          search: 'test'
        };
        
        process.stderr.write('📦 Test data prepared: ' + JSON.stringify(filters, null, 2) + '\n');
        process.stderr.write('🔍 About to call validateCashFlowFilters function...\n');
        
        let result;
        try {
          result = validateCashFlowFilters(filters);
          process.stderr.write('✅ Function call completed successfully\n');
        } catch (validateError) {
          process.stderr.write('❌ Error during validation function call:\n');
          process.stderr.write('- Error type: ' + typeof validateError + '\n');
          process.stderr.write('- Error message: ' + (validateError?.message || 'N/A') + '\n');
          throw validateError;
        }
        
        process.stderr.write('📊 Raw result object: ' + JSON.stringify(result, null, 2) + '\n');
        process.stderr.write('📊 Result success: ' + result.success + '\n');
        
        if (!result.success) {
          process.stderr.write('❌ VALIDATION FAILED - ERROR ANALYSIS:\n');
          process.stderr.write('- Error exists: ' + !!result.error + '\n');
          
          if (result.error?.issues) {
            process.stderr.write('- Issues count: ' + result.error.issues.length + '\n');
            result.error.issues.forEach((issue, index) => {
              process.stderr.write(`  Issue ${index + 1}:\n`);
              process.stderr.write(`    - Code: ${issue.code}\n`);
              process.stderr.write(`    - Path: ${JSON.stringify(issue.path)}\n`);
              process.stderr.write(`    - Message: ${issue.message}\n`);
            });
          }
        } else {
          process.stderr.write('✅ Validation passed successfully\n');
          process.stderr.write('Parsed data: ' + JSON.stringify(result.data, null, 2) + '\n');
        }
        
        process.stderr.write('🎯 About to run assertion...\n');
        expect(result.success).toBe(true);
        
      } catch (testError) {
        process.stderr.write('🚨 UNEXPECTED ERROR IN TEST:\n');
        process.stderr.write('- Error type: ' + typeof testError + '\n');
        process.stderr.write('- Error message: ' + (testError?.message || 'N/A') + '\n');
        throw testError;
      }
    });

    it('rejects invalid date range', () => {
      const filters = {
        dateFrom: '2025-01-31',
        dateTo: '2025-01-01'
      };
      console.log('Testing filters:', filters);
      console.log('Date comparison:', new Date(filters.dateFrom), '<=', new Date(filters.dateTo), '=', new Date(filters.dateFrom) <= new Date(filters.dateTo));
      const result = validateCashFlowFilters(filters);
      console.log('Validation result:', result);
      if (!result.success) {
        console.log('Error details:', result.error?.issues);
      }
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Start date must be before end date');
    });

    it('validates empty filters', () => {
      const result = validateCashFlowFilters({});
      expect(result.success).toBe(true);
    });
  });
});