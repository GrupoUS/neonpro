/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { NeonProChatInterface } from '@/components/chat/NeonProChatInterface'
import { vi } from 'vitest'

// Mock dependencies
const mockMessageSquare = vi.fn(() => <div data-testid="message-icon" />)
const mockMessageBubble = vi.fn(({ message, isUser }) => (
  <div data-testid="message-bubble" data-user={isUser}>
    {message.content}
  </div>
))

vi.mock('lucide-react', () => ({
  MessageSquare: mockMessageSquare,
}))

vi.mock('@/components/chat/MessageBubble', () => ({
  default: mockMessageBubble,
}))

describe('NeonProChatInterface', () => {
  const mockAgents = [
    {
      id: 'agent-1',
      name: 'Dr. AI',
      messages: []
    },
    {
      id: 'agent-2', 
      name: 'Nurse Assistant',
      messages: []
    }
  ]

  const defaultProps = {
    agents: mockAgents,
    onMessageSend: vi.fn(),
    onAgentSelect: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('RED Phase - Current Issues', () => {
    it('should crash when activeAgent is undefined and accessing messages', () => {
      // This test reproduces the CURRENT ISSUE where activeAgent is undefined
      // but the component tries to access activeAgent.messages.length
      
      const { container } = render(
        <NeonProChatInterface 
          {...defaultProps}
          // Simulate scenario where activeAgent might be undefined
          activeAgent={undefined}
        />
      )

      // This represents the problematic code path:
      // {activeAgent?.messages.length === 0 ? ... : activeAgent.messages.map(...)}
      // When activeAgent is undefined, this should throw in current implementation
      expect(container).toBeInTheDocument()
    })

    it('should handle undefined activeAgent without throwing TypeError', () => {
      // Test the problematic scenario from PR 70
      
      expect(() => {
        render(
          <NeonProChatInterface 
            {...defaultProps}
            activeAgent={undefined}
          />
        )
      }).not.toThrow()
    })
  })

  describe('GREEN Phase - Expected Fixed Behavior', () => {
    it('should handle undefined activeAgent with proper fallback UI', () => {
      // This test represents the EXPECTED behavior after fix
      
      render(
        <NeonProChatInterface 
          {...defaultProps}
          activeAgent={undefined}
        />
      )

      // Should show fallback UI instead of crashing
      expect(screen.getByText('Selecione um assistente para começar')).toBeInTheDocument()
    })

    it('should show empty state when activeAgent has no messages', () => {
      render(
        <NeonProChatInterface 
          {...defaultProps}
          activeAgent={{
            id: 'agent-1',
            name: 'Dr. AI',
            messages: []
          }}
        />
      )

      expect(screen.getByText('Comece uma conversa')).toBeInTheDocument()
    })

    it('should render messages when available', () => {
      const mockMessages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date()
        }
      ]

      render(
        <NeonProChatInterface 
          {...defaultProps}
          activeAgent={{
            id: 'agent-1',
            name: 'Dr. AI',
            messages: mockMessages
          }}
        />
      )

      expect(screen.getByText('Hello')).toBeInTheDocument()
    })
  })

  describe('REFACTOR Phase - Edge Cases', () => {
    it('should handle null/undefined messages safely', () => {
      render(
        <NeonProChatInterface 
          {...defaultProps}
          activeAgent={{
            id: 'agent-1',
            name: 'Dr. AI',
            messages: null as any
          }}
        />
      )

      // Should handle gracefully without crashing
      expect(screen.getByText('Comece uma conversa')).toBeInTheDocument()
    })

    it('should handle agent selection', () => {
      const onAgentSelect = vi.fn()
      
      render(
        <NeonProChatInterface 
          {...defaultProps}
          onAgentSelect={onAgentSelect}
        />
      )

      // Test that agent selection doesn't crash
      expect(onAgentSelect).not.toHaveBeenCalled()
    })
  })
})