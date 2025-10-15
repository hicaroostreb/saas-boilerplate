import type { ILogger, LogContext } from '../../domain/ports/logger.port.js';

export class ConsoleLoggerAdapter implements ILogger {
  constructor(private readonly enableDebug = false) {}

  error(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    console.error(`[ERROR] ${timestamp} - ${message}${contextStr}`);
  }

  warn(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    console.warn(`[WARN] ${timestamp} - ${message}${contextStr}`);
  }

  info(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    process.stdout.write(`[INFO] ${timestamp} - ${message}${contextStr}\n`);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.enableDebug) {
      return;
    }

    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    process.stdout.write(`[DEBUG] ${timestamp} - ${message}${contextStr}\n`);
  }
}
