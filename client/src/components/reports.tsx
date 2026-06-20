import { Link } from 'react-router-dom';
import type { MeetingType } from '../types';
import { Badge, Card } from './ui';

export interface ReportLike {
  id: string;
  type: MeetingType;
  meetingDate: string;
  location?: string | null;
  summaryBullets: string[];
  actionItems?: string[];
  tags?: string[];
  country?: { id: string; name: string; code: string };
  company?: { id: string; name: string } | null;
}

function title(report: ReportLike): string {
  const parts = [report.country?.name, report.company?.name].filter(Boolean) as string[];
  if (parts.length > 0) return parts.join(' · ');
  return report.location ?? report.type.replace('_', ' ');
}

export function ReportCard({ report, editable }: { report: ReportLike; editable?: boolean }) {
  const heading = (
    <div className="flex items-center gap-2">
      <Badge>{report.type.replace('_', ' ')}</Badge>
      <span className="text-sm font-medium text-navy-900">{title(report)}</span>
    </div>
  );

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {editable ? (
          <Link to={`/reports/${report.id}/edit`} className="hover:underline">
            {heading}
          </Link>
        ) : (
          heading
        )}
        <span className="text-xs text-navy-400">
          {new Date(report.meetingDate).toLocaleDateString()}
        </span>
      </div>

      {report.summaryBullets.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-navy-600">
          {report.summaryBullets.slice(0, 4).map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {report.tags && report.tags.length > 0 ? (
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
  );
}

export function ReportList({
  reports,
  editable,
  empty = 'No reports yet.',
}: {
  reports: ReportLike[];
  editable?: boolean;
  empty?: string;
}) {
  if (reports.length === 0) {
    return <Card className="p-6 text-center text-sm text-navy-400">{empty}</Card>;
  }
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} editable={editable} />
      ))}
    </div>
  );
}
