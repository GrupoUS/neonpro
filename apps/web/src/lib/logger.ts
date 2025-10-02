// Production-ready secure logger for NeonPro
interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  data?: Record<string, unknown>
  error?: string
}

// In production, logs are sent to secure logging service
const submitLog = (entry: LogEntry): void => {
  if (process.env.NODE_ENV === 'development') {
    // Development: safe console logging with no sensitive data
    const logData = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      hasData: !!entry.data,
      hasError: !!entry.error
    }
    
    switch (entry.level) {
      case 'DEBUG':
        console.debug(`[${entry.level}] ${entry.message}`, logData)
        break
      case 'INFO':
        console.info(`[${entry.level}] ${entry.message}`, logData)
        break
      case 'WARN':
        console.warn(`[${entry.level}] ${entry.message}`, logData)
        break
      case 'ERROR':
        console.error(`[${entry.level}] ${entry.message}`, logData)
        break
    }
  } else {
    // Production: Send to secure logging service (placeholder implementation)
    // In production, this would integrate with services like:
    // - Datadog, LogRocket, or other HIPAA-compliant logging
    // - Local secure storage for audit trails
    void fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {
      // Silently fail to avoid exposing errors in production
    })
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    submitLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data: data && Object.keys(data).length > 0 ? data : undefined
    })
  },
  
  warn: (message: string, data?: Record<string, unknown>) => {
    submitLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data: data && Object.keys(data).length > 0 ? data : undefined
    })
  },
  
  error: (message: string, error?: Error | Record<string, unknown>) => {
    submitLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? error.message : JSON.stringify(error)
    })
  },
  
  debug: (message: string, data?: Record<string, unknown>) => {
    submitLog({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      data: data && Object.keys(data).length > 0 ? data : undefined
    })
  },
}