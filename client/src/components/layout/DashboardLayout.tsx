import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Award,
  Settings,
  BookOpen,
  Users,
  LogOut,
  Sun,
  Moon,
  Wifi,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Activity,
  Radio,
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';
import { authApi } from '../../lib/api';
import { PageTransition, AnimatePresence, motion } from '../motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Academic Overview', exact: true, code: '01' },
  { to: '/dashboard/roadmap', icon: Compass, label: 'Curriculum Roadmap', code: '02' },
  { to: '/dashboard/credentials', icon: Award, label: 'Verified Credentials', code: '03' },
  { to: '/catalog', icon: BookOpen, label: 'Course Catalogue', code: '04' },
  { to: '/cohorts', icon: Users, label: 'Study Cohorts', code: '05' },
  { to: '/settings', icon: Settings, label: 'Account & Bandwidth', code: '06' },
];

export default function DashboardLayout() {
  const {
    user,
    logout,
    sessionStatus,
    lastRefreshedAt,
    sessionAttestationId,
    sessionRefreshCount,
    refreshSession,
  } = useAuthStore();
  const { theme, setTheme, dataSaverMode, setDataSaverMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

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

  const handleManualRefresh = async () => {
    const success = await refreshSession();
    if (success) {
      setShowRefreshNotice(true);
      setTimeout(() => setShowRefreshNotice(false), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground antialiased selection:bg-brand-500/20 relative overflow-x-hidden">
      {/* Background Interconnected Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 interconnect-grid opacity-40 dark:opacity-25" />
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* ─── Editorial Interconnected Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-40 border-r border-border/80 glass-panel">
        {/* Brand & Registry Header with Interconnect Tag */}
        <div className="p-6 border-b border-border/60 relative">
          <div className="absolute top-2 right-4 flex items-center gap-1 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>NODE 01</span>
          </div>
          <NavLink to="/dashboard" className="block group">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase block mb-1">
              National & Global Registry
            </span>
            <span className="font-serif text-xl tracking-tight font-semibold block text-foreground group-hover:text-brand-500 transition-colors">
              One Million Coders
            </span>
          </NavLink>
        </div>

        {/* Learner Dossier Card with Cryptographic Seal */}
        <div className="p-5 border-b border-border/60 bg-muted/15 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-serif font-semibold text-sm leading-tight text-foreground">
                {user?.firstName || 'Amara'} {user?.lastName || 'Okafor'}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span>ID: OMC-2026-8841</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20 shadow-sm">
              <ShieldCheck size={11} strokeWidth={1.5} />
              Verified
            </span>
          </div>

          <div className="pt-2 text-xs text-muted-foreground border-t border-border/40 flex items-center justify-between font-mono">
            <span className="text-[11px]">TRACK: FULL-STACK & AI</span>
            <span className="text-foreground font-semibold">68%</span>
          </div>

          {/* Micro telemetry footer */}
          <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Radio size={10} className="text-emerald-500" />
              <span>KEY: {sessionAttestationId.slice(0, 11)}</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">LIVE ATTESTATION</span>
          </div>
        </div>

        {/* Navigation Section with Interconnected Circuit Rail */}
        <div className="px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase block">
            Interconnected System Index
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/80">6 MODULES</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto relative">
          {/* Subtle vertical connection line linking the steps */}
          <div className="absolute left-[26px] top-3 bottom-6 w-px bg-gradient-to-b from-border via-border/70 to-border/20 z-0 pointer-events-none" />

          {navItems.map(({ to, icon: Icon, label, exact, code }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `group relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 font-sans ${
                  isActive
                    ? 'bg-foreground text-background font-medium shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <span
                      className={`font-mono text-[10px] w-5 h-5 flex items-center justify-center rounded-sm transition-all ${
                        isActive
                          ? 'bg-background text-foreground font-bold shadow-sm ring-2 ring-emerald-500/40'
                          : 'bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                      }`}
                    >
                      {code}
                    </span>
                  </div>
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-emerald-400' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                  <span className="truncate">{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Controls & Session Attestation Station */}
        <div className="p-4 border-t border-border/80 space-y-3 bg-muted/15">
          {/* Refresh Session Control Module */}
          <div className="p-2.5 rounded border border-border/80 bg-card/60 backdrop-blur-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-foreground font-medium text-[11px]">
                <Activity size={12} className="text-emerald-600 dark:text-emerald-400" />
                Session Node
              </span>
              <span className="text-[10px] text-muted-foreground">
                Refreshed: {lastRefreshedAt}
              </span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={sessionStatus === 'refreshing'}
              className="w-full py-1.5 px-2.5 text-[11px] font-mono uppercase tracking-wider rounded border border-border/90 bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw
                size={11}
                className={`text-emerald-500 ${sessionStatus === 'refreshing' ? 'animate-spin' : ''}`}
              />
              <span>
                {sessionStatus === 'refreshing'
                  ? 'Re-attesting...'
                  : sessionStatus === 'refreshed'
                  ? 'Session Re-attested ✓'
                  : 'Refresh Session'}
              </span>
            </button>
          </div>

          {/* Low Bandwidth Toggle */}
          <div className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded border border-border/80 bg-card/60">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <Wifi size={12} strokeWidth={1.5} />
              Low Bandwidth
            </span>
            <button
              onClick={() => setDataSaverMode(!dataSaverMode)}
              className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold rounded transition-colors ${
                dataSaverMode
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {dataSaverMode ? 'Active' : 'Off'}
            </button>
          </div>

          {/* Theme & Sign Out Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={13} strokeWidth={1.5} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={13} strokeWidth={1.5} />
                  <span>Dark Slate</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-mono"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative z-10">
        {/* Precision Editorial Header Bar */}
        <header className="h-14 border-b border-border/80 px-6 flex items-center justify-between glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-muted-foreground hidden sm:inline">REGISTRY</span>
              <span className="text-border hidden sm:inline">/</span>
              <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
                {location.pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview') || 'Overview'}
              </span>
            </div>

            {/* Micro Interconnect Signal Tag */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/40 border border-border/60">
              <span className="text-emerald-500 font-semibold">MESH:</span>
              <span>5 NODES SYNCED</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Header Interactive Session Refresh Bar */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/30 border border-border/70 text-[11px] text-muted-foreground">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sessionStatus === 'refreshing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-emerald-600 dark:bg-emerald-400'
                  }`}
                />
                <span className="text-foreground font-medium">SESSION:</span>
                <span>{sessionAttestationId.slice(0, 11)}</span>
                <span className="text-muted-foreground/60">· {lastRefreshedAt}</span>
              </div>

              <button
                onClick={handleManualRefresh}
                disabled={sessionStatus === 'refreshing'}
                title="Refresh active learner cryptographic session"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded border border-border/80 bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-sm"
              >
                <RefreshCw
                  size={11}
                  className={`text-emerald-500 ${sessionStatus === 'refreshing' ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh Session</span>
              </button>
            </div>

            <NavLink
              to="/home"
              className="font-mono text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors border-l border-border/60 pl-3 md:pl-4"
            >
              <span className="hidden sm:inline">Public Portal</span>
              <ExternalLink size={11} strokeWidth={1.5} />
            </NavLink>
          </div>
        </header>

        {/* Pronounced Session Refresh Toast Notification */}
        <AnimatePresence>
          {showRefreshNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-16 z-40 mx-auto max-w-xl w-full px-6 pointer-events-none"
            >
              <div className="p-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 rounded-md shadow-2xl backdrop-blur-md flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                  <span>
                    Cryptographic Session Attested ({sessionAttestationId}) · Valid for 24h
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest">
                  REV #{sessionRefreshCount}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Outlet with Pronounced Silk Page Transitions */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>

        {/* Mobile Navigation Bar with Interconnected Badges */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-border z-50">
          <div className="grid grid-cols-5 text-center">
            {navItems.slice(0, 5).map(({ to, icon: Icon, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2.5 text-xs transition-colors ${
                    isActive
                      ? 'text-foreground font-semibold border-t-2 border-emerald-500 bg-muted/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                <span className="text-[10px] mt-1 font-mono">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
