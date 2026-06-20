import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { Country } from '../../types';

export function useCountries(q?: string) {
  return useQuery({
    queryKey: ['countries', { q: q ?? '' }],
    queryFn: async () => {
      const { data } = await api.get<{ countries: Country[] }>('/countries', {
        params: q ? { q } : undefined,
      });
      return data.countries;
    },
  });
}

export function useCountry(id: string | undefined) {
  return useQuery({
    queryKey: ['countries', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<{ country: Country }>(`/countries/${id}`);
      return data.country;
    },
  });
}
