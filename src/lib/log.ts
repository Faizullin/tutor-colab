export class Log {
  static info(...args: unknown[]) {
    console.log(`[INFO]`, ...args);
  }

  static error(...args: unknown[]) {
    console.error(`[ERROR]`, ...args);
  }
}
