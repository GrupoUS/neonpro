import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createServer } from 'http'
import { fetch } from 'undici'

// Import the agent endpoint with mock data service
import { agentRouter } from '../../src/routes/ai/data-agent'

// Mock the AIDataService to avoid actual database calls during tests
vi.mock('../../src/services/ai-data-service', () => ({
  AIDataService: {
    getInstance: () => ({
      getClientsByName: async (name: string) => ({
        type: 'list',
        title: 'Clientes Encontrados',
        data: [
          {
            id: 'client-1',
            name: name || 'Maria Silva',
            email: 'maria.silva@email.com',
            phone: '(11) 99999-8888',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          },
          {
            id: 'client-2',
            name: 'João Santos',
            email: 'joao.santos@email.com',
            phone: '(11) 98888-7777',
            createdAt: '2024-01-10T09:15:00Z',
            updatedAt: '2024-01-18T16:20:00Z'
          }
        ],
        columns: [
          { key: 'name', label: 'Nome', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Telefone', type: 'phone' }
        ]
      }),
      getAppointmentsByDate: async (date: string) => ({
        type: 'list',
        title: 'Agendamentos',
        data: [],
        columns: []
      }),
      getFinancialSummary: async (period: string) => ({
        type: 'summary',
        title: 'Resumo Financeiro',
        data: [],
        summary: {},
        columns: []
      })
    })
  }
}))

describe('Integration Tests: Client Data Query', () => {
  let server: any
  let baseUrl: string
  let app: Hono

  beforeAll(async () => {
    // Create Hono app with agent route
    app = new Hono()
    app.route('/api/ai/data-agent', agentRouter)

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
    })
    
    await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address()
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`
        }
        resolve(true)
      })
    })
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('Client Query Integration', () => {
    it('should successfully query for all clients', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Me mostre os clientes cadastrados',
          sessionId: 'test-session-client-1',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.success).toBe(true)
      expect(data.response.type).toBe('list')
      expect(data.response.title).toBe('Clientes Encontrados')
      expect(Array.isArray(data.response.data)).toBe(true)
      expect(data.response.data.length).toBeGreaterThan(0)
      
      // Verify client data structure
      const client = data.response.data[0]
      expect(client).toHaveProperty('id')
      expect(client).toHaveProperty('name')
      expect(client).toHaveProperty('email')
      expect(client).toHaveProperty('phone')
      expect(client).toHaveProperty('createdAt')
      expect(client).toHaveProperty('updatedAt')
    })

    it('should successfully query for specific client by name', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Me mostre os dados da Maria Silva',
          sessionId: 'test-session-client-2',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.success).toBe(true)
      expect(data.response.type).toBe('list')
      expect(data.response.title).toBe('Clientes Encontrados')
      
      // Verify the specific client is returned
      const clients = data.response.data
      expect(clients.length).toBeGreaterThan(0)
      expect(clients[0].name).toContain('Maria Silva')
    })

    it('should handle empty results gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Busque por cliente inexistente',
          sessionId: 'test-session-client-3',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.success).toBe(true)
      expect(data.response.type).toBe('list')
      expect(Array.isArray(data.response.data)).toBe(true)
      
      // Should return empty array, not error
      expect(data.response.data.length).toBe(0)
    })

    it('should handle variations in query phrasing', async () => {
      const variations = [
        'Liste todos os clientes',
        'Mostrar pacientes cadastrados',
        'Quem são os clientes?',
        'Pacientes',
        'clientes'
      ]

      for (const query of variations) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-variation-${query}`,
          }),
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.response.type).toBe('list')
      }
    })

    it('should include proper column definitions', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Clientes',
          sessionId: 'test-session-client-4',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.response.columns).toBeDefined()
      expect(Array.isArray(data.response.columns)).toBe(true)
      
      // Verify column structure
      const columns = data.response.columns
      expect(columns.length).toBeGreaterThan(0)
      
      const column = columns[0]
      expect(column).toHaveProperty('key')
      expect(column).toHaveProperty('label')
      expect(column).toHaveProperty('type')
    })

    it('should handle special characters in client names', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Buscar por José da Silva',
          sessionId: 'test-session-client-5',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should handle case insensitive queries', async () => {
      const queries = [
        'CLIENTES',
        'clientes',
        'Clientes',
        'cLiEnTeS'
      ]

      for (const query of queries) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-case-${query}`,
          }),
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
      }
    })

    it('should maintain session context', async () => {
      const sessionId = 'test-session-context-123'
      
      // First query
      const response1 = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Clientes',
          sessionId,
          context: {
            userId: 'user-123',
            previousMessages: []
          }
        }),
      })

      expect(response1.status).toBe(200)
      const data1 = await response1.json()
      expect(data1.success).toBe(true)

      // Follow-up query
      const response2 = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'E os agendamentos?',
          sessionId,
          context: {
            userId: 'user-123',
            previousMessages: [
              { role: 'user', content: 'Clientes' },
              { role: 'assistant', content: 'Aqui estão os clientes' }
            ]
          }
        }),
      })

      expect(response2.status).toBe(200)
      const data2 = await response2.json()
      expect(data2.success).toBe(true)
    })

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          // Missing required fields
          extra: 'data'
        }),
      })

      expect(response.status).toBe(400)
    })
  })
})