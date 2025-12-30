import { validateEnv } from './utils/validateEnv.js';

/**
 * Run startup checks
 * Call this at the beginning of API routes to ensure environment is configured
 */
let hasValidated = false;

export function runStartupChecks() {
  if (hasValidated) return;

  try {
    validateEnv();
    hasValidated = true;
  } catch (error) {
    console.error('❌ Startup validation failed:', error.message);
    throw error;
  }
}
