import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCompanyDashboard } from '../api/hooks/useDashboard';
import { Badge, Card, ErrorState } from '../components/ui';
import { Spinner } from '../components/Spinner';
import { MarketBriefCard } from '../components/feature';
import { ReportList } from '../components/reports';

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy-700">{value}</dd>
    </div>
  );
}

export function CompanyDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useCompanyDashboard(id);

  return (
    <div>
      <Link
        to="/companies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>

      {isLoading ? <Spinner label="Loading company…" /> : null}
      {isError ? <ErrorState message="Failed to load this company." /> : null}

      {data ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-navy-900">{data.company.name}</h1>
            <Badge>{data.company.type}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-5">
                <dl className="grid grid-cols-2 gap-4">
                  <Detail label="Country" value={data.company.country.name} />
                  <Detail label="Headquarters" value={data.company.headquarters} />
                  <Detail label="AM Best rating" value={data.company.amBestRating} />
                  <Detail label="Website" value={data.company.website} />
                </dl>
                {data.company.notes ? (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-navy-600">
                    {data.company.notes}
                  </p>
                ) : null}
                <Link
                  to={`/countries/${data.company.country.id}`}
                  className="mt-4 inline-block text-sm text-navy-600 underline decoration-gold-400 underline-offset-2 hover:text-navy-800"
                >
                  View {data.company.country.name} market →
                </Link>
              </Card>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-navy-900">Recent reports</h2>
                <ReportList reports={data.recentReports} editable empty="No reports for this company." />
              </div>
            </div>

            <div className="space-y-6">
              <MarketBriefCard brief={data.marketBrief} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
