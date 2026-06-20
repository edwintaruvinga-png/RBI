import { Loader2 } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-navy-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}

export function FullScreenSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
    </div>
  );
}
