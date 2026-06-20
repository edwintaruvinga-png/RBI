import { Globe, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { Country, MarketBrief } from '../types';
import { Card } from './ui';

export function RegulatorCard({ regulator }: { regulator: Country['regulator'] }) {
  const rows = [
    { icon: Globe, value: regulator.website, href: regulator.website },
    { icon: Mail, value: regulator.email, href: regulator.email ? `mailto:${regulator.email}` : null },
    { icon: Phone, value: regulator.phone, href: null },
    { icon: MapPin, value: regulator.address, href: null },
  ].filter((row) => row.value);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-navy-900">Regulator</h3>
      <p className="mt-1 text-sm font-medium text-navy-700">{regulator.name ?? 'Not recorded'}</p>
      <ul className="mt-3 space-y-2">
        {rows.map(({ icon: Icon, value, href }, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-navy-500">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="break-all text-navy-600 underline decoration-gold-400 underline-offset-2 hover:text-navy-800"
              >
                {value}
              </a>
            ) : (
              <span className="break-words">{value}</span>
            )}
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-navy-400">No contact details on file.</li> : null}
      </ul>
    </Card>
  );
}

export function MarketBriefCard({ brief }: { brief: MarketBrief }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold-500" />
        <h3 className="text-sm font-semibold text-navy-900">Market brief</h3>
        <span className="ml-auto text-xs text-navy-300">
          {new Date(brief.generatedAt).toLocaleString()}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-600">
        {brief.brief || 'No brief available.'}
      </p>

      {brief.headlines.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-navy-400">Headlines</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {brief.headlines.map((headline, index) => (
              <li key={index}>
                {headline.url ? (
                  <a
                    href={headline.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy-600 hover:underline"
                  >
                    {headline.title}
                  </a>
                ) : (
                  <span className="text-navy-600">{headline.title}</span>
                )}
                {headline.source ? (
                  <span className="text-navy-300"> — {headline.source}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
