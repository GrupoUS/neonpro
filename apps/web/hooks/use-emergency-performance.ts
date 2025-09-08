// Temporary hook for deployment build
export const useEmergencyPerformance = () => {
  return {
    isOptimized: true,
    emergencyMode: false,
    enableEmergencyMode: () => {},
    disableEmergencyMode: () => {},
  }
}
