// ─── Logger Utility ────────────────────────────────────────
// Console logger with timestamps. Never logs passwords or tokens.

type LogLevel = "info" | "warn" | "error" | "debug";

function formatMessage(level: LogLevel, message: string, meta?: object): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: object): void {
    console.log(formatMessage("info", message, meta));
  },

  warn(message: string, meta?: object): void {
    console.warn(formatMessage("warn", message, meta));
  },

  error(message: string, meta?: object): void {
    console.error(formatMessage("error", message, meta));
  },

  debug(message: string, meta?: object): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, meta));
    }
  },
};

export default logger;
