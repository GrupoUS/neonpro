export class HealthcareLogger {
  log(level: string, message: string, metadata?: any) {
    console.log(`[HealthcareLogger ${level}] ${message}`, metadata);
  }

  error(message: string, error: Error, metadata?: any) {
    console.error(`[HealthcareLogger ERROR] ${message}`, error, metadata);
  }

  warn(message: string, metadata?: any) {
    console.warn(`[HealthcareLogger WARN] ${message}`, metadata);
  }

  info(message: string, metadata?: any) {
    console.info(`[HealthcareLogger INFO] ${message}`, metadata);
  }

  debug(message: string, metadata?: any) {
    console.debug(`[HealthcareLogger DEBUG] ${message}`, metadata);
  }
}
