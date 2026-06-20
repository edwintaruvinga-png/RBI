import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCountryDashboard } from '../api/hooks/useDashboard';
import { useCompanies } from '../api/hooks/useCompanies';
import { Badge, Card, ErrorState } from '../components/ui';
import { Spinner } from '../components/Spinner';
import { MarketBriefCard, RegulatorCard } from '../components/feature';
import { ReportList } from '../components/reports';

interface Cession {
  reinsurer?: string;
  rate?: number;
  basis?: string;
  note?: string;
}

function MandatoryCessions({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const cessions = value as Cession[];
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-navy-900">Mandatory cessions</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {cessions.map((cession, index) => (
          <li key={index} className="flex items-baseline justify-between gap-3">
            <span className="text-navy-700">
              {cession.reinsurer ?? 'Reinsurer'}
              {cession.basis ? <span className="text-navy-400"> · {cession.basis}</span> : null}
            </span>
            {typeof cession.rate === 'number' ? (
              <span className="font-semibold text-gold-600">{cession.rate}%</span>
            ) : (
              <span className="text-xs text-navy-400">{cession.note ?? 'compulsory'}</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CountryDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useCountryDashboard(id);
  const companies = useCompanies({ countryId: id });

  return (
    <div>
      <Link
        to="/countries"
        className="mb-4 inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Countries
      </Link>

      {isLoading ? <Spinner label="Loading country…" /> : null}
      {isError ? <ErrorState message="Failed to load this country." /> : null}

      {data ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-navy-900">{data.country.name}</h1>
            <Badge>{data.country.code}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-navy-900">Regulatory framework</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {data.country.regulatoryFramework ?? 'No framework notes recorded.'}
                </p>
              </Card>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-navy-900">
                  Companies in {data.country.name}
                </h2>
                {companies.isLoading ? <Spinner /> : null}
                <Card>
                  <ul className="divide-y divide-slate-100">
                    {(companies.data ?? []).length === 0 && !companies.isLoading ? (
                      <li className="px-5 py-4 text-sm text-navy-400">No companies recorded.</li>
                    ) : (
                      (companies.data ?? []).map((company) => (
                        <li key={company.id} className="px-5 py-3">
                          <Link
                            to={`/companies/${company.id}`}
                            className="flex items-center justify-between text-sm hover:underline"
                          >
                            <span className="font-medium text-navy-900">{company.name}</span>
                            <Badge>{company.type}</Badge>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </Card>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-navy-900">Recent reports</h2>
                <ReportList reports={data.recentReports} editable empty="No reports for this country." />
              </div>
            </div>

            <div className="space-y-6">
              <RegulatorCard regulator={data.country.regulator} />
              <MandatoryCessions value={data.country.mandatoryCessions} />
              <MarketBriefCard brief={data.marketBrief} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
