import { Prisma, type MeetingType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { getCountry, type CountryDTO } from '../countries/country.service.js';
import { getCompany, type CompanyDTO } from '../companies/company.service.js';
import { getMarketBrief, type MarketBrief } from '../enrichment/enrichment.service.js';

function asStringArray(value: Prisma.JsonValue | null): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export interface OverviewReport {
  id: string;
  type: MeetingType;
  meetingDate: Date;
  summaryBullets: string[];
  country: { id: string; name: string; code: string };
  company: { id: string; name: string } | null;
  author: { id: string; name: string };
}

export interface ActiveCountry {
  id: string;
  name: string;
  code: string;
  reportCount: number;
}

export interface OverviewDashboard {
  counts: { reports: number; countries: number; companies: number };
  recentReports: OverviewReport[];
  mostActiveCountries: ActiveCountry[];
}

const overviewReportSelect = {
  id: true,
  type: true,
  meetingDate: true,
  summaryBullets: true,
  country: { select: { id: true, name: true, code: true } },
  company: { select: { id: true, name: true } },
  author: { select: { id: true, name: true } },
} satisfies Prisma.MeetingReportSelect;

export async function getOverview(): Promise<OverviewDashboard> {
  const [reports, countries, companies, recent, active] = await Promise.all([
    prisma.meetingReport.count(),
    prisma.country.count(),
    prisma.company.count(),
    prisma.meetingReport.findMany({
      take: 5,
      orderBy: [{ meetingDate: 'desc' }, { createdAt: 'desc' }],
      select: overviewReportSelect,
    }),
    prisma.country.findMany({
      take: 5,
      orderBy: { meetingReports: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { meetingReports: true } },
      },
    }),
  ]);

  return {
    counts: { reports, countries, companies },
    recentReports: recent.map((report) => ({
      id: report.id,
      type: report.type,
      meetingDate: report.meetingDate,
      summaryBullets: asStringArray(report.summaryBullets),
      country: report.country,
      company: report.company,
      author: report.author,
    })),
    mostActiveCountries: active
      .map((country) => ({
        id: country.id,
        name: country.name,
        code: country.code,
        reportCount: country._count.meetingReports,
      }))
      .filter((country) => country.reportCount > 0),
  };
}

// ---------------------------------------------------------------------------
// Per-entity dashboards
// ---------------------------------------------------------------------------

export interface EntityReport {
  id: string;
  type: MeetingType;
  meetingDate: Date;
  location: string | null;
  summaryBullets: string[];
  actionItems: string[];
  tags: string[];
  company: { id: string; name: string } | null;
  author: { id: string; name: string };
}

export interface CountryDashboard {
  country: CountryDTO;
  recentReports: EntityReport[];
  marketBrief: MarketBrief;
}

export interface CompanyDashboard {
  company: CompanyDTO;
  recentReports: EntityReport[];
  marketBrief: MarketBrief;
}

const entityReportSelect = {
  id: true,
  type: true,
  meetingDate: true,
  location: true,
  summaryBullets: true,
  actionItems: true,
  tags: true,
  company: { select: { id: true, name: true } },
  author: { select: { id: true, name: true } },
} satisfies Prisma.MeetingReportSelect;

async function recentReportsFor(where: Prisma.MeetingReportWhereInput): Promise<EntityReport[]> {
  const reports = await prisma.meetingReport.findMany({
    where,
    take: 10,
    orderBy: [{ meetingDate: 'desc' }, { createdAt: 'desc' }],
    select: entityReportSelect,
  });

  return reports.map((report) => ({
    id: report.id,
    type: report.type,
    meetingDate: report.meetingDate,
    location: report.location,
    summaryBullets: asStringArray(report.summaryBullets),
    actionItems: asStringArray(report.actionItems),
    tags: asStringArray(report.tags),
    company: report.company,
    author: report.author,
  }));
}

export async function getCountryDashboard(id: string): Promise<CountryDashboard> {
  const country = await getCountry(id); // throws 404 if missing
  const [recentReports, marketBrief] = await Promise.all([
    recentReportsFor({ countryId: id }),
    getMarketBrief({ kind: 'country', id, name: country.name }),
  ]);
  return { country, recentReports, marketBrief };
}

export async function getCompanyDashboard(id: string): Promise<CompanyDashboard> {
  const company = await getCompany(id); // throws 404 if missing
  const [recentReports, marketBrief] = await Promise.all([
    recentReportsFor({ companyId: id }),
    getMarketBrief({ kind: 'company', id, name: company.name }),
  ]);
  return { company, recentReports, marketBrief };
}
