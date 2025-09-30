import React from 'react'

export const Placeholder: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  return (
    <div className="neonpro-placeholder p-2 border rounded text-sm text-muted-foreground">
      {children ?? 'Placeholder component from @neonpro/ui'}
    </div>
  )
}

export default Placeholder
