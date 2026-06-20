import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-navy-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-navy-400">{subtitle}</p> : null}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
      {children}
    </span>
  );
}

export function ErrorState({ message = 'Something went wrong.' }: { message?: string }) {
  return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
