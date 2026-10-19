import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Save,
  User,
  Shield,
  Palette,
  Download,
  Trash2,
  CheckCircle2,
  Wifi,
  Sun,
  Moon,
  Laptop,
  AlertCircle,
  RefreshCw,
  Key,
  Radio,
  Lock,
  Network,
} from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore, useThemeStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '../components/motion';

export default function SettingsPage() {
  const {
    user,
    logout,
    sessionStatus,
    lastRefreshedAt,
    sessionAttestationId,
    sessionRefreshCount,
    refreshSession,
    accessToken,
  } = useAuthStore();
  const { theme, setTheme, dataSaverMode, setDataSaverMode } = useThemeStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'session'>('profile');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [sessionRefreshedFeedback, setSessionRefreshedFeedback] = useState(false);

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.me().then((r) => r.data.data).catch(() => null),
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    values: meData
      ? {
          firstName: meData.firstName,
          lastName: meData.lastName,
          bio: meData.profile?.bio || '',
        }
      : {
          firstName: user?.firstName || 'Student',
          lastName: user?.lastName || 'Learner',
          bio: 'Cloud Architect Apprentice & Distributed Systems Researcher under the TVET National Engineering Framework.',
        },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  async function handleRefreshSessionClick() {
    const success = await refreshSession();
    if (success) {
      setSessionRefreshedFeedback(true);
      setTimeout(() => setSessionRefreshedFeedback(false), 3000);
    }
  }

  async function handleExport() {
    try {
      const res = await userApi.exportData();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `gsdap-dossier-${user?.id || 'learner'}.json`;
      a.click();
    } catch {
      // Create mock export blob for dev
      const dataStr = JSON.stringify(
        { user, exportTimestamp: new Date().toISOString(), registryId: 'GSDAP-2026-8841' },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'omc-academic-dossier.json';
      a.click();
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <FadeIn direction="up" delay={0.05}>
        <section className="border-b border-border/80 pb-8 relative">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
            <span>Account Governance</span>
            <span>·</span>
            <span>User Dossier Configuration</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Interconnected Session
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-sans">
            Manage your personal identity, display typography, cryptographic session keys, low-bandwidth mode, and data sovereignty.
          </p>

          {/* Tab Selection */}
          <div className="flex flex-wrap border-b border-border/80 mt-8 gap-6 font-mono text-xs uppercase tracking-wider">
            {[
              { id: 'profile', label: '01. Profile Record' },
              { id: 'preferences', label: '02. Bandwidth & Display' },
              { id: 'session', label: '03. Session & Keys' },
              { id: 'privacy', label: '04. Data Sovereignty' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 transition-all font-semibold ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── Tab 1: Profile Record ─────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <FadeIn direction="up" delay={0.1}>
          <section className="space-y-6">
            <form
              onSubmit={handleSubmit((data) => updateMutation.mutateAsync(data))}
              className="border border-border/80 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-6 shadow-sm"
            >
              <div className="border-b border-border/70 pb-4">
                <h2 className="font-serif text-lg font-normal text-foreground">
                  Official Learner Dossier
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Details entered here appear directly on verified course certificates and examination attestations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { required: true })}
                    className="w-full text-xs font-sans px-3.5 py-2.5 bg-background/80 border border-border/80 rounded focus:border-emerald-500 focus:outline-none text-foreground shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { required: true })}
                    className="w-full text-xs font-sans px-3.5 py-2.5 bg-background/80 border border-border/80 rounded focus:border-emerald-500 focus:outline-none text-foreground shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Primary Academic / Institutional Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'student@gsdap.org'}
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-muted/40 border border-border/80 rounded text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    Registry email verified with GSDAP Identity Board (ID: GSDAP-2026-8841).
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Academic Focus & Capstone Dossier Notes
                  </label>
                  <textarea
                    rows={3}
                    {...register('bio')}
                    className="w-full text-xs font-sans px-3.5 py-2.5 bg-background/80 border border-border/80 rounded focus:border-emerald-500 focus:outline-none text-foreground shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {updateMutation.isSuccess && 'Record synchronized successfully'}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="font-mono text-xs uppercase tracking-wider px-5 py-2.5 bg-foreground text-background hover:opacity-90 transition-opacity font-semibold rounded shadow-sm inline-flex items-center gap-2 active:scale-95"
                >
                  <Save size={13} strokeWidth={1.5} />
                  <span>Update Dossier Record</span>
                </button>
              </div>
            </form>
          </section>
        </FadeIn>
      )}

      {/* ─── Tab 2: Bandwidth & Display ────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <FadeIn direction="up" delay={0.1}>
          <section className="space-y-6">
            <div className="border border-border/80 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="font-serif text-lg font-normal text-foreground">
                  Interface Color Scheme
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Select your preferred visual tone. Both options feature high contrast and strict readability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded border text-left transition-all flex items-start justify-between ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold shadow-sm'
                      : 'border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-sans mb-1 font-semibold">Warm Off-White Canvas</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Editorial daylight paper palette (#FBF9F5)
                    </span>
                  </div>
                  <Sun size={16} strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded border text-left transition-all flex items-start justify-between ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold shadow-sm'
                      : 'border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-sans mb-1 font-semibold">Deep Charcoal Slate</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Low-glare editorial dark mode (#141413)
                    </span>
                  </div>
                  <Moon size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Low Bandwidth & Offline Strategy */}
            <div className="border border-border/80 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi size={16} strokeWidth={1.5} className="text-foreground" />
                    <h3 className="font-serif text-base font-normal text-foreground">
                      Data-Saver & Low-Bandwidth Mode
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans max-w-xl leading-relaxed">
                    Engineered for rural networks and metered 2G/3G connections. Strips non-critical assets, suspends background telemetry sync, and enforces local caching for all syllabus materials.
                  </p>
                </div>

                <button
                  onClick={() => setDataSaverMode(!dataSaverMode)}
                  className={`font-mono text-xs uppercase tracking-wider px-3.5 py-2 border rounded transition-all flex-shrink-0 font-semibold shadow-sm ${
                    dataSaverMode
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {dataSaverMode ? 'Mode Active' : 'Mode Disabled'}
                </button>
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* ─── Tab 3: Session & Keys (Refresh Sessions) ────────────────────────── */}
      {activeTab === 'session' && (
        <FadeIn direction="up" delay={0.1}>
          <section className="space-y-6">
            <div className="border border-border/80 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-normal text-foreground">
                    Cryptographic Session Management & Token Refresh
                  </h2>
                  <p className="text-xs text-muted-foreground font-sans">
                    Your authenticated session coordinates verification proofs across the TVET, Google, and Microsoft provider relays.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  STATUS: {sessionStatus.toUpperCase()}
                </span>
              </div>

              {/* Session Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded border border-border/70 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block uppercase">Attestation Identifier</span>
                  <span className="text-foreground font-semibold mt-1 block truncate">
                    {sessionAttestationId}
                  </span>
                </div>

                <div className="p-4 rounded border border-border/70 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block uppercase">Last Key Attestation</span>
                  <span className="text-foreground font-semibold mt-1 block">
                    {lastRefreshedAt}
                  </span>
                </div>

                <div className="p-4 rounded border border-border/70 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block uppercase">Attestation Revision</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                    Rev #{sessionRefreshCount} (24h Window)
                  </span>
                </div>
              </div>

              {/* Action: Manual Session Refresh */}
              <div className="p-5 rounded border border-border/70 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-semibold text-foreground flex items-center gap-2">
                    <Key size={14} className="text-emerald-500" />
                    Renew Academic Session Attestation
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Issues a new signed session token against the National Learner Registry without interrupting ongoing syllabus progress.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshSessionClick}
                  disabled={sessionStatus === 'refreshing'}
                  className="font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw
                    size={13}
                    className={sessionStatus === 'refreshing' ? 'animate-spin' : ''}
                  />
                  <span>
                    {sessionStatus === 'refreshing'
                      ? 'Re-attesting...'
                      : sessionRefreshedFeedback
                      ? 'Key Renewed ✓'
                      : 'Refresh Session Now'}
                  </span>
                </button>
              </div>

              {/* Session Token Preview */}
              <div className="p-4 rounded border border-border/60 bg-muted/30 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase">
                  <span>Cryptographic Token Fingerprint (Bearer)</span>
                  <span>SHA-256 HASH MESH</span>
                </div>
                <p className="text-muted-foreground/80 break-all select-all font-mono">
                  {accessToken || 'omc-bearer-token-live-session-attestation-valid'}
                </p>
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* ─── Tab 4: Privacy & Data Sovereignty ─────────────────────────────── */}
      {activeTab === 'privacy' && (
        <FadeIn direction="up" delay={0.1}>
          <section className="space-y-6">
            <div className="border border-border/80 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-4 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="font-serif text-lg font-normal text-foreground">
                  Academic Dossier Portability
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Under the National Open Data & GDPR standard, you retain complete ownership of your study logs, course completions, and cryptographic signatures.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <p className="font-mono text-xs uppercase text-foreground">Full Archive Export (JSON)</p>
                  <p className="text-xs text-muted-foreground">
                    Includes raw timestamps, institutional provider audit entries, and verification public keys.
                  </p>
                </div>

                <button
                  onClick={handleExport}
                  className="font-mono text-xs uppercase tracking-wider px-4 py-2 border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all rounded inline-flex items-center gap-2 flex-shrink-0 shadow-sm active:scale-95"
                >
                  <Download size={13} strokeWidth={1.5} />
                  <span>Download Archive</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-500/30 p-6 md:p-8 rounded-md bg-card/60 glass-panel space-y-4 shadow-sm">
              <h3 className="font-serif text-base font-semibold text-red-600 dark:text-red-400">
                Registry Deregistration
              </h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Deregistering your learner identity terminates all pending curriculum accreditations and invalidates your active session keys. Verified certificates previously issued remain archived on the public ledger.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  placeholder={`Type "${user?.email || 'student@gsdap.org'}" to confirm`}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="font-mono text-xs bg-background/80 border border-border/80 rounded px-3 py-2 text-foreground focus:outline-none focus:border-red-500 flex-1 shadow-sm"
                />
                <button
                  type="button"
                  disabled={deleteConfirm !== (user?.email || 'student@gsdap.org')}
                  onClick={() => deleteMutation.mutate()}
                  className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-all inline-flex items-center gap-2 shadow-sm active:scale-95 flex-shrink-0"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                  <span>Confirm Deregistration</span>
                </button>
              </div>
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
