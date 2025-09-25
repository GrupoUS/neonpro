// Minimal AI Services Package
// Essential AI functionality for healthcare applications

// Core AI provider interface
export interface AIProvider {
  name: string
  generateResponse(prompt: string, options?: any): Promise<string>
  isAvailable(): boolean
}

// Basic AI service factory
export const createAIProvider = (type: 'openai' | 'anthropic' | 'google'): AIProvider => {
  // Minimal implementation - can be expanded later
  return {
    name: type,
    generateResponse: async (prompt: string) => `AI Response for: ${prompt}`,
    isAvailable: () => true
  }
}