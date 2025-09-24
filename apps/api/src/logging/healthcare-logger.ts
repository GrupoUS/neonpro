export class HealthcareLogger {
  log(level: string, message: string, metadata?: any) {
    console.warn(`[HealthcareLogger ${level}] ${message}`, metadata)
  }

  error(message: string, error: Error, metadata?: any) {
    console.error(`[HealthcareLogger ERROR] ${message}`, error, metadata)
  }

  warn(message: string, metadata?: any) {
    console.warn(`[HealthcareLogger WARN] ${message}`, metadata)
  }

  info(message: string, metadata?: any) {
    console.warn(`[HealthcareLogger INFO] ${message}`, metadata)
  }

  debug(message: string, metadata?: any) {
    console.warn(`[HealthcareLogger DEBUG] ${message}`, metadata)
  }
}
