import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface ReportInput {
  type: MeetingType;
  countryId: string;
  companyId?: string;
  meetingDate: string;
  location?: string;
  attendees?: string[];
  rawNotes?: string;
  tags?: string[];
}

function toCreatePayload(input: ReportInput) {
  return {
    type: input.type,
    countryId: input.countryId,
    ...(input.companyId ? { companyId: input.companyId } : {}),
    meetingDate: input.meetingDate,
    ...(input.location ? { location: input.location } : {}),
    attendees: input.attendees ?? [],
    ...(input.rawNotes ? { rawNotes: input.rawNotes } : {}),
    tags: input.tags ?? [],
  };
}

function toUpdatePayload(input: ReportInput) {
  return {
    type: input.type,
    countryId: input.countryId,
    companyId: input.companyId ? input.companyId : null,
    meetingDate: input.meetingDate,
    location: input.location ?? null,
    attendees: input.attendees ?? [],
    rawNotes: input.rawNotes ?? '',
    tags: input.tags ?? [],
  };
}

export function useReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data } = await api.get<{ reports: Report[] }>('/reports', { params: filters });
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

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReportInput) => {
      const { data } = await api.post<{ report: Report }>('/reports', toCreatePayload(input));
      return data.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateReport(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReportInput) => {
      const { data } = await api.put<{ report: Report }>(`/reports/${id}`, toUpdatePayload(input));
      return data.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
