import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useReports, type ReportFilters } from '../api/hooks/useReports';
import { useCountries } from '../api/hooks/useCountries';
import { useCompanies } from '../api/hooks/useCompanies';
import { Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';
import { ReportList } from '../components/reports';
import type { MeetingType } from '../types';

const MEETING_TYPES: MeetingType[] = ['MEETING', 'CONFERENCE', 'CALL', 'SITE_VISIT'];
const selectClass =
  'rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500';

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const reports = useReports(filters);
  const countries = useCountries();
  const companies = useCompanies(filters.countryId ? { countryId: filters.countryId } : {});

  const update = (patch: Partial<ReportFilters>) => setFilters((prev) => ({ ...prev, ...patch }));
  const clean = (value: string) => (value ? value : undefined);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Reports" subtitle="Meeting, conference, call and site-visit reports" />
        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" /> New report
        </Link>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-navy-500">
            Country
            <select
              className={selectClass}
              value={filters.countryId ?? ''}
              onChange={(e) => update({ countryId: clean(e.target.value), companyId: undefined })}
            >
              <option value="">All</option>
              {(countries.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-navy-500">
            Company
            <select
              className={selectClass}
              value={filters.companyId ?? ''}
              onChange={(e) => update({ companyId: clean(e.target.value) })}
            >
              <option value="">All</option>
              {(companies.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-navy-500">
            Type
            <select
              className={selectClass}
              value={filters.type ?? ''}
              onChange={(e) => update({ type: clean(e.target.value) as MeetingType | undefined })}
            >
              <option value="">All</option>
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-navy-500">
            From
            <input
              type="date"
              className={selectClass}
              value={filters.from ?? ''}
              onChange={(e) => update({ from: clean(e.target.value) })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-navy-500">
            To
            <input
              type="date"
              className={selectClass}
              value={filters.to ?? ''}
              onChange={(e) => update({ to: clean(e.target.value) })}
            />
          </label>

          {Object.keys(filters).length > 0 ? (
            <button
              type="button"
              onClick={() => setFilters({})}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-navy-600 hover:bg-slate-50"
            >
              Clear
            </button>
          ) : null}
        </div>
      </Card>

      {reports.isLoading ? <Spinner label="Loading reports…" /> : null}
      {reports.isError ? <ErrorState message="Failed to load reports." /> : null}
      {reports.data ? <ReportList reports={reports.data} editable empty="No reports match these filters." /> : null}
    </div>
  );
}
