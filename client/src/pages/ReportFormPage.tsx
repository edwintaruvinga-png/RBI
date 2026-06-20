import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useCountries } from '../api/hooks/useCountries';
import { useCompanies } from '../api/hooks/useCompanies';
import {
  useCreateReport,
  useReport,
  useUpdateReport,
  type ReportInput,
} from '../api/hooks/useReports';
import { Card, ErrorState, PageHeader } from '../components/ui';
import { Spinner } from '../components/Spinner';
import type { MeetingType, Report } from '../types';

const MEETING_TYPES: MeetingType[] = ['MEETING', 'CONFERENCE', 'CALL', 'SITE_VISIT'];
const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500';
const labelClass = 'mb-1 block text-sm font-medium text-navy-700';

interface FormState {
  type: MeetingType;
  countryId: string;
  companyId: string;
  meetingDate: string;
  location: string;
  attendees: string;
  rawNotes: string;
  tags: string;
}

const emptyForm: FormState = {
  type: 'MEETING',
  countryId: '',
  companyId: '',
  meetingDate: new Date().toISOString().slice(0, 10),
  location: '',
  attendees: '',
  rawNotes: '',
  tags: '',
};

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function ReportFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const countries = useCountries();
  const [form, setForm] = useState<FormState>(emptyForm);
  const companies = useCompanies(form.countryId ? { countryId: form.countryId } : {});

  const existing = useReport(id);
  const createReport = useCreateReport();
  const updateReport = useUpdateReport(id ?? '');
  const mutation = isEdit ? updateReport : createReport;

  const [result, setResult] = useState<Report | null>(null);

  // Prefill when editing.
  useEffect(() => {
    if (existing.data) {
      const r = existing.data;
      setForm({
        type: r.type,
        countryId: r.countryId,
        companyId: r.companyId ?? '',
        meetingDate: r.meetingDate.slice(0, 10),
        location: r.location ?? '',
        attendees: r.attendees.join(', '),
        rawNotes: r.rawNotes ?? '',
        tags: r.tags.join(', '),
      });
    }
  }, [existing.data]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input: ReportInput = {
      type: form.type,
      countryId: form.countryId,
      companyId: form.companyId || undefined,
      meetingDate: form.meetingDate,
      location: form.location || undefined,
      attendees: splitCsv(form.attendees),
      rawNotes: form.rawNotes || undefined,
      tags: splitCsv(form.tags),
    };
    mutation.mutate(input, { onSuccess: (report) => setResult(report) });
  };

  if (isEdit && existing.isLoading) {
    return <Spinner label="Loading report…" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/reports"
        className="mb-4 inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Reports
      </Link>

      <PageHeader title={isEdit ? 'Edit report' : 'New report'} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className={fieldClass}
                value={form.type}
                onChange={(e) => setField('type', e.target.value as MeetingType)}
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="meetingDate">
                Meeting date
              </label>
              <input
                id="meetingDate"
                type="date"
                required
                className={fieldClass}
                value={form.meetingDate}
                onChange={(e) => setField('meetingDate', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="countryId">
                Country
              </label>
              <select
                id="countryId"
                required
                className={fieldClass}
                value={form.countryId}
                onChange={(e) => setForm((prev) => ({ ...prev, countryId: e.target.value, companyId: '' }))}
              >
                <option value="">Select a country…</option>
                {(countries.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="companyId">
                Company (optional)
              </label>
              <select
                id="companyId"
                className={fieldClass}
                value={form.companyId}
                disabled={!form.countryId}
                onChange={(e) => setField('companyId', e.target.value)}
              >
                <option value="">None</option>
                {(companies.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className={fieldClass}
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                placeholder="e.g. Nairobi, Kenya"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="attendees">
                Attendees (comma-separated)
              </label>
              <input
                id="attendees"
                className={fieldClass}
                value={form.attendees}
                onChange={(e) => setField('attendees', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="tags">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                className={fieldClass}
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="rawNotes">
              Raw notes
            </label>
            <textarea
              id="rawNotes"
              rows={8}
              className={fieldClass}
              value={form.rawNotes}
              onChange={(e) => setField('rawNotes', e.target.value)}
              placeholder="Paste or write the raw meeting notes. A bullet summary and action items are generated on save."
            />
          </div>
        </Card>

        {mutation.isError ? (
          <ErrorState message="Could not save the report. Check the form or your permissions." />
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create report'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-navy-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {result ? (
        <Card className="mt-6 border-gold-200 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-navy-900">AI-generated summary</h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                Summary bullets
              </h4>
              {result.summaryBullets.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-600">
                  {result.summaryBullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-navy-400">No bullets generated.</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                Action items
              </h4>
              {result.actionItems.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-600">
                  {result.actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-navy-400">No action items generated.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="mt-5 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Done
          </button>
        </Card>
      ) : null}
    </div>
  );
}
