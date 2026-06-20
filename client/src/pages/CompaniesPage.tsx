import { useCompanies } from '../api/hooks/useCompanies';
import { Badge, Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';

export function CompaniesPage() {
  const { data: companies, isLoading, isError } = useCompanies();

  return (
    <div>
      <PageHeader title="Companies" subtitle="Cedants, reinsurers, brokers and MGAs" />

      {isLoading ? <Spinner label="Loading companies…" /> : null}
      {isError ? <ErrorState message="Failed to load companies." /> : null}

      {companies ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Headquarters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-navy-400">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-navy-900">{company.name}</td>
                      <td className="px-5 py-3">
                        <Badge>{company.type}</Badge>
                      </td>
                      <td className="px-5 py-3 text-navy-500">{company.country.name}</td>
                      <td className="px-5 py-3 text-navy-500">{company.headquarters ?? '—'}</td>
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
