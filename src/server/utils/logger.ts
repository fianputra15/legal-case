/**
 * Simple logging utility
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

// Set log level from environment
const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
switch (envLogLevel) {
  case 'error':
    Logger.setLevel(LogLevel.ERROR);
    break;
  case 'warn':
    Logger.setLevel(LogLevel.WARN);
    break;
  case 'info':
    Logger.setLevel(LogLevel.INFO);
    break;
  case 'debug':
    Logger.setLevel(LogLevel.DEBUG);
    break;
  default:
    Logger.setLevel(LogLevel.INFO);
}