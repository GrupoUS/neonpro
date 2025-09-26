// Minimal AI Services Package
// Essential AI functionality for healthcare applications

// Core AI provider interface
export interface AIProvider {
  name: string
  generateResponse(prompt: string, options?: any): Promise<string>
  isAvailable(): boolean
}

// AI provider factory class for healthcare applications
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  static registerProvider(type: string, provider: AIProvider): void {
    this.providers.set(type, provider)
  }

  static getProvider(type: string): AIProvider | null {
    return this.providers.get(type) || null
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  static async generateWithFailover(
    messages: any[],
    _retryCount: number = 1
  ): Promise<{ content: string; provider: string }> {
    // Simple mock implementation for development
    const mockProviders = ['openai', 'anthropic', 'google']
    const selectedProvider = mockProviders[Math.floor(Math.random() * mockProviders.length)]
    const lastMessage = messages[messages.length - 1]?.content || 'unknown'
    
    return {
      content: `Mock AI response from ${selectedProvider} for: ${lastMessage}`,
      provider: selectedProvider || 'openai' // Ensure provider is always a string
    }
  }
}

// Basic AI service factory
export const createAIProvider = (type: 'openai' | 'anthropic' | 'google'): AIProvider => {
  // Minimal implementation - can be expanded later
  const provider = {
    name: type,
    generateResponse: async (prompt: string) => `AI Response for: ${prompt}`,
    isAvailable: () => true
  }

  // Register with factory
  AIProviderFactory.registerProvider(type, provider)
  
  return provider
}

// Initialize default providers
createAIProvider('openai')
createAIProvider('anthropic')
createAIProvider('google')