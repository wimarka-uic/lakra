const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogContext {
  component?: string;
  action?: string;
  userId?: number;
  metadata?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    
    // In production, only show WARN and ERROR
    // In development, show DEBUG and above
    this.level = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context.component}${context.action ? `::${context.action}` : ''}]` : '';
    return `[${timestamp}] ${level}${contextStr}: ${message}`;
  }

  private logWithContext(level: LogLevel, levelName: string, message: string, context?: LogContext, ...args: unknown[]) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelName, message, context);
    
    switch (level) {
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          console.debug(formattedMessage, ...args);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
    }

    // In production, you might want to send errors to a logging service
    if (this.isProduction && level >= LogLevel.ERROR) {
      // Implementation omitted for placeholder
      // Could integrate with services like Sentry, LogRocket, etc.
    }
  }

  debug(message: string, context?: LogContext, ...args: unknown[]) {
    this.logWithContext(LogLevel.DEBUG, 'DEBUG', message, context, ...args);
  }

  info(message: string, context?: LogContext, ...args: unknown[]) {
    this.logWithContext(LogLevel.INFO, 'INFO', message, context, ...args);
  }

  warn(message: string, context?: LogContext, ...args: unknown[]) {
    this.logWithContext(LogLevel.WARN, 'WARN', message, context, ...args);
  }

  error(message: string, context?: LogContext, error?: Error, ...args: unknown[]) {
    const errorArgs = error ? [error, ...args] : args;
    this.logWithContext(LogLevel.ERROR, 'ERROR', message, context, ...errorArgs);
  }

  // Convenience methods for common scenarios
  apiError(operation: string, error: Error, context?: Omit<LogContext, 'action'>) {
    this.error(`API ${operation} failed: ${error.message}`, { 
      ...context, 
      action: operation,
      metadata: { 
        ...context?.metadata,
        errorName: error.name,
        stack: error.stack
      }
    }, error);
  }

  userAction(action: string, userId?: number, metadata?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      component: 'UserAction',
      action,
      userId,
      metadata
    });
  }

  authEvent(event: string, userId?: number, metadata?: Record<string, unknown>) {
    this.info(`Auth event: ${event}`, {
      component: 'Auth',
      action: event,
      userId,
      metadata
    });
  }

  // Method to check if debug logging is enabled
  isDebugEnabled(): boolean {
    return this.level <= LogLevel.DEBUG;
  }

  // Method to check if we're in production
  isProd(): boolean {
    return this.isProduction;
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export types for use in components
export type { LogContext }; 