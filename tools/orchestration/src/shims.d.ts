declare module 'shims' {
  export const createLogger: (...args: any[]) => any
  export const LogLevel: Record<string, any>
}
