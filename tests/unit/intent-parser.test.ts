import { describe, it, expect, beforeEach } from 'vitest';
import { IntentParserService } from '../../apps/api/src/services/intent-parser';
import { QueryIntent, QueryParameters, UserRole } from '@neonpro/types';

describe('IntentParserService', () => {
  let intentParser: IntentParserService;

  beforeEach(() => {
<<<<<<< HEAD
    intentParser = new IntentParserService(
  }
=======
    intentParser = new IntentParserService();
  });
>>>>>>> origin/main

  describe('Query Parsing - Client Data Intent', () => {
    it('should identify client data queries in Portuguese', () => {
      const queries = [
        'mostrar clientes',
        'listar todos os pacientes',
        'dados do cliente João Silva',
        'informações do paciente Maria Santos',
        'clientes cadastrados',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).toBe('client_data')
        expect(result.confidence).toBeGreaterThan(0.5
      }
    }

    it('should identify client data queries with names', () => {
      const result = intentParser.parseQuery('cliente João Silva', 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
      expect(result.parameters.clientNames).toContain('João Silva')
      expect(result.confidence).toBeGreaterThan(0.7
    }

    it('should handle multiple client names', () => {
      const result = intentParser.parseQuery('clientes João Silva e Maria Santos', 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
      expect(result.parameters.clientNames).toContain('João Silva')
      expect(result.parameters.clientNames).toContain('Maria Santos')
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).toBe('client_data');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should identify client data queries with names', () => {
      const result = intentParser.parseQuery('cliente João Silva', 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
      expect(result.parameters.clientNames).toContain('João Silva');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should handle multiple client names', () => {
      const result = intentParser.parseQuery('clientes João Silva e Maria Santos', 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
      expect(result.parameters.clientNames).toContain('João Silva');
      expect(result.parameters.clientNames).toContain('Maria Santos');
    });
  });
>>>>>>> origin/main

  describe('Query Parsing - Appointments Intent', () => {
    it('should identify appointment queries in Portuguese', () => {
      const queries = [
        'próximos agendamentos',
        'consultas de hoje',
        'agendamentos para amanhã',
        'consultas marcadas',
        'esta semana agendamentos',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).toBe('appointments')
        expect(result.confidence).toBeGreaterThan(0.5
      }
    }

    it('should extract date ranges for appointments', () => {
      const result = intentParser.parseQuery('agendamentos para amanhã', 'healthcare_professional')
      
      expect(result.intent).toBe('appointments')
      expect(result.parameters.dateRange).toBeDefined(
      expect(result.confidence).toBeGreaterThan(0.6
    }

    it('should handle appointment queries with client names', () => {
      const result = intentParser.parseQuery('consultas para João Silva', 'healthcare_professional')
      
      expect(result.intent).toBe('appointments')
      expect(result.parameters.clientNames).toContain('João Silva')
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).toBe('appointments');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should extract date ranges for appointments', () => {
      const result = intentParser.parseQuery('agendamentos para amanhã', 'healthcare_professional');
      
      expect(result.intent).toBe('appointments');
      expect(result.parameters.dateRange).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should handle appointment queries with client names', () => {
      const result = intentParser.parseQuery('consultas para João Silva', 'healthcare_professional');
      
      expect(result.intent).toBe('appointments');
      expect(result.parameters.clientNames).toContain('João Silva');
    });
  });
>>>>>>> origin/main

  describe('Query Parsing - Financial Intent', () => {
    it('should identify financial queries in Portuguese', () => {
      const queries = [
        'como está o faturamento',
        'resumo financeiro',
        'receita gerada',
        'pagamentos recebidos',
        'balanço contábil',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).toBe('financial')
        expect(result.confidence).toBeGreaterThan(0.5
      }
    }

    it('should extract financial types', () => {
      const result = intentParser.parseQuery('receita do mês', 'healthcare_professional')
      
      expect(result.intent).toBe('financial')
      expect(result.parameters.financialType).toBe('revenue')
      expect(result.confidence).toBeGreaterThan(0.6
    }

    it('should extract date ranges for financial queries', () => {
      const result = intentParser.parseQuery('faturamento deste mês', 'healthcare_professional')
      
      expect(result.intent).toBe('financial')
      expect(result.parameters.dateRange).toBeDefined(
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).toBe('financial');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should extract financial types', () => {
      const result = intentParser.parseQuery('receita do mês', 'healthcare_professional');
      
      expect(result.intent).toBe('financial');
      expect(result.parameters.financialType).toBe('revenue');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should extract date ranges for financial queries', () => {
      const result = intentParser.parseQuery('faturamento deste mês', 'healthcare_professional');
      
      expect(result.intent).toBe('financial');
      expect(result.parameters.dateRange).toBeDefined();
    });
  });
>>>>>>> origin/main

  describe('Query Parsing - General Intent', () => {
    it('should identify general greeting queries', () => {
      const queries = [
        'olá',
        'bom dia',
        'boa tarde',
        'oi',
        'como você pode me ajudar',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).toBe('general')
        expect(result.confidence).toBeGreaterThan(0.3
      }
    }

    it('should handle help requests', () => {
      const result = intentParser.parseQuery('ajuda', 'healthcare_professional')
      
      expect(result.intent).toBe('general')
      expect(result.confidence).toBeGreaterThan(0.5
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).toBe('general');
        expect(result.confidence).toBeGreaterThan(0.3);
      });
    });

    it('should handle help requests', () => {
      const result = intentParser.parseQuery('ajuda', 'healthcare_professional');
      
      expect(result.intent).toBe('general');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
>>>>>>> origin/main

  describe('Query Parsing - Unknown Intent', () => {
    it('should return unknown for unclear queries', () => {
      const queries = [
        'xyz',
        'asdfgh',
        'qualquer coisa',
        'não sei',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).toBe('unknown')
        expect(result.confidence).toBeLessThan(0.5
      }
    }
  }

  describe('Query Normalization', () => {
    it('should normalize Portuguese text with accents', () => {
      const result = intentParser.parseQuery('agendamentos para amanhã', 'healthcare_professional')
      
      expect(result.intent).toBe('appointments')
      expect(result.confidence).toBeGreaterThan(0.5
    }

    it('should handle mixed case and punctuation', () => {
      const result = intentParser.parseQuery('Mostrar CLIENTES cadastrados!', 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
      expect(result.confidence).toBeGreaterThan(0.5
    }

    it('should normalize whitespace', () => {
      const result = intentParser.parseQuery('   mostar    clientes   ', 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
      expect(result.confidence).toBeGreaterThan(0.5
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).toBe('unknown');
        expect(result.confidence).toBeLessThan(0.5);
      });
    });
  });

  describe('Query Normalization', () => {
    it('should normalize Portuguese text with accents', () => {
      const result = intentParser.parseQuery('agendamentos para amanhã', 'healthcare_professional');
      
      expect(result.intent).toBe('appointments');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle mixed case and punctuation', () => {
      const result = intentParser.parseQuery('Mostrar CLIENTES cadastrados!', 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should normalize whitespace', () => {
      const result = intentParser.parseQuery('   mostar    clientes   ', 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
>>>>>>> origin/main

  describe('Parameter Extraction', () => {
    it('should extract client names from various formats', () => {
      const testCases = [
        { query: 'cliente João Silva', expected: ['João Silva'] },
        { query: 'paciente Maria dos Santos', expected: ['Maria dos Santos'] },
        { query: 'clientes João e Maria', expected: ['João', 'Maria'] },
        { query: 'dados do João Silva', expected: ['João Silva'] },
      ];

      testCases.forEach(({ query, expected }) => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        if (result.intent === 'client_data') {
          expected.forEach(name => {
            expect(result.parameters.clientNames).toContain(name
          }
        }
      }
    }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        if (result.intent === 'client_data') {
          expected.forEach(name => {
            expect(result.parameters.clientNames).toContain(name);
          });
        }
      });
    });
>>>>>>> origin/main

    it('should extract date ranges correctly', () => {
      const testCases = [
        { query: 'agendamentos de hoje', expected: 'today' },
        { query: 'consultas para amanhã', expected: 'tomorrow' },
        { query: 'esta semana', expected: 'this_week' },
        { query: 'este mês', expected: 'this_month' },
      ];

      testCases.forEach(({ query, expected }) => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        if (result.parameters.dateRange) {
          // The dateRange should be populated with appropriate dates
          expect(result.parameters.dateRange).toBeDefined(
        }
      }
    }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        if (result.parameters.dateRange) {
          // The dateRange should be populated with appropriate dates
          expect(result.parameters.dateRange).toBeDefined();
        }
      });
    });
>>>>>>> origin/main

    it('should extract financial types', () => {
      const testCases = [
        { query: 'receita do mês', expected: 'revenue' },
        { query: 'pagamentos recebidos', expected: 'payments' },
        { query: 'despesas do trimestre', expected: 'expenses' },
        { query: 'faturamento anual', expected: 'revenue' },
      ];

      testCases.forEach(({ query, expected }) => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        if (result.intent === 'financial') {
          expect(result.parameters.financialType).toBe(expected
        }
      }
    }
  }

  describe('Confidence Scoring', () => {
    it('should return high confidence for clear intent matches', () => {
      const result = intentParser.parseQuery('mostrar todos os clientes', 'healthcare_professional')
      
      expect(result.confidence).toBeGreaterThan(0.8
    }

    it('should return medium confidence for partial matches', () => {
      const result = intentParser.parseQuery('clientes', 'healthcare_professional')
      
      expect(result.confidence).toBeGreaterThan(0.5
      expect(result.confidence).toBeLessThan(0.8
    }

    it('should return low confidence for ambiguous queries', () => {
      const result = intentParser.parseQuery('dados', 'healthcare_professional')
      
      expect(result.confidence).toBeLessThan(0.5
    }
  }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        if (result.intent === 'financial') {
          expect(result.parameters.financialType).toBe(expected);
        }
      });
    });
  });

  describe('Confidence Scoring', () => {
    it('should return high confidence for clear intent matches', () => {
      const result = intentParser.parseQuery('mostrar todos os clientes', 'healthcare_professional');
      
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return medium confidence for partial matches', () => {
      const result = intentParser.parseQuery('clientes', 'healthcare_professional');
      
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should return low confidence for ambiguous queries', () => {
      const result = intentParser.parseQuery('dados', 'healthcare_professional');
      
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
>>>>>>> origin/main

  describe('Role-Based Processing', () => {
    it('should process queries differently based on user role', () => {
      const query = 'mostrar informações';
      
<<<<<<< HEAD
      const professionalResult = intentParser.parseQuery(query, 'healthcare_professional')
      const receptionistResult = intentParser.parseQuery(query, 'receptionist')
      
      // Both should detect the same intent, but parameters might differ based on role
      expect(professionalResult.intent).toBe(receptionistResult.intent
    }
  }

  describe('Edge Cases', () => {
    it('should handle empty queries', () => {
      const result = intentParser.parseQuery('', 'healthcare_professional')
      
      expect(result.intent).toBe('unknown')
      expect(result.confidence).toBe(0
    }

    it('should handle queries with only special characters', () => {
      const result = intentParser.parseQuery('!@#$%', 'healthcare_professional')
      
      expect(result.intent).toBe('unknown')
      expect(result.confidence).toBe(0
    }

    it('should handle very long queries', () => {
      const longQuery = 'clientes '.repeat(100
      const result = intentParser.parseQuery(longQuery, 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
    }

    it('should handle queries with numbers', () => {
      const result = intentParser.parseQuery('clientes com id 123', 'healthcare_professional')
      
      expect(result.intent).toBe('client_data')
      expect(result.confidence).toBeGreaterThan(0.5
    }
  }
=======
      const professionalResult = intentParser.parseQuery(query, 'healthcare_professional');
      const receptionistResult = intentParser.parseQuery(query, 'receptionist');
      
      // Both should detect the same intent, but parameters might differ based on role
      expect(professionalResult.intent).toBe(receptionistResult.intent);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queries', () => {
      const result = intentParser.parseQuery('', 'healthcare_professional');
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle queries with only special characters', () => {
      const result = intentParser.parseQuery('!@#$%', 'healthcare_professional');
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle very long queries', () => {
      const longQuery = 'clientes '.repeat(100);
      const result = intentParser.parseQuery(longQuery, 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
    });

    it('should handle queries with numbers', () => {
      const result = intentParser.parseQuery('clientes com id 123', 'healthcare_professional');
      
      expect(result.intent).toBe('client_data');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
>>>>>>> origin/main

  describe('Performance Tests', () => {
    it('should parse queries quickly', () => {
      const queries = [
        'mostrar clientes',
        'agendamentos para amanhã',
        'faturamento deste mês',
        'paciente João Silva',
      ];

<<<<<<< HEAD
      const startTime = Date.now(
      queries.forEach(query => {
        intentParser.parseQuery(query, 'healthcare_professional')
      }
      const endTime = Date.now(

      expect(endTime - startTime).toBeLessThan(50); // Should parse all queries in under 50ms
    }
=======
      const startTime = Date.now();
      queries.forEach(query => {
        intentParser.parseQuery(query, 'healthcare_professional');
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Should parse all queries in under 50ms
    });
>>>>>>> origin/main

    it('should handle concurrent parsing', async () => {
      const queries = [
        'clientes João Silva',
        'agendamentos para amanhã',
        'faturamento deste mês',
        'dados do paciente Maria',
      ];

      const promises = queries.map(query => 
        Promise.resolve(intentParser.parseQuery(query, 'healthcare_professional'))
<<<<<<< HEAD
      

      const results = await Promise.all(promises
      
      expect(results.length).toBe(queries.length
      results.forEach(result => {
        expect(result.intent).not.toBe('unknown')
      }
    }
  }
=======
      );

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(queries.length);
      results.forEach(result => {
        expect(result.intent).not.toBe('unknown');
      });
    });
  });
>>>>>>> origin/main

  describe('Portuguese Language Support', () => {
    it('should handle Portuguese special characters correctly', () => {
      const queries = [
        'agendamentos para amanhã',
        'paciente João',
        'faturamento',
        'informações do cliente',
        'consultas marcadas',
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(result.intent).not.toBe('unknown')
        expect(result.confidence).toBeGreaterThan(0.3
      }
    }
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(result.intent).not.toBe('unknown');
        expect(result.confidence).toBeGreaterThan(0.3);
      });
    });
>>>>>>> origin/main

    it('should understand Brazilian Portuguese variations', () => {
      const queries = [
        'mostrar os clientes', // formal
        'mostra clientes',     // informal
        'clientes cadastro',   // incomplete
        'pacientes',           // synonym
      ];

      queries.forEach(query => {
<<<<<<< HEAD
        const result = intentParser.parseQuery(query, 'healthcare_professional')
        expect(['client_data', 'unknown']).toContain(result.intent
      }
    }
  }
}
=======
        const result = intentParser.parseQuery(query, 'healthcare_professional');
        expect(['client_data', 'unknown']).toContain(result.intent);
      });
    });
  });
});
>>>>>>> origin/main
