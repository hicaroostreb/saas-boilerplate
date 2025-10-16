// packages/database/src/utils/logger.ts
// ============================================
// STRUCTURED LOGGER - ENTERPRISE LOGGING
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  tenantId?: string;
  userId?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  child(defaultMeta: LogMeta): ILogger;
}

class Logger implements ILogger {
  private level: LogLevel;
  private defaultMeta: LogMeta;

  constructor(defaultMeta: LogMeta = {}) {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.defaultMeta = defaultMeta;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private log(level: LogLevel, message: string, meta?: LogMeta): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const log = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.defaultMeta,
      ...meta,
    };

    const output = JSON.stringify(log);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, meta?: LogMeta): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.log('error', message, meta);
  }

  child(defaultMeta: LogMeta): ILogger {
    return new Logger({ ...this.defaultMeta, ...defaultMeta });
  }
}

export const logger = new Logger();

// Helper para criar logger com contexto tenant
export function createTenantLogger(tenantId: string, userId?: string): ILogger {
  return logger.child({ tenantId, userId });
}
