import * as React from "react"

interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  toggleScreenReader: () => void
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [screenReader, setScreenReader] = React.useState(false)

  const toggleHighContrast = () => setHighContrast(!highContrast)
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion)
  const toggleScreenReader = () => setScreenReader(!screenReader)

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        reducedMotion,
        screenReader,
        toggleHighContrast,
        toggleReducedMotion,
        toggleScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}