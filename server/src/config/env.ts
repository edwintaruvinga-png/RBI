import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const jwtSecret = process.env.JWT_SECRET ?? '';
if (!jwtSecret && nodeEnv === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

const enrichmentTtlHours = Number(process.env.ENRICHMENT_TTL_HOURS) || 24;

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

  // AI provider (server-side only — never expose to the client)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',

  // News provider (server-side only)
  newsApiKey: process.env.NEWS_API_KEY ?? '',
  newsApiUrl: process.env.NEWS_API_URL ?? 'https://newsapi.org/v2/everything',

  // Enrichment cache time-to-live
  enrichmentTtlHours,
  enrichmentTtlMs: enrichmentTtlHours * 60 * 60 * 1000,
} as const;
