import { NavLink } from 'react-router-dom';
import { Building2, Globe2, LayoutDashboard, FileText, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/countries', label: 'Countries', icon: Globe2, end: false },
  { to: '/companies', label: 'Companies', icon: Building2, end: false },
  { to: '/reports', label: 'Reports', icon: FileText, end: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-navy-900 text-navy-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <ShieldCheck className="h-6 w-6 text-gold-400" />
        <span className="text-lg font-semibold tracking-tight text-white">
          Market<span className="text-gold-400">Intel</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-navy-700 text-white border-l-2 border-gold-400'
                  : 'text-navy-200 hover:bg-navy-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-xs text-navy-400">Reinsurance market intelligence</div>
    </aside>
  );
}
