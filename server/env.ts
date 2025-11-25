/**
 * Environment variable validation and configuration
 */

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  NOCODB_BASE_URL: string;
  NOCODB_TOKEN?: string;
  ALLOWED_ORIGINS: string[];
  DATABASE_URL?: string;
}

/**
 * Validates and returns the environment configuration
 * Throws an error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // PORT - optional, defaults to 5000
  const PORT = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(PORT)) {
    errors.push('PORT must be a valid number');
  }

  // NODE_ENV - optional, defaults to development
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // NOCODB_BASE_URL - optional but recommended
  const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
  if (!NOCODB_BASE_URL && NODE_ENV === 'production') {
    console.warn('⚠️  Warning: NOCODB_BASE_URL is not set. Using default URL.');
  }

  // NOCODB_TOKEN - optional but highly recommended for security
  const NOCODB_TOKEN = process.env.NOCODB_TOKEN;
  if (!NOCODB_TOKEN) {
    console.warn('⚠️  Warning: NOCODB_TOKEN is not set. Database requests may fail if authentication is required.');
  }

  // ALLOWED_ORIGINS - optional, defaults to localhost
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5000', 'http://localhost:5173'];

  // DATABASE_URL - optional (only needed if using Drizzle ORM)
  const DATABASE_URL = process.env.DATABASE_URL;

  // If there are any errors, throw
  if (errors.length > 0) {
    throw new Error(`Environment variable validation failed:\n${errors.join('\n')}`);
  }

  return {
    PORT,
    NODE_ENV,
    NOCODB_BASE_URL: NOCODB_BASE_URL || 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records',
    NOCODB_TOKEN,
    ALLOWED_ORIGINS,
    DATABASE_URL,
  };
}

/**
 * Log the current environment configuration (without sensitive data)
 */
export function logEnvConfig(config: EnvConfig): void {
  console.log('🔧 Environment Configuration:');
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   NOCODB_BASE_URL: ${config.NOCODB_BASE_URL}`);
  console.log(`   NOCODB_TOKEN: ${config.NOCODB_TOKEN ? '***SET***' : 'NOT SET'}`);
  console.log(`   ALLOWED_ORIGINS: ${config.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '***SET***' : 'NOT SET'}`);
}
