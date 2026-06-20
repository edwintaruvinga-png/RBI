import { Prisma, type CompanyType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import type {
  CreateCompanyInput,
  ListCompaniesQuery,
  UpdateCompanyInput,
} from './company.schemas.js';

const companySelect = {
  id: true,
  name: true,
  countryId: true,
  type: true,
  amBestRating: true,
  website: true,
  headquarters: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  country: { select: { id: true, name: true, code: true } },
} satisfies Prisma.CompanySelect;

type CompanyRow = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;

export interface CompanyDTO {
  id: string;
  name: string;
  countryId: string;
  type: CompanyType;
  amBestRating: string | null;
  website: string | null;
  headquarters: string | null;
  notes: string | null;
  country: { id: string; name: string; code: string };
  createdAt: Date;
  updatedAt: Date;
}

function toCompanyDTO(row: CompanyRow): CompanyDTO {
  return {
    id: row.id,
    name: row.name,
    countryId: row.countryId,
    type: row.type,
    amBestRating: row.amBestRating,
    website: row.website,
    headquarters: row.headquarters,
    notes: row.notes,
    country: row.country,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Validates an FK up front so we can return a clean 400 instead of a raw DB error. */
async function assertCountryExists(countryId: string): Promise<void> {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { id: true },
  });
  if (!country) {
    throw new AppError(400, `Country '${countryId}' does not exist`);
  }
}

export async function listCompanies(query: ListCompaniesQuery): Promise<CompanyDTO[]> {
  const where: Prisma.CompanyWhereInput = {};
  if (query.countryId) where.countryId = query.countryId;
  if (query.type) where.type = query.type;
  if (query.q) where.name = { contains: query.q, mode: 'insensitive' };

  const rows = await prisma.company.findMany({
    where,
    select: companySelect,
    orderBy: { name: 'asc' },
  });
  return rows.map(toCompanyDTO);
}

export async function getCompany(id: string): Promise<CompanyDTO> {
  const row = await prisma.company.findUniqueOrThrow({ where: { id }, select: companySelect });
  return toCompanyDTO(row);
}

export async function createCompany(input: CreateCompanyInput): Promise<CompanyDTO> {
  await assertCountryExists(input.countryId);

  const row = await prisma.company.create({
    data: {
      name: input.name,
      countryId: input.countryId,
      type: input.type,
      amBestRating: input.amBestRating,
      website: input.website,
      headquarters: input.headquarters,
      notes: input.notes,
    },
    select: companySelect,
  });
  return toCompanyDTO(row);
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyDTO> {
  if (input.countryId) {
    await assertCountryExists(input.countryId);
  }

  const row = await prisma.company.update({
    where: { id },
    data: {
      name: input.name,
      countryId: input.countryId,
      type: input.type,
      amBestRating: input.amBestRating,
      website: input.website,
      headquarters: input.headquarters,
      notes: input.notes,
    },
    select: companySelect,
  });
  return toCompanyDTO(row);
}

export async function deleteCompany(id: string): Promise<void> {
  await prisma.company.delete({ where: { id } });
}
