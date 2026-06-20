import { Prisma, type CompanyType, type MeetingType, type Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import {
  getEnrichmentService,
  type EnrichmentService,
} from '../enrichment/enrichment.service.js';
import type {
  CreateReportInput,
  ListReportsQuery,
  UpdateReportInput,
} from './report.schemas.js';

const reportSelect = {
  id: true,
  type: true,
  meetingDate: true,
  location: true,
  attendees: true,
  rawNotes: true,
  summaryBullets: true,
  actionItems: true,
  tags: true,
  countryId: true,
  companyId: true,
  authorId: true,
  country: { select: { id: true, name: true, code: true } },
  company: { select: { id: true, name: true, type: true } },
  author: { select: { id: true, name: true, email: true, role: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MeetingReportSelect;

type ReportRow = Prisma.MeetingReportGetPayload<{ select: typeof reportSelect }>;

export interface ReportDTO {
  id: string;
  type: MeetingType;
  meetingDate: Date;
  location: string | null;
  attendees: string[];
  rawNotes: string | null;
  summaryBullets: string[];
  actionItems: string[];
  tags: string[];
  countryId: string;
  companyId: string | null;
  authorId: string;
  country: { id: string; name: string; code: string };
  company: { id: string; name: string; type: CompanyType } | null;
  author: { id: string; name: string; email: string; role: Role };
  createdAt: Date;
  updatedAt: Date;
}

function asStringArray(value: Prisma.JsonValue | null): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function toReportDTO(row: ReportRow): ReportDTO {
  return {
    id: row.id,
    type: row.type,
    meetingDate: row.meetingDate,
    location: row.location,
    attendees: asStringArray(row.attendees),
    rawNotes: row.rawNotes,
    summaryBullets: asStringArray(row.summaryBullets),
    actionItems: asStringArray(row.actionItems),
    tags: asStringArray(row.tags),
    countryId: row.countryId,
    companyId: row.companyId,
    authorId: row.authorId,
    country: row.country,
    company: row.company,
    author: row.author,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertCountryExists(countryId: string): Promise<void> {
  const country = await prisma.country.findUnique({ where: { id: countryId }, select: { id: true } });
  if (!country) {
    throw new AppError(400, `Country '${countryId}' does not exist`);
  }
}

async function assertCompanyExists(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) {
    throw new AppError(400, `Company '${companyId}' does not exist`);
  }
}

export async function listReports(query: ListReportsQuery): Promise<ReportDTO[]> {
  const where: Prisma.MeetingReportWhereInput = {};
  if (query.countryId) where.countryId = query.countryId;
  if (query.companyId) where.companyId = query.companyId;
  if (query.type) where.type = query.type;
  if (query.authorId) where.authorId = query.authorId;
  if (query.from || query.to) {
    where.meetingDate = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  const rows = await prisma.meetingReport.findMany({
    where,
    select: reportSelect,
    orderBy: [{ meetingDate: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(toReportDTO);
}

export async function getReport(id: string): Promise<ReportDTO> {
  const row = await prisma.meetingReport.findUniqueOrThrow({ where: { id }, select: reportSelect });
  return toReportDTO(row);
}

export async function createReport(
  input: CreateReportInput,
  authorId: string,
  enrichment: EnrichmentService = getEnrichmentService(),
): Promise<ReportDTO> {
  await assertCountryExists(input.countryId);
  if (input.companyId) {
    await assertCompanyExists(input.companyId);
  }

  const enriched = await enrichment.enrich({
    rawNotes: input.rawNotes ?? '',
    type: input.type,
    attendees: input.attendees,
  });

  const row = await prisma.meetingReport.create({
    data: {
      type: input.type,
      countryId: input.countryId,
      companyId: input.companyId ?? null,
      authorId,
      meetingDate: input.meetingDate,
      location: input.location,
      attendees: input.attendees ?? [],
      rawNotes: input.rawNotes,
      summaryBullets: enriched.summaryBullets,
      actionItems: enriched.actionItems,
      tags: input.tags ?? [],
    },
    select: reportSelect,
  });
  return toReportDTO(row);
}

export async function updateReport(
  id: string,
  input: UpdateReportInput,
  enrichment: EnrichmentService = getEnrichmentService(),
): Promise<ReportDTO> {
  if (input.countryId) {
    await assertCountryExists(input.countryId);
  }
  if (input.companyId) {
    await assertCompanyExists(input.companyId);
  }

  // Re-run enrichment on every update using the effective notes (the incoming
  // rawNotes if provided, otherwise the stored ones). Throws P2025 (-> 404) if
  // the report doesn't exist.
  const existing = await prisma.meetingReport.findUniqueOrThrow({
    where: { id },
    select: { rawNotes: true },
  });
  const effectiveNotes = input.rawNotes !== undefined ? input.rawNotes : existing.rawNotes ?? '';

  const enriched = await enrichment.enrich({
    rawNotes: effectiveNotes ?? '',
    type: input.type,
    attendees: input.attendees,
  });

  const row = await prisma.meetingReport.update({
    where: { id },
    data: {
      type: input.type,
      countryId: input.countryId,
      // undefined -> leave unchanged; null -> clear the optional company link.
      companyId: input.companyId === undefined ? undefined : input.companyId,
      meetingDate: input.meetingDate,
      location: input.location,
      ...(input.attendees !== undefined ? { attendees: input.attendees } : {}),
      rawNotes: input.rawNotes,
      summaryBullets: enriched.summaryBullets,
      actionItems: enriched.actionItems,
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
    },
    select: reportSelect,
  });
  return toReportDTO(row);
}

export async function deleteReport(id: string): Promise<void> {
  await prisma.meetingReport.delete({ where: { id } });
}
