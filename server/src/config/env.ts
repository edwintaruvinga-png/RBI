import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const jwtSecret = process.env.JWT_SECRET ?? '';
if (!jwtSecret && nodeEnv === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: jwtSecret || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
} as const;
