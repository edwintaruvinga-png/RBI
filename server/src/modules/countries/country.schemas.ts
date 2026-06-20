import { z } from 'zod';

const regulatorSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    website: z.string().trim().max(500).optional(),
    email: z.string().trim().toLowerCase().email().max(320).optional(),
    phone: z.string().trim().max(50).optional(),
    address: z.string().trim().max(1000).optional(),
  })
  .optional();

const idParams = z.object({ id: z.string().min(1) });

export const createCountrySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200),
    code: z.string().trim().min(2).max(10).toUpperCase(),
    regulatoryFramework: z.string().trim().max(20000).optional(),
    mandatoryCessions: z.unknown().optional(),
    regulator: regulatorSchema,
  }),
});

export const updateCountrySchema = z.object({
  params: idParams,
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    code: z.string().trim().min(2).max(10).toUpperCase().optional(),
    regulatoryFramework: z.string().trim().max(20000).nullable().optional(),
    mandatoryCessions: z.unknown().optional(),
    regulator: regulatorSchema,
  }),
});

export const countryIdParamSchema = z.object({ params: idParams });

export const listCountriesSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).optional(),
  }),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>['body'];
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>['body'];
export type ListCountriesQuery = z.infer<typeof listCountriesSchema>['query'];
