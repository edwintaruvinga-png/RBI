import { useReports } from '../api/hooks/useReports';
import { Badge, Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';

export function ReportsPage() {
  const { data: reports, isLoading, isError } = useReports();

  return (
    <div>
      <PageHeader title="Reports" subtitle="Meeting, conference, call and site-visit reports" />

      {isLoading ? <Spinner label="Loading reports…" /> : null}
      {isError ? <ErrorState message="Failed to load reports." /> : null}

      {reports ? (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-6 text-center text-sm text-navy-400">No reports yet.</Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge>{report.type.replace('_', ' ')}</Badge>
                    <span className="text-sm font-medium text-navy-900">
                      {report.country.name}
                      {report.company ? ` · ${report.company.name}` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-navy-400">
                    {new Date(report.meetingDate).toLocaleDateString()}
                  </span>
                </div>

                {report.summaryBullets.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-navy-600">
                    {report.summaryBullets.slice(0, 3).map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}

                {report.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {report.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
