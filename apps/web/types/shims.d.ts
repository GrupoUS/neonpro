declare module '@radix-ui/react-progress'
declare module '@radix-ui/react-select'
declare module '@radix-ui/react-tabs'

// Web Speech API shims for type-check only
interface Window {
  webkitSpeechRecognition?: any
  SpeechRecognition?: any
}

declare const SpeechRecognition: any

declare module '@/components/ui/toast' {
  import * as React from 'react'
  export const ToastProvider: React.FC<any>
  export const ToastViewport: React.ForwardRefExoticComponent<any>
  export const Toast: React.ForwardRefExoticComponent<any>
  export const ToastTitle: React.ForwardRefExoticComponent<any>
  export const ToastDescription: React.ForwardRefExoticComponent<any>
  export const ToastClose: React.ForwardRefExoticComponent<any>
}
