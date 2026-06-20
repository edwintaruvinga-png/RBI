import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateCountryInput,
  ListCountriesQuery,
  UpdateCountryInput,
} from './country.schemas.js';

const countrySelect = {
  id: true,
  name: true,
  code: true,
  regulatoryFramework: true,
  regulatorName: true,
  regulatorWebsite: true,
  regulatorEmail: true,
  regulatorPhone: true,
  regulatorAddress: true,
  mandatoryCessions: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CountrySelect;

type CountryRow = Prisma.CountryGetPayload<{ select: typeof countrySelect }>;

export interface CountryDTO {
  id: string;
  name: string;
  code: string;
  regulatoryFramework: string | null;
  mandatoryCessions: Prisma.JsonValue | null;
  regulator: {
    name: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

function toCountryDTO(row: CountryRow): CountryDTO {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    regulatoryFramework: row.regulatoryFramework,
    mandatoryCessions: row.mandatoryCessions ?? null,
    regulator: {
      name: row.regulatorName,
      website: row.regulatorWebsite,
      email: row.regulatorEmail,
      phone: row.regulatorPhone,
      address: row.regulatorAddress,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCountries(query: ListCountriesQuery): Promise<CountryDTO[]> {
  const where: Prisma.CountryWhereInput = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { code: { contains: query.q, mode: 'insensitive' } },
        ],
      }
    : {};

  const rows = await prisma.country.findMany({
    where,
    select: countrySelect,
    orderBy: { name: 'asc' },
  });
  return rows.map(toCountryDTO);
}

export async function getCountry(id: string): Promise<CountryDTO> {
  // Throws Prisma P2025 (-> 404) when not found.
  const row = await prisma.country.findUniqueOrThrow({ where: { id }, select: countrySelect });
  return toCountryDTO(row);
}

export async function createCountry(input: CreateCountryInput): Promise<CountryDTO> {
  const row = await prisma.country.create({
    data: {
      name: input.name,
      code: input.code,
      regulatoryFramework: input.regulatoryFramework,
      ...(input.mandatoryCessions !== undefined
        ? { mandatoryCessions: input.mandatoryCessions as Prisma.InputJsonValue }
        : {}),
      regulatorName: input.regulator?.name,
      regulatorWebsite: input.regulator?.website,
      regulatorEmail: input.regulator?.email,
      regulatorPhone: input.regulator?.phone,
      regulatorAddress: input.regulator?.address,
    },
    select: countrySelect,
  });
  return toCountryDTO(row);
}

export async function updateCountry(id: string, input: UpdateCountryInput): Promise<CountryDTO> {
  // Undefined fields are ignored by Prisma; explicit null clears the column.
  const row = await prisma.country.update({
    where: { id },
    data: {
      name: input.name,
      code: input.code,
      regulatoryFramework: input.regulatoryFramework,
      ...(input.mandatoryCessions !== undefined
        ? { mandatoryCessions: input.mandatoryCessions as Prisma.InputJsonValue }
        : {}),
      regulatorName: input.regulator?.name,
      regulatorWebsite: input.regulator?.website,
      regulatorEmail: input.regulator?.email,
      regulatorPhone: input.regulator?.phone,
      regulatorAddress: input.regulator?.address,
    },
    select: countrySelect,
  });
  return toCountryDTO(row);
}

export async function deleteCountry(id: string): Promise<void> {
  // Throws P2025 (-> 404) if missing, or P2003 (-> 409) if companies reference it.
  await prisma.country.delete({ where: { id } });
}
