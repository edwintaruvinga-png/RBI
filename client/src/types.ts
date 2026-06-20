export type Role = 'BROKER' | 'ADMIN' | 'VIEWER';
export type CompanyType = 'CEDANT' | 'REINSURER' | 'BROKER' | 'MGA';
export type MeetingType = 'MEETING' | 'CONFERENCE' | 'CALL' | 'SITE_VISIT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  regulatoryFramework: string | null;
  mandatoryCessions: unknown;
  regulator: {
    name: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  countryId: string;
  type: CompanyType;
  amBestRating: string | null;
  website: string | null;
  headquarters: string | null;
  notes: string | null;
  country: { id: string; name: string; code: string };
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: MeetingType;
  meetingDate: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface MarketBrief {
  brief: string;
  headlines: Array<{
    title: string;
    source: string | null;
    url: string | null;
    publishedAt: string | null;
  }>;
  generatedAt: string;
}

export interface Overview {
  counts: { reports: number; countries: number; companies: number };
  recentReports: Array<{
    id: string;
    type: MeetingType;
    meetingDate: string;
    summaryBullets: string[];
    country: { id: string; name: string; code: string };
    company: { id: string; name: string } | null;
    author: { id: string; name: string };
  }>;
  mostActiveCountries: Array<{ id: string; name: string; code: string; reportCount: number }>;
}
