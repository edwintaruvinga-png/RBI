import { Building2, FileText, Globe2 } from 'lucide-react';
import { useOverview } from '../api/hooks/useDashboard';
import { Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-700 text-gold-400">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-semibold text-navy-900">{value}</div>
        <div className="text-sm text-navy-400">{label}</div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useOverview();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Reinsurance market intelligence at a glance" />

      {isLoading ? <Spinner label="Loading overview…" /> : null}
      {isError ? <ErrorState message="Failed to load the dashboard." /> : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Reports" value={data.counts.reports} icon={FileText} />
            <StatCard label="Countries" value={data.counts.countries} icon={Globe2} />
            <StatCard label="Companies" value={data.counts.companies} icon={Building2} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-navy-900">
                Recent reports
              </div>
              <ul className="divide-y divide-slate-100">
                {data.recentReports.length === 0 ? (
                  <li className="px-5 py-4 text-sm text-navy-400">No reports yet.</li>
                ) : (
                  data.recentReports.map((report) => (
                    <li key={report.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-navy-900">
                          {report.country.name}
                          {report.company ? ` · ${report.company.name}` : ''}
                        </span>
                        <span className="text-xs text-navy-400">
                          {new Date(report.meetingDate).toLocaleDateString()}
                        </span>
                      </div>
                      {report.summaryBullets[0] ? (
                        <p className="mt-1 text-sm text-navy-500">{report.summaryBullets[0]}</p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </Card>

            <Card>
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-navy-900">
                Most active countries
              </div>
              <ul className="divide-y divide-slate-100">
                {data.mostActiveCountries.length === 0 ? (
                  <li className="px-5 py-4 text-sm text-navy-400">No activity yet.</li>
                ) : (
                  data.mostActiveCountries.map((country) => (
                    <li
                      key={country.id}
                      className="flex items-center justify-between px-5 py-3 text-sm"
                    >
                      <span className="font-medium text-navy-900">{country.name}</span>
                      <span className="font-semibold text-gold-600">{country.reportCount}</span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
