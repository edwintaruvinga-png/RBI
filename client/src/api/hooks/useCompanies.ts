import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { Company, CompanyType } from '../../types';

export interface CompanyFilters {
  countryId?: string;
  type?: CompanyType;
  q?: string;
}

export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: async () => {
      const { data } = await api.get<{ companies: Company[] }>('/companies', {
        params: filters,
      });
      return data.companies;
    },
  });
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ['companies', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<{ company: Company }>(`/companies/${id}`);
      return data.company;
    },
  });
}
