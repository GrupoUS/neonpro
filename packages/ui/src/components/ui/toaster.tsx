import * as React from "react"

import { useToast, ToasterToast } from "./use-toast"

interface ToasterProps {
  children?: React.ReactNode
}

export function Toaster({ children }: ToasterProps) {
  const { toasts } = useToast()

  return (
    <>
      {children}
      {toasts.map(function (toast: ToasterToast) {
        return (
          <div key={toast.id} className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="grid gap-1">
                {toast.title && <div className="font-medium">{toast.title}</div>}
                {toast.description && <div className="text-sm text-gray-600">{toast.description}</div>}
              </div>
              {toast.action}
              <button onClick={() => {}} className="ml-auto text-gray-500">Close</button>
            </div>
          </div>
        )
      })}
    </>
  )
}
