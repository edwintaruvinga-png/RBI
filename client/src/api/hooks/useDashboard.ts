import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { Company, Country, MarketBrief, Overview, Report } from '../../types';

export function useOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const { data } = await api.get<Overview>('/dashboard/overview');
      return data;
    },
  });
}

interface CountryDashboard {
  country: Country;
  recentReports: Report[];
  marketBrief: MarketBrief;
}

export function useCountryDashboard(id: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'country', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<CountryDashboard>(`/dashboard/countries/${id}`);
      return data;
    },
  });
}

interface CompanyDashboard {
  company: Company;
  recentReports: Report[];
  marketBrief: MarketBrief;
}

export function useCompanyDashboard(id: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'company', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<CompanyDashboard>(`/dashboard/companies/${id}`);
      return data;
    },
  });
}
