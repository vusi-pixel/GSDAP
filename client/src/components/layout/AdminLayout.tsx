import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Package, Globe, Layers, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store';

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Overview', exact: true },
  { to: '/admin/analytics', icon: Globe, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/providers', icon: Package, label: 'Providers' },
  { to: '/admin/tvet', icon: Layers, label: 'TVET Programs' },
];

export default function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 z-50 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="h-16 flex items-center px-5 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Admin Panel</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <NavLink to="/dashboard" className="nav-item">
            <ArrowLeft size={17} />
            <span>Back to App</span>
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 md:ml-56 p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
