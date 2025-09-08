/**
 * Voice Navigation Hook - NeonPro
 * React hook for Portuguese clinical voice commands
 */

import { voiceNavigationService, } from '@/lib/services/voice-navigation-service'
import type { VoiceCommand, VoiceNavigationState, } from '@/lib/services/voice-navigation-service'
import { useCallback, useEffect, useState, } from 'react'

interface UseVoiceNavigationReturn {
  // State
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  lastCommand: string | null
  confidence: number
  error: string | null

  // Actions
  startListening: () => Promise<void>
  stopListening: () => void
  toggleListening: () => Promise<void>

  // Commands
  availableCommands: VoiceCommand[]
  getCommandsByCategory: (category: VoiceCommand['category'],) => VoiceCommand[]

  // Feedback
  speak: (text: string,) => void
}

export function useVoiceNavigation(): UseVoiceNavigationReturn {
  const [state, setState,] = useState<VoiceNavigationState>({
    isListening: false,
    isProcessing: false,
    lastCommand: undefined,
    confidence: 0,
    error: undefined,
  },)

  const [isSupported,] = useState(() => voiceNavigationService.isSupported())

  // Update state from service
  const updateState = useCallback(() => {
    setState(voiceNavigationService.getState(),)
  }, [],)

  // Poll state updates (since service doesn't have event emitters yet)
  useEffect(() => {
    const interval = setInterval(updateState, 100,)
    return () => clearInterval(interval,)
  }, [updateState,],)

  const startListening = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Reconhecimento de voz não é suportado neste navegador',)
    }

    try {
      await voiceNavigationService.startListening()
      updateState()
    } catch (error) {
      // console.error("Error starting voice navigation:", error);
      throw error
    }
  }, [isSupported, updateState,],)

  const stopListening = useCallback(() => {
    voiceNavigationService.stopListening()
    updateState()
  }, [updateState,],)

  const toggleListening = useCallback(async () => {
    if (state.isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }, [state.isListening, startListening, stopListening,],)

  const speak = useCallback((text: string,) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text,)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance,)
    }
  }, [],)

  const availableCommands = voiceNavigationService.getAvailableCommands()
  const getCommandsByCategory = useCallback(
    (category: VoiceCommand['category'],) => {
      return voiceNavigationService.getCommandsByCategory(category,)
    },
    [],
  )

  return {
    // State
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSupported,
    lastCommand: state.lastCommand,
    confidence: state.confidence,
    error: state.error,

    // Actions
    startListening,
    stopListening,
    toggleListening,

    // Commands
    availableCommands,
    getCommandsByCategory,

    // Feedback
    speak,
  }
}
