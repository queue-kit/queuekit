import fs from "fs";
import path from "path";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LoggerOptions {
  level?: LogLevel;
  logFilePath?: string;
  console?: boolean;
}

export class Logger {
  private level: LogLevel;
  private logFilePath: string;
  private toConsole: boolean;
  private stream: fs.WriteStream | null = null;

  constructor(options: LoggerOptions = {}) {
    this.level =
      options.level ?? (process.env.QUEUEWAY_LOG_LEVEL as LogLevel) ?? "info";
    this.toConsole = options.console ?? true;
    this.logFilePath =
      options.logFilePath ??
      process.env.QUEUEWAY_LOG_PATH ??
      path.resolve(process.cwd(), ".queueway", "queueway.log");

    // Skip file logging under Jest — parallel test-worker processes writing
    // to the same file can cause platform-specific file-locking issues.
    // Console output (used by test assertions/snapshots) still works fine.
    if (process.env.JEST_WORKER_ID === undefined) {
      this.openStream();
    }
  }

  private openStream(): void {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      this.stream = fs.createWriteStream(this.logFilePath, { flags: "a" });
      // A stream's 'error' event MUST have a listener, or Node treats it as
      // an uncaught exception. Logging must never be able to crash the app.
      this.stream.on("error", () => {
        this.stream = null;
      });
    } catch {
      this.stream = null;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.level];
  }

  private write(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    try {
      if (this.stream && typeof this.stream.write === "function") {
        const entry = {
          timestamp: new Date().toISOString(),
          level,
          message,
          ...(meta ? { meta } : {}),
        };
        this.stream.write(JSON.stringify(entry) + "\n");
      }
    } catch {
      // Never let a logging failure crash the calling code.
    }

    if (this.toConsole) {
      try {
        const fn =
          level === "error"
            ? console.error
            : level === "warn"
              ? console.warn
              : console.log;
        if (meta) fn(message, meta);
        else fn(message);
      } catch {
        // ignore console failures too
      }
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>): void {
    this.write("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    this.write("warn", message, meta);
  }
  error(message: string, meta?: Record<string, unknown>): void {
    this.write("error", message, meta);
  }
}

export const logger = new Logger();
