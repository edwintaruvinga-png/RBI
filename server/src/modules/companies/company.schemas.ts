import { z } from 'zod';
import { CompanyType } from '@prisma/client';

const idParams = z.object({ id: z.string().min(1) });

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200),
    countryId: z.string().min(1),
    type: z.nativeEnum(CompanyType),
    amBestRating: z.string().trim().max(20).optional(),
    website: z.string().trim().max(500).optional(),
    headquarters: z.string().trim().max(300).optional(),
    notes: z.string().trim().max(20000).optional(),
  }),
});

export const updateCompanySchema = z.object({
  params: idParams,
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    countryId: z.string().min(1).optional(),
    type: z.nativeEnum(CompanyType).optional(),
    amBestRating: z.string().trim().max(20).nullable().optional(),
    website: z.string().trim().max(500).nullable().optional(),
    headquarters: z.string().trim().max(300).nullable().optional(),
    notes: z.string().trim().max(20000).nullable().optional(),
  }),
});

export const companyIdParamSchema = z.object({ params: idParams });

export const listCompaniesSchema = z.object({
  query: z.object({
    countryId: z.string().min(1).optional(),
    type: z.nativeEnum(CompanyType).optional(),
    q: z.string().trim().min(1).optional(),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>['body'];
export type ListCompaniesQuery = z.infer<typeof listCompaniesSchema>['query'];
