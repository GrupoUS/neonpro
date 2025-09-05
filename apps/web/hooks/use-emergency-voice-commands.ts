// Temporary hook for deployment build
export const useEmergencyVoiceCommands = (options?: {
  onEmergencyDetected?: (intent: string, transcript: string) => void;
  onCommandExecuted?: (command: string, intent: string) => void;
}) => {
  return {
    recognition: null,
    synthesis: null,
    isListening: false,
    startListening: () => {},
    stopListening: () => {},
    toggleListening: () => {},
    speakText: (text: string) => {},
    stopSpeaking: () => {},
    announceEmergency: (message: string) => {},
    isVoiceSupported: false,
    isActive: false,
    emergencyDetected: false,
  };
};
