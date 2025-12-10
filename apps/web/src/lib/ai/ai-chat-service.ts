/**
 * AI Chat Service
 * Handles AI chat interactions for aesthetic clinic management
 */

import { getApiUrl } from '../site-url';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

/**
 * Send a message to the AI chat service
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
): Promise<ChatResponse> {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Chat error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI Chat service error:', error);
    throw error;
  }
}

/**
 * Stream AI response for real-time chat
 */
export async function* streamAestheticResponse(
  message: string,
  history: ChatMessage[] = [],
): AsyncGenerator<string> {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/ai-chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Chat stream error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      yield chunk;
    }
  } catch (error) {
    console.error('AI Chat stream error:', error);
    throw error;
  }
}

/**
 * Generate AI suggestions based on context
 */
export async function generateSuggestions(
  context: string,
): Promise<string[]> {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/ai-chat/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error(`AI suggestions error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('AI suggestions error:', error);
    return [];
  }
}

/**
 * Generate search suggestions for patients/appointments
 */
export async function generateSearchSuggestions(
  query: string,
  type: 'patient' | 'appointment' | 'service' = 'patient',
): Promise<string[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/ai-chat/search-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, type }),
    });

    if (!response.ok) {
      throw new Error(`Search suggestions error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Search suggestions error:', error);
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Process voice input (placeholder for future implementation)
 */
export async function processVoiceInput(
  audioBlob: Blob,
): Promise<string> {
  try {
    const apiUrl = getApiUrl();
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${apiUrl}/ai-chat/voice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Voice processing error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transcription || '';
  } catch (error) {
    console.error('Voice processing error:', error);
    throw error;
  }
}

/**
 * Format chat message for display
 */
export function formatChatMessage(message: ChatMessage): string {
  const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `[${timestamp}] ${message.role}: ${message.content}`;
}

/**
 * Validate chat message
 */
export function validateChatMessage(message: string): boolean {
  return message.trim().length > 0 && message.length <= 2000;
}

/**
 * Sanitize user input
 */
export function sanitizeChatInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .substring(0, 2000);
}
