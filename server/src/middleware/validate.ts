import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Validates `body`, `query`, and `params` against a Zod schema shaped like
 * `z.object({ body, query, params })`. Parsed (and coerced) values replace the
 * originals so downstream handlers receive typed, sanitised input. Validation
 * failures are forwarded to the global error handler as ZodErrors.
 */
export const validate =
  (schema: ZodTypeAny): RequestHandler =>
  async (req, _res, next) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: unknown };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;

      next();
    } catch (err) {
      next(err);
    }
  };
