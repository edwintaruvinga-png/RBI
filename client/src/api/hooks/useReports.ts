import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { MeetingType, Report } from '../../types';

export interface ReportFilters {
  countryId?: string;
  companyId?: string;
  type?: MeetingType;
  authorId?: string;
  from?: string;
  to?: string;
}

export function useReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data } = await api.get<{ reports: Report[] }>('/reports', {
        params: filters,
      });
      return data.reports;
    },
  });
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: ['reports', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<{ report: Report }>(`/reports/${id}`);
      return data.report;
    },
  });
}
