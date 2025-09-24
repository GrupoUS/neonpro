/**
 * CONTRACT TEST: POST /api/v2/patients/search (T016)
 *
 * Tests advanced patient search endpoint contract:
 * - Complex search queries and filters
 * - Performance requirements (<300ms for search)
 * - Brazilian data search (CPF, phone patterns)
 * - Fuzzy matching and suggestions
 * - Search analytics and optimization
 */

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'

// Search request schema validation
const _SearchPatientsRequestSchema = z.object({
  _query: z.string().optional(),
  filters: z
    .object({
      name: z.string().optional(),
      cpf: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      status: z.enum(['active', 'inactive', 'archived']).optional(),
      ageRange: z
        .object({
          min: z.number().min(0).max(150).optional(),
          max: z.number().min(0).max(150).optional(),
        })
        .optional(),
      dateRange: z
        .object({
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
      medicalConditions: z.array(z.string()).optional(),
      city: z.string().optional(),
      state: z.string().length(2).optional(),
    })
    .optional(),
  options: z
    .object({
      fuzzyMatching: z.boolean().default(true),
      includeInactive: z.boolean().default(false),
      maxResults: z.number().min(1).max(100).default(20),
      sortBy: z
        .enum(['relevance', 'name', 'createdAt', 'updatedAt'])
        .default('relevance'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
    .optional(),
})

// Search response schema validation
const SearchPatientsResponseSchema = z.object({
  results: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
      phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
      email: z.string().email(),
      dateOfBirth: z.string().datetime(),
      gender: z.enum(['male', 'female', 'other']),
      status: z.enum(['active', 'inactive', 'archived']),
      address: z.object({
        city: z.string(),
        state: z.string().length(2),
        neighborhood: z.string(),
      }),
      relevanceScore: z.number().min(0).max(1), // Search relevance
      matchedFields: z.array(z.string()), // Which fields matched the search
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  ),
  pagination: z.object({
    total: z.number().min(0),
    count: z.number().min(0),
    hasMore: z.boolean(),
  }),
  searchMetadata: z.object({
    _query: z.string().optional(),
    searchTime: z.number().max(300), // Performance requirement: <300ms
    indexUsed: z.boolean(),
    suggestions: z.array(z.string()).optional(),
  }),
  performanceMetrics: z.object({
    duration: z.number().max(300), // Performance requirement: <300ms
    queryComplexity: z.number(),
  }),
})

describe('POST /api/v2/patients/search - Contract Tests', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  }

  beforeAll(async () => {
    // Create diverse test patients for search testing
    const testPatients = [
      {
        name: 'Maria Silva Santos',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        email: 'maria.silva@example.com',
        dateOfBirth: '1985-05-15T00:00:00.000Z',
        gender: 'female',
        city: 'São Paulo',
        state: 'SP',
        conditions: ['Diabetes', 'Hypertension'],
      },
      {
        name: 'João Pedro Oliveira',
        cpf: '987.654.321-09',
        phone: '(21) 88888-8888',
        email: 'joao.pedro@example.com',
        dateOfBirth: '1990-12-03T00:00:00.000Z',
        gender: 'male',
        city: 'Rio de Janeiro',
        state: 'RJ',
        conditions: ['Asthma'],
      },
      {
        name: 'Ana Carolina Costa',
        cpf: '555.666.777-88',
        phone: '(31) 77777-7777',
        email: 'ana.carolina@example.com',
        dateOfBirth: '1978-08-20T00:00:00.000Z',
        gender: 'female',
        city: 'Belo Horizonte',
        state: 'MG',
        conditions: ['Migraine'],
      },
    ]

    for (const patient of testPatients) {
      await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: patient.name,
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: {
            street: 'Rua Teste',
            number: '123',
            neighborhood: 'Centro',
            city: patient.city,
            state: patient.state,
            zipCode: '01000-000',
          },
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '(11) 99999-9999',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })
    }
  })

  afterAll(async () => {
    // Cleanup test data
  })

  describe('Basic Search Functionality', () => {
    it('should perform global text search with correct schema', async () => {
      const searchRequest = {
        _query: 'Maria',
        options: {
          maxResults: 10,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      // Validate response schema
      const validatedData = SearchPatientsResponseSchema.parse(response.body)
      expect(validatedData).toBeDefined()

      // Should find Maria Silva Santos
      expect(response.body.results.length).toBeGreaterThan(0)
      expect(response.body.results[0].name).toContain('Maria')
      expect(response.body.results[0].relevanceScore).toBeGreaterThan(0)
      expect(response.body.results[0].matchedFields).toContain('name')
    })

    it('should search by CPF with exact matching', async () => {
      const searchRequest = {
        filters: {
          cpf: '123.456.789-01',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      expect(response.body.results).toHaveLength(1)
      expect(response.body.results[0].cpf).toBe('123.456.789-01')
      expect(response.body.results[0].name).toBe('Maria Silva Santos')
    })

    it('should search by partial CPF patterns', async () => {
      const searchRequest = {
        _query: '123.456',
        options: {
          fuzzyMatching: true,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      expect(response.body.results.length).toBeGreaterThan(0)
      expect(response.body.results[0].cpf).toContain('123.456')
    })

    it('should search by phone number patterns', async () => {
      const searchRequest = {
        filters: {
          phone: '(11) 99999-9999',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      expect(response.body.results.length).toBeGreaterThan(0)
      expect(response.body.results[0].phone).toBe('(11) 99999-9999')
    })
  })

  describe('Advanced Filtering', () => {
    it('should filter by gender', async () => {
      const searchRequest = {
        filters: {
          gender: 'female',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      response.body.results.forEach(patient => {
        expect(patient.gender).toBe('female')
      })
    })

    it('should filter by location (city/state)', async () => {
      const searchRequest = {
        filters: {
          city: 'São Paulo',
          state: 'SP',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      response.body.results.forEach(patient => {
        expect(patient.address.city).toBe('São Paulo')
        expect(patient.address.state).toBe('SP')
      })
    })

    it('should filter by age range', async () => {
      const searchRequest = {
        filters: {
          ageRange: {
            min: 30,
            max: 50,
          },
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      // Calculate ages and verify they're in range
      const currentYear = new Date().getFullYear()
      response.body.results.forEach(patient => {
        const birthYear = new Date(patient.dateOfBirth).getFullYear()
        const age = currentYear - birthYear
        expect(age).toBeGreaterThanOrEqual(30)
        expect(age).toBeLessThanOrEqual(50)
      })
    })

    it('should filter by date range', async () => {
      const searchRequest = {
        filters: {
          dateRange: {
            startDate: '1980-01-01T00:00:00.000Z',
            endDate: '1990-12-31T23:59:59.999Z',
          },
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      response.body.results.forEach(patient => {
        const birthDate = new Date(patient.dateOfBirth)
        expect(birthDate.getFullYear()).toBeGreaterThanOrEqual(1980)
        expect(birthDate.getFullYear()).toBeLessThanOrEqual(1990)
      })
    })
  })

  describe('Complex Search Scenarios', () => {
    it('should combine multiple filters', async () => {
      const searchRequest = {
        _query: 'Silva',
        filters: {
          gender: 'female',
          state: 'SP',
        },
        options: {
          fuzzyMatching: true,
          sortBy: 'relevance',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      response.body.results.forEach(patient => {
        expect(patient.name).toContain('Silva')
        expect(patient.gender).toBe('female')
        expect(patient.address.state).toBe('SP')
      })
    })

    it('should handle empty search results gracefully', async () => {
      const searchRequest = {
        _query: 'NonExistentPatientName',
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      expect(response.body.results).toHaveLength(0)
      expect(response.body.pagination.total).toBe(0)
      expect(response.body.searchMetadata.suggestions).toBeDefined()
    })

    it('should provide search suggestions for no results', async () => {
      const searchRequest = {
        _query: 'Mria', // Typo in Maria
        options: {
          fuzzyMatching: true,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      // Should either find fuzzy matches or provide suggestions
      if (response.body.results.length === 0) {
        expect(response.body.searchMetadata.suggestions).toBeDefined()
        expect(response.body.searchMetadata.suggestions.length).toBeGreaterThan(
          0,
        )
      }
    })
  })

  describe('Sorting and Pagination', () => {
    it('should sort by relevance score', async () => {
      const searchRequest = {
        _query: 'Silva',
        options: {
          sortBy: 'relevance',
          sortOrder: 'desc',
          maxResults: 10,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      // Check that results are sorted by relevance (descending)
      for (let i = 1; i < response.body.results.length; i++) {
        expect(
          response.body.results[i - 1].relevanceScore,
        ).toBeGreaterThanOrEqual(response.body.results[i].relevanceScore)
      }
    })

    it('should sort by name alphabetically', async () => {
      const searchRequest = {
        options: {
          sortBy: 'name',
          sortOrder: 'asc',
          maxResults: 10,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      const names = response.body.results.map(p => p.name)
      const sortedNames = [...names].sort()
      expect(names).toEqual(sortedNames)
    })

    it('should limit results correctly', async () => {
      const searchRequest = {
        options: {
          maxResults: 2,
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(searchRequest)
        .expect(200)

      expect(response.body.results.length).toBeLessThanOrEqual(2)
      expect(response.body.pagination.count).toBeLessThanOrEqual(2)
    })
  })

  describe('Performance Requirements', () => {
    it('should respond within 300ms for simple searches', async () => {
      const startTime = Date.now()

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send({ _query: 'Maria' })
        .expect(200)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(300)

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(300)
      expect(response.body.searchMetadata.searchTime).toBeLessThan(300)
    })

    it('should respond within 300ms for complex searches', async () => {
      const complexSearchRequest = {
        _query: 'Silva',
        filters: {
          gender: 'female',
          ageRange: { min: 25, max: 45 },
          state: 'SP',
        },
        options: {
          fuzzyMatching: true,
          sortBy: 'relevance',
          maxResults: 20,
        },
      }

      const startTime = Date.now()

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(complexSearchRequest)
        .expect(200)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(300)
      expect(response.body.performanceMetrics.duration).toBeLessThan(300)
    })

    it('should use search indexes for performance', async () => {
      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send({ _query: 'Maria' })
        .expect(200)

      expect(response.body.searchMetadata.indexUsed).toBe(true)
    })
  })

  describe('Brazilian Data Search Patterns', () => {
    it('should search CPF with different formatting', async () => {
      const searchVariations = [
        '12345678901', // No formatting
        '123.456.789-01', // Full formatting
        '123456789-01', // Partial formatting
        '123.456.789', // Without check digits
      ]

      for (const cpfVariation of searchVariations) {
        const response = await request(app)
          .post('/api/v2/patients/search')
          .set(testAuthHeaders)
          .send({ _query: cpfVariation })
          .expect(200)

        if (response.body.results.length > 0) {
          expect(response.body.results[0].cpf).toBe('123.456.789-01')
        }
      }
    })

    it('should search phone with different formatting', async () => {
      const phoneVariations = [
        '11999999999', // No formatting
        '(11) 99999-9999', // Full formatting
        '11 99999-9999', // Space instead of parentheses
        '11 9 9999-9999', // With 9th digit separated
      ]

      for (const phoneVariation of phoneVariations) {
        const response = await request(app)
          .post('/api/v2/patients/search')
          .set(testAuthHeaders)
          .send({ _query: phoneVariation })
          .expect(200)

        if (response.body.results.length > 0) {
          expect(response.body.results[0].phone).toBe('(11) 99999-9999')
        }
      }
    })
  })

  describe('Error Handling', () => {
    it('should return 401 for missing authentication', async () => {
      await request(app)
        .post('/api/v2/patients/search')
        .send({ _query: 'test' })
        .expect(401)
    })

    it('should return 400 for invalid search parameters', async () => {
      const invalidRequest = {
        filters: {
          ageRange: {
            min: -5, // Invalid negative age
            max: 200, // Invalid too high age
          },
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(invalidRequest)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should handle malformed search queries', async () => {
      const malformedRequest = {
        _query: '', // Empty query
        filters: null, // Null filters
      }

      await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(malformedRequest)
        .expect(400)
    })
  })

  describe('Search Analytics', () => {
    it('should include search metadata', async () => {
      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send({ _query: 'Maria' })
        .expect(200)

      expect(response.body.searchMetadata).toBeDefined()
      expect(response.body.searchMetadata._query).toBe('Maria')
      expect(response.body.searchMetadata.searchTime).toBeDefined()
      expect(response.body.searchMetadata.indexUsed).toBeDefined()
    })

    it('should track query complexity', async () => {
      const complexQuery = {
        _query: 'Silva Santos',
        filters: {
          gender: 'female',
          ageRange: { min: 30, max: 50 },
          city: 'São Paulo',
        },
        options: {
          fuzzyMatching: true,
          sortBy: 'relevance',
        },
      }

      const response = await request(app)
        .post('/api/v2/patients/search')
        .set(testAuthHeaders)
        .send(complexQuery)
        .expect(200)

      expect(response.body.performanceMetrics.queryComplexity).toBeGreaterThan(
        1,
      )
    })
  })
})
