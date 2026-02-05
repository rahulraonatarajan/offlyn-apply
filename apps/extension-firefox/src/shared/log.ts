/**
 * Logging utilities with rate limiting for error messages
 */

const DEBUG = false; // Set to true for verbose logging
const ERROR_RATE_LIMIT_MS = 5000; // Max one error per 5 seconds

let lastErrorTime = 0;
let errorCount = 0;

function shouldLogError(): boolean {
  const now = Date.now();
  if (now - lastErrorTime > ERROR_RATE_LIMIT_MS) {
    lastErrorTime = now;
    errorCount = 0;
    return true;
  }
  errorCount++;
  return errorCount <= 1; // Allow first error in window
}

export function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log('[Offlyn]', ...args);
  }
}

export function info(...args: unknown[]): void {
  console.info('[Offlyn]', ...args);
}

export function warn(...args: unknown[]): void {
  console.warn('[Offlyn]', ...args);
}

export function error(...args: unknown[]): void {
  if (shouldLogError()) {
    console.error('[Offlyn]', ...args);
  }
}
