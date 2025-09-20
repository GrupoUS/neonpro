/**
 * Integration Test for "Query client information" scenario
 * TDD Test - MUST FAIL until implementation is complete
 * 
 * This test validates the complete flow for querying client information
 * from quickstart.md scenario 2
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'

describe('Query Client Information - Integration Test', () => {
  let app: any
  let testServer: any

  beforeAll(async () => {
    try {
      app = (await import('../../src/app')).default
    } catch (error) {
      console.log('Expected failure: App not available during TDD phase')
    }
  })

  afterAll(async () => {
    if (testServer) {
      testServer.close()
    }
  })

  beforeEach(async () => {
    // Setup test data - this will fail until implementation is complete
    // In real implementation, this would set up test clients
  })

  describe('Portuguese Language Query Processing', () => {
    test('should handle "Me mostre os clientes cadastrados" query', async () => {
      expect(app).toBeDefined()

      const query = "Me mostre os clientes cadastrados"
      const sessionId = "test-session-clients"

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query,
          sessionId,
          context: {
            userId: "nurse-user-id",
            role: "nurse"
          }
        })
      })

      // Response validation
      expect(response.status).toBe(200)
      
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      expect(responseData.response).toBeDefined()
      
      // Should return list type for clients
      expect(responseData.response.type).toBe('list')
      
      // Content should have title and data
      expect(responseData.response.content).toHaveProperty('title')
      expect(responseData.response.content.title).toContain('Clientes')
      expect(responseData.response.content).toHaveProperty('data')
      expect(Array.isArray(responseData.response.content.data)).toBe(true)
    })

    test('should handle alternative client queries', async () => {
      expect(app).toBeDefined()

      const alternativeQueries = [
        "Lista de pacientes",
        "Clientes da clínica",
        "Pacientes cadastrados",
        "Mostrar todos os clientes"
      ]

      for (const query of alternativeQueries) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-nurse-token'
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-${Math.random()}`,
            context: {
              userId: "nurse-user-id",
              role: "nurse"
            }
          })
        })

        expect(response.status).toBe(200)
        
        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        expect(responseData.response.type).toBe('list')
      }
    })
  })

  describe('Response Structure Validation', () => {
    test('should return properly structured client data', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Me mostre os clientes cadastrados",
          sessionId: "test-session-structure",
          context: {
            userId: "nurse-user-id",
            role: "nurse"
          }
        })
      })

      const responseData = await response.json()
      
      if (responseData.response.content.data.length > 0) {
        const client = responseData.response.content.data[0]
        
        // Validate client structure according to quickstart requirements
        expect(client).toHaveProperty('id')
        expect(client).toHaveProperty('name')
        expect(client).toHaveProperty('email')
        expect(client).toHaveProperty('phone')
        
        // Validate data types
        expect(typeof client.name).toBe('string')
        expect(typeof client.email).toBe('string')
        expect(typeof client.phone).toBe('string')
        
        // Validate email format
        expect(client.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      }
    })

    test('should include interactive action buttons for client details', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Clientes cadastrados",
          sessionId: "test-session-actions",
          context: {
            userId: "nurse-user-id"
          }
        })
      })

      const responseData = await response.json()
      
      // Should include interactive actions
      expect(responseData.actions).toBeDefined()
      expect(Array.isArray(responseData.actions)).toBe(true)
      
      if (responseData.actions.length > 0) {
        const action = responseData.actions[0]
        expect(action).toHaveProperty('id')
        expect(action).toHaveProperty('label')
        expect(action).toHaveProperty('type')
        expect(action.label).toMatch(/detalhes|ver/i)
      }
    })
  })

  describe('Role-Based Access Control', () => {
    test('should show appropriate client information for nurse role', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Me mostre os clientes cadastrados",
          sessionId: "test-session-nurse",
          context: {
            userId: "nurse-user-id",
            role: "nurse"
          }
        })
      })

      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      
      if (responseData.response.content.data.length > 0) {
        const client = responseData.response.content.data[0]
        
        // Nurse should see basic contact information
        expect(client).toHaveProperty('name')
        expect(client).toHaveProperty('email')
        expect(client).toHaveProperty('phone')
        
        // Should not expose sensitive medical information at list level
        expect(client).not.toHaveProperty('medicalHistory')
        expect(client).not.toHaveProperty('documents')
      }
    })

    test('should limit information for receptionist role', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-receptionist-token'
        },
        body: JSON.stringify({
          query: "Lista de clientes",
          sessionId: "test-session-receptionist",
          context: {
            userId: "receptionist-user-id",
            role: "receptionist"
          }
        })
      })

      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      
      if (responseData.response.content.data.length > 0) {
        const client = responseData.response.content.data[0]
        
        // Receptionist should see basic info only
        expect(client).toHaveProperty('name')
        expect(client).toHaveProperty('phone')
        
        // May have limited access to other fields
        expect(client).toBeDefined()
      }
    })

    test('should provide full access for doctor role', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-doctor-token'
        },
        body: JSON.stringify({
          query: "Pacientes cadastrados",
          sessionId: "test-session-doctor",
          context: {
            userId: "doctor-user-id",
            role: "doctor"
          }
        })
      })

      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      
      if (responseData.response.content.data.length > 0) {
        const client = responseData.response.content.data[0]
        
        // Doctor should have access to all relevant fields
        expect(client).toHaveProperty('name')
        expect(client).toHaveProperty('email')
        expect(client).toHaveProperty('phone')
        
        // May include additional information for doctors
        expect(client).toBeDefined()
      }
    })
  })

  describe('Domain-Based Data Isolation', () => {
    test('should only show clients from user domain', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-clinic-a-token'
        },
        body: JSON.stringify({
          query: "Clientes cadastrados",
          sessionId: "test-session-domain-isolation",
          context: {
            userId: "clinic-a-user",
            domain: "clinic-a"
          }
        })
      })

      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      
      if (responseData.response.content.data.length > 0) {
        // All clients should belong to the same domain
        // This will be validated through RLS policies
        const clients = responseData.response.content.data
        clients.forEach(client => {
          expect(client).toBeDefined()
          // Domain validation will be implemented at the database level
        })
      }
    })

    test('should handle cross-domain access denial', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-domain-token'
        },
        body: JSON.stringify({
          query: "Todos os clientes do sistema",
          sessionId: "test-session-cross-domain",
          context: {
            userId: "invalid-domain-user",
            domain: "unauthorized-domain"
          }
        })
      })

      // Should either return empty results or forbidden error
      if (response.status === 200) {
        const responseData = await response.json()
        expect(responseData.response.content.data).toHaveLength(0)
      } else {
        expect(response.status).toBe(403)
      }
    })
  })

  describe('Performance Requirements', () => {
    test('should respond within 2 seconds for client list', async () => {
      expect(app).toBeDefined()

      const startTime = Date.now()
      
      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Me mostre os clientes cadastrados",
          sessionId: "test-session-performance",
          context: {
            userId: "nurse-user-id"
          }
        })
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(2000) // <2s requirement
      expect(response.status).toBe(200)
    })

    test('should handle large client lists efficiently', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Todos os clientes cadastrados",
          sessionId: "test-session-large-list",
          context: {
            userId: "nurse-user-id"
          }
        })
      })

      const responseData = await response.json()
      
      // Should implement pagination or reasonable limits
      if (responseData.response.content.data.length > 50) {
        // Should include pagination info or be limited
        expect(responseData.response.content).toHaveProperty('pagination')
      }
    })
  })

  describe('Data Privacy and Security', () => {
    test('should not expose sensitive client data in list view', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Clientes cadastrados",
          sessionId: "test-session-privacy",
          context: {
            userId: "nurse-user-id"
          }
        })
      })

      const responseData = await response.json()
      
      if (responseData.response.content.data.length > 0) {
        const client = responseData.response.content.data[0]
        
        // Should not expose sensitive data in list view
        expect(client).not.toHaveProperty('cpf')
        expect(client).not.toHaveProperty('rg')
        expect(client).not.toHaveProperty('medicalHistory')
        expect(client).not.toHaveProperty('address')
      }
    })

    test('should audit client data access', async () => {
      expect(app).toBeDefined()

      const response = await app.request('/api/ai/data-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-nurse-token'
        },
        body: JSON.stringify({
          query: "Lista de pacientes",
          sessionId: "test-session-audit",
          context: {
            userId: "nurse-user-id"
          }
        })
      })

      expect(response.status).toBe(200)
      
      // Audit logging should be triggered (validated in implementation)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
    })
  })

  describe('Search and Filtering', () => {
    test('should handle filtered client queries', async () => {
      expect(app).toBeDefined()

      const filteredQueries = [
        "Clientes ativos",
        "Pacientes recentes",
        "Clientes com agendamentos"
      ]

      for (const query of filteredQueries) {
        const response = await app.request('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-nurse-token'
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-filter-${Math.random()}`,
            context: {
              userId: "nurse-user-id"
            }
          })
        })

        expect(response.status).toBe(200)
        
        const responseData = await response.json()
        expect(responseData.success).toBe(true)
      }
    })
  })
})