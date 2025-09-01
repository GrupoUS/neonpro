// Temporary hook for deployment build
export const useEmergencyVoiceCommands = () => {
  return {
    isListening: false,
    startListening: () => {},
    stopListening: () => {},
    emergencyDetected: false,
  };
};