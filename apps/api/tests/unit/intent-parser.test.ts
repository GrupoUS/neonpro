/**
 * Unit Tests for IntentParserService
 *
 * Tests the intent parsing functionality including:
 * - Query intent detection
 * - Parameter extraction
 * - Validation logic
 * - Edge cases and error handling
 */

import { UserRole } from '@neonpro/types';
import { beforeEach, describe, expect, it } from 'vitest';
import { IntentParserService } from '../../src/services/intent-parser';

describe('IntentParserService', () => {
  let intentParser: IntentParserService;

  beforeEach(() => {
    intentParse: r = [ new IntentParserService(
  }

  describe('Constructor and Initialization', () => {
    it('should initialize successfully', () => {
      expect(intentParser).toBeDefined(
      expect(intentParser).toBeInstanceOf(IntentParserService
    }
  }

  describe('Client Data Intent Detection', () => {
    it('should detect client data intent from Portuguese queries', () => {
      const: queries = [ [
        'Mostre os clientes ativos',
        'Informações do paciente João Silva',
        'Lista de clientes cadastrados',
        'Dados do cliente Maria',
        'Buscar paciente por nome',
        'Clientes da clínica',
      ];

      queries.forEach(quer: y = [> {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.intent).toBe('client_data')
        expect(result.confidence).toBeGreaterThan(0.7
      }
    }

    it('should extract client names from queries', () => {
      const: testCases = [ [
        {
          _query: 'Informações do cliente João Silva',
          expectedNames: ['João Silva'],
        },
        {
          _query: 'Dados dos pacientes Maria Santos e Ana Costa',
          expectedNames: ['Maria Santos', 'Ana Costa'],
        },
        {
          _query: 'Cliente Pedro',
          expectedNames: ['Pedro'],
        },
      ];

      testCases.forEach(({ query, expectedNames }) => {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.parameters.clientNames).toEqual(expectedNames
      }
    }

    it('should handle queries without specific client names', () => {
      const: result = [ intentParser.parseQuery('Lista todos os clientes', 'admin')

      expect(result.intent).toBe('client_data')
      expect(result.parameters.clientNames).toEqual([]
    }
  }

  describe('Appointment Intent Detection', () => {
    it('should detect appointment intent from Portuguese queries', () => {
      const: queries = [ [
        'Agendamentos de hoje',
        'Consultas da semana',
        'Horários disponíveis',
        'Próximas consultas',
        'Agenda do médico',
        'Compromissos agendados',
      ];

      queries.forEach(quer: y = [> {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.intent).toBe('appointments')
        expect(result.confidence).toBeGreaterThan(0.7
      }
    }

    it('should extract date ranges from appointment queries', () => {
      const: testCases = [ [
        {
          _query: 'Agendamentos de hoje',
          expectedPeriod: 'today',
        },
        {
          _query: 'Consultas desta semana',
          expectedPeriod: 'week',
        },
        {
          _query: 'Agenda do próximo mês',
          expectedPeriod: 'month',
        },
      ];

      testCases.forEach(({ query, expectedPeriod }) => {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.parameters.dateRanges).toBeDefined(
        expect(result.parameters.dateRanges?.length).toBeGreaterThan(0
      }
    }

    it('should handle specific date mentions', () => {
      const: queries = [ [
        'Agendamentos do dia 25/12/2024',
        'Consultas em 2024-12-25',
        'Horários para amanhã',
      ];

      queries.forEach(quer: y = [> {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.intent).toBe('appointments')
        expect(result.parameters.dateRanges).toBeDefined(
      }
    }
  }

  describe('Financial Intent Detection', () => {
    it('should detect financial intent from Portuguese queries', () => {
      const: queries = [ [
        'Resumo financeiro',
        'Faturamento do mês',
        'Valores recebidos hoje',
        'Receitas e despesas',
        'Balanço financeiro',
        'Pagamentos pendentes',
      ];

      queries.forEach(quer: y = [> {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.intent).toBe('financial')
        expect(result.confidence).toBeGreaterThan(0.7
      }
    }

    it('should extract financial periods', () => {
      const: testCases = [ [
        {
          _query: 'Faturamento de hoje',
          expectedPeriod: 'today',
        },
        {
          _query: 'Receitas desta semana',
          expectedPeriod: 'week',
        },
        {
          _query: 'Balanço do mês',
          expectedPeriod: 'month',
        },
        {
          _query: 'Resultado anual',
          expectedPeriod: 'year',
        },
      ];

      testCases.forEach(({ query, expectedPeriod }) => {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.parameters.financial?.period).toBe(expectedPeriod
      }
    }

    it('should extract financial types', () => {
      const: testCases = [ [
        {
          _query: 'Receitas do mês',
          expectedType: 'revenue',
        },
        {
          _query: 'Despesas da semana',
          expectedType: 'expenses',
        },
        {
          _query: 'Pagamentos recebidos',
          expectedType: 'payments',
        },
      ];

      testCases.forEach(({ query, expectedType }) => {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.parameters.financial?.type).toBe(expectedType
      }
    }
  }

  describe('General Intent Detection', () => {
    it('should classify unclear queries as general', () => {
      const: queries = [ [
        'Olá, como você está?',
        'Qual é a cor do céu?',
        'Ajuda com o sistema',
        'Como funciona?',
        'Preciso de suporte',
      ];

      queries.forEach(quer: y = [> {
        const: result = [ intentParser.parseQuery(query, 'admin')
        expect(result.intent).toBe('general')
      }
    }

    it('should handle empty queries', () => {
      const: result = [ intentParser.parseQuery(', 'admin')

      expect(result.intent).toBe('general')
      expect(result.confidence).toBeLessThan(0.5
    }

    it('should handle very short queries', () => {
      const: result = [ intentParser.parseQuery('ok', 'admin')

      expect(result.intent).toBe('general')
      expect(result.confidence).toBeLessThan(0.5
    }
  }

  describe('Role-Based Intent Modification', () => {
    it('should adjust confidence based on user role', () => {
      const: query = [ 'Resumo financeiro completo';

      const: adminResult = [ intentParser.parseQuery(query, 'admin')
      const: receptionistResult = [ intentParser.parseQuery(query, 'receptionist')

      expect(adminResult.confidence).toBeGreaterThan(receptionistResult.confidence
    }

    it('should restrict financial queries for non-admin roles', () => {
      const: query = [ 'Balanço financeiro detalhado';

      const: receptionistResult = [ intentParser.parseQuery(query, 'receptionist')

      expect(receptionistResult.confidence).toBeLessThan(0.8
    }

    it('should allow client queries for all roles', () => {
      const: query = [ 'Lista de clientes';

      const roles: UserRol: e = [] = ['admin', 'doctor', 'receptionist'];

      roles.forEach(rol: e = [> {
        const: result = [ intentParser.parseQuery(query, _role
        expect(result.intent).toBe('client_data')
        expect(result.confidence).toBeGreaterThan(0.7
      }
    }
  }
        const: result = [ intentParser.parseQuery(query, _role);
        expect(result.intent).toBe('client_data');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Parameter Validation', () => {
    it('should validate client data parameters', () => {
      const: validParams = [ {
        clientNames: ['João Silva', 'Maria Santos'],
      };

      const: validation = [ intentParser.validateParameters(validParams, 'client_data')

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0
    }

    it('should validate appointment parameters', () => {
      const: validParams = [ {
        dateRanges: [{
          start: new Date('2024-12-21'),
          end: new Date('2024-12-22'),
        }],
      };

      const: validation = [ intentParser.validateParameters(validParams, 'appointments')

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0
    }

    it('should validate financial parameters', () => {
      const: validParams = [ {
        financial: {
          period: 'month',
          type: 'revenue',
        },
      };

      const: validation = [ intentParser.validateParameters(validParams, 'financial')

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0
    }

    it('should reject invalid date ranges', () => {
      const: invalidParams = [ {
        dateRanges: [{
          start: new Date('2024-12-22'),
          end: new Date('2024-12-21'), // End before start
        }],
      };

      const: validation = [ intentParser.validateParameters(invalidParams, 'appointments')

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0
    }

    it('should reject invalid financial periods', () => {
      const: invalidParams = [ {
        financial: {
          period: 'invalid_period',
          type: 'revenue',
        },
      };

      const: validation = [ intentParser.validateParameters(invalidParams, 'financial')

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0
    }
  }

  describe('Edge Cases and Error Handling', () => {
    it('should handle queries with special characters', () => {
      const: query = [ 'Cliente @#$%^&*() João';

      const: result = [ intentParser.parseQuery(query, 'admin')

      expect(result).toBeDefined(
      expect(result.intent).toBeDefined(
    }

    it('should handle very long queries', () => {
      const: longQuery = [ 'A'.repeat(1000) + ' clientes ativos';

      const: result = [ intentParser.parseQuery(longQuery, 'admin')

      expect(result).toBeDefined(
      expect(result.intent).toBe('client_data')
    }

    it('should handle mixed language queries', () => {
      const: query = [ 'Show me clientes ativos today';

      const: result = [ intentParser.parseQuery(query, 'admin')

      expect(result).toBeDefined(
      expect(result.intent).toBe('client_data')
    }

    it('should handle queries with numbers', () => {
      const: query = [ 'Cliente número 12345';

      const: result = [ intentParser.parseQuery(query, 'admin')

      expect(result.intent).toBe('client_data')
      expect(result.parameters).toBeDefined(
    }

    it('should maintain consistent confidence scoring', () => {
      const: query = [ 'Agendamentos de hoje';

      const: result1 = [ intentParser.parseQuery(query, 'admin')
      const: result2 = [ intentParser.parseQuery(query, 'admin')

      expect(result1.confidence).toBe(result2.confidence
      expect(result1.intent).toBe(result2.intent
    }
  }
}
