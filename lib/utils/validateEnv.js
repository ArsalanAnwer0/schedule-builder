/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnv() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'RESEND_API_KEY',
    'EMAIL_FROM',
  ];

  const optionalEnvVars = [
    'NEXT_PUBLIC_APP_URL', // Optional, defaults to localhost in dev
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional variables (just warn)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join('\n')}\n\nPlease check your .env.local file.`
    );
  }

  // Log warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings
        .map((v) => `  - ${v}`)
        .join('\n')}\n`
    );
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error(
      'Invalid MONGODB_URI format. It should start with mongodb:// or mongodb+srv://'
    );
  }

  // Success
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ All required environment variables are set');
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvConfig() {
  return {
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    mongodbUri: process.env.MONGODB_URI,
    resendApiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
  };
}
