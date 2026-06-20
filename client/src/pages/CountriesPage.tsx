import { useCountries } from '../api/hooks/useCountries';
import { Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';

export function CountriesPage() {
  const { data: countries, isLoading, isError } = useCountries();

  return (
    <div>
      <PageHeader title="Countries" subtitle="Markets and their insurance regulators" />

      {isLoading ? <Spinner label="Loading countries…" /> : null}
      {isError ? <ErrorState message="Failed to load countries." /> : null}

      {countries ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Regulator</th>
                  <th className="px-5 py-3 font-semibold">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-navy-400">
                      No countries found.
                    </td>
                  </tr>
                ) : (
                  countries.map((country) => (
                    <tr key={country.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-navy-900">{country.name}</td>
                      <td className="px-5 py-3 text-navy-500">{country.code}</td>
                      <td className="px-5 py-3 text-navy-500">{country.regulator.name ?? '—'}</td>
                      <td className="px-5 py-3">
                        {country.regulator.website ? (
                          <a
                            href={country.regulator.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-navy-600 underline decoration-gold-400 underline-offset-2 hover:text-navy-800"
                          >
                            Visit
                          </a>
                        ) : (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
