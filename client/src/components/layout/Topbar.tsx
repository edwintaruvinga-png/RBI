import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-navy-500">Welcome back{user ? `, ${user.name}` : ''}</div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-navy-900">{user.name}</div>
              <div className="text-xs text-navy-400">{user.role}</div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-navy-600 transition-colors hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
