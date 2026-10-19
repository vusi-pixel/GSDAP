import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  LayoutDashboard,
  Users,
  Sun,
  Moon,
  ShieldCheck,
  Compass,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';
import { authApi } from '../lib/api';
import { AnimatePresence, motion } from './motion';

export default function Navbar() {
  const {
    isAuthenticated,
    user,
    logout,
    sessionStatus,
    lastRefreshedAt,
    sessionAttestationId,
    refreshSession,
  } = useAuthStore();
  const { theme, setTheme, dataSaverMode, setDataSaverMode } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    navigate('/login');
  }

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 glass-panel antialiased">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Registry Mark with Interconnected Pin */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 border border-foreground/80 rounded flex items-center justify-center font-mono text-xs font-bold text-foreground bg-card/80 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors shadow-sm relative">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 absolute -top-0.5 -right-0.5" />
              GS
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground block leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                GSDAP
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mt-0.5">
                Ghana Student Digital Access Programme
              </span>
            </div>
          </Link>

          {/* Editorial Nav Links with Underline Transitions */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `px-3 py-1.5 transition-all rounded-sm ${
                  isActive
                    ? 'text-foreground font-semibold bg-muted/40 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`
              }
            >
              Catalogue
            </NavLink>
            <NavLink
              to="/cohorts"
              className={({ isActive }) =>
                `px-3 py-1.5 transition-all rounded-sm ${
                  isActive
                    ? 'text-foreground font-semibold bg-muted/40 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`
              }
            >
              Study Cohorts
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 transition-all rounded-sm ${
                  isActive
                    ? 'text-foreground font-semibold bg-muted/40 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`
              }
            >
              Learner Dashboard
            </NavLink>
          </nav>
        </div>

        {/* Right Session & Toggle Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Low Bandwidth Toggle */}
          <button
            onClick={() => setDataSaverMode(!dataSaverMode)}
            className={`hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 border rounded transition-all shadow-sm ${
              dataSaverMode
                ? 'border-emerald-500/50 text-foreground bg-emerald-500/10 font-semibold'
                : 'border-border/80 text-muted-foreground hover:text-foreground bg-card/40'
            }`}
            title="Toggle data-saver mode"
          >
            <span>Data-Saver:</span>
            <span className={dataSaverMode ? 'text-emerald-600 dark:text-emerald-400' : ''}>
              {dataSaverMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Theme Text Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            title="Toggle color theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} strokeWidth={1.5} />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={13} strokeWidth={1.5} />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Dossier or Access CTA with Live Session Interconnect */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="font-mono text-xs border border-border/80 px-3 py-1.5 rounded bg-card/60 hover:bg-muted/60 text-foreground transition-all inline-flex items-center gap-2 shadow-sm group"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    sessionStatus === 'refreshing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-emerald-600 dark:bg-emerald-400'
                  }`}
                />
                <span className="hidden sm:inline font-semibold">{user?.firstName || 'Amara'}</span>
                <span className="text-muted-foreground text-[10px] hidden sm:inline">Dossier</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 font-mono text-xs">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 bg-foreground text-background hover:opacity-90 transition-opacity font-semibold rounded shadow-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Pronounced Slide & Fade */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border/80 glass-panel px-6 py-4 space-y-3 font-mono text-xs uppercase tracking-wider overflow-hidden"
          >
            <Link
              to="/catalog"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Course Catalogue
            </Link>
            <Link
              to="/cohorts"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Study Cohorts
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Academic Overview
            </Link>
            <Link
              to="/dashboard/roadmap"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Curriculum Roadmap
            </Link>
            <Link
              to="/dashboard/credentials"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Verified Credentials
            </Link>

            {/* Quick Session Control in Mobile Drawer */}
            {isAuthenticated && (
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  SESSION: {sessionAttestationId.slice(0, 11)}
                </span>
                <button
                  onClick={() => refreshSession()}
                  disabled={sessionStatus === 'refreshing'}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 rounded border border-emerald-500/30"
                >
                  <RefreshCw size={10} className={sessionStatus === 'refreshing' ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors">
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </button>
              <button
                onClick={() => setDataSaverMode(!dataSaverMode)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Data-Saver: {dataSaverMode ? 'Active' : 'Off'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
