/**
 * Environment variable validation
 * Validates that all required environment variables are set and secure
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate required environment variables
 * Call this at application startup to fail fast if configuration is invalid
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'BETTER_AUTH_SECRET',
  ];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Security checks
  if (process.env.BETTER_AUTH_SECRET === 'your-secret-key-change-in-production') {
    errors.push('BETTER_AUTH_SECRET is using the default value. Change this in production!');
  }

  if (process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length < 32) {
    warnings.push('BETTER_AUTH_SECRET should be at least 32 characters long for security');
  }

  // Email configuration
  if (!process.env.ZEPTOMAIL_API_TOKEN) {
    warnings.push('ZEPTOMAIL_API_TOKEN is not configured. Email features will not work.');
  }

  if (!process.env.ZEPTOMAIL_FROM_EMAIL) {
    warnings.push('ZEPTOMAIL_FROM_EMAIL is not configured. Using default value.');
  }

  // App URL validation
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL);
    } catch {
      errors.push('NEXT_PUBLIC_APP_URL is not a valid URL');
    }
  }

  // Database URL validation
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('postgresql://') &&
        !process.env.DATABASE_URL.startsWith('postgres://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Check for common insecure database URLs
    if (process.env.DATABASE_URL.includes('localhost') ||
        process.env.DATABASE_URL.includes('127.0.0.1')) {
      warnings.push('DATABASE_URL points to localhost. This should be changed in production.');
    }
  }

  // Cron secret validation
  if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 16) {
    warnings.push('CRON_SECRET should be at least 16 characters long');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and throw if invalid
 * Use this in server startup code
 */
export function validateEnvOrThrow(): void {
  const result = validateEnvironment();

  if (result.errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`
    );
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.log('✅ Environment validation passed');
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
