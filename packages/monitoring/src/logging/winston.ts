import winston from 'winston';
import type { LogLevel } from '../types';

interface LoggingConfig {
  level: LogLevel;
  format: 'json' | 'pretty';
  transports: ('console' | 'file')[];
}

export function createLogger(config: LoggingConfig): winston.Logger {
  const transports: winston.transport[] = [];

  // Console transport
  if (config.transports.includes('console')) {
    transports.push(
      new winston.transports.Console({
        format: config.format === 'pretty' 
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
              })
            )
          : winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            )
      })
    );
  }

  // File transport
  if (config.transports.includes('file')) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/application.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  }

  return winston.createLogger({
    level: config.level,
    transports,
    defaultMeta: {
      service: 'neonpro-monitoring'
    }
  });
}