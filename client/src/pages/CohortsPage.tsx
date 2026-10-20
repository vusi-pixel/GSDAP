import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, ArrowUpRight, ShieldCheck, Search, KeyRound, Network, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cohortsApi } from '../lib/api';
import { useAuthStore } from '../store';
import { FadeIn, FadeInStagger, StaggerItem } from '../components/motion';

const DEFAULT_COHORTS = [
  {
    id: 'coh-ea-cloud',
    name: 'East Africa Cloud Infrastructure & Distributed Systems Guild',
    inviteCode: 'EAFR-CLD-26',
    description:
      'A mentor-led working group focused on Google Cloud Architecture, Kubernetes deployment topologies, and regional latency optimization.',
    membersCount: 42,
    maxMembers: 50,
    mentorName: 'Faculty Lead (Senior Principal Systems Architect)',
    startDate: '2026-09-01T00:00:00Z',
    institution: 'TVET National Directorate & Google Cloud Academic Program',
  },
  {
    id: 'coh-ai-cuda',
    name: 'Sub-Saharan Accelerated Computing & GPU Engineering Lab',
    inviteCode: 'AFR-CUDA-08',
    description:
      'Practical CUDA C++ kernel engineering, deep neural model sharding, and edge compute benchmarking for localized inference.',
    membersCount: 28,
    maxMembers: 35,
    mentorName: 'Accredited Instructor (NVIDIA Certified DLI Faculty)',
    startDate: '2026-09-15T00:00:00Z',
    institution: 'NVIDIA Deep Learning Institute Consortium',
  },
  {
    id: 'coh-go-dist',
    name: 'Microservices & Enterprise Go Architecture Working Group',
    inviteCode: 'GO-DIST-2026',
    description:
      'Rigorous study group analyzing high-throughput messaging protocols, Kafka event backplanes, and zero-downtime database migrations.',
    membersCount: 36,
    maxMembers: 40,
    mentorName: 'Staff Systems Instructor (Distributed Systems Faculty)',
    startDate: '2026-10-01T00:00:00Z',
    institution: 'Duke University / Coursera Academic Cohort',
  },
];

export default function CohortsPage() {
  const { isAuthenticated } = useAuthStore();
  const [inviteCode, setInviteCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const qc = useQueryClient();

  const { data: apiData } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => cohortsApi.list().then((r) => r.data.data).catch(() => null),
  });

  const cohorts = apiData?.length ? apiData : DEFAULT_COHORTS;

  const joinMutation = useMutation({
    mutationFn: (code: string) => cohortsApi.join(code),
    onSuccess: (res) => {
      setJoinMsg(`Successfully enrolled in cohort: ${res.data?.cohortId || inviteCode}`);
      setInviteCode('');
      qc.invalidateQueries({ queryKey: ['cohorts'] });
    },
    onError: (err: any) =>
      setJoinMsg(err?.response?.data?.message || 'Invalid or expired institutional cohort code.'),
  });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased pb-20 relative overflow-x-hidden">
      {/* Background Interconnected Atmospheric Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 interconnect-grid opacity-30 dark:opacity-20" />

      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/80 bg-card/20 py-10 px-6 md:px-12 relative z-10">
        <FadeIn direction="up" delay={0.05} className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Network size={13} className="text-emerald-500" />
              Collaborative Learning Directorate
            </span>
            <span>·</span>
            <span>Academic Seminar Cohorts</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Peer Review Guilds
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-foreground">
            Study Cohorts & Mentored Guilds
          </h1>

          <p className="text-sm md:text-base text-muted-foreground font-sans max-w-3xl leading-relaxed">
            Structured peer groups led by accredited senior engineers and university faculty. Cohorts provide weekly code reviews, architecture critiques, and direct capstone mentorship.
          </p>

          {/* Join with Invite Code Bar */}
          {isAuthenticated && (
            <div className="pt-4 max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound
                    size={14}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter Institutional Invite Code (e.g. EAFR-CLD-26)"
                    className="w-full bg-background/80 border border-border/80 rounded pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (inviteCode) joinMutation.mutate(inviteCode);
                  }}
                  disabled={!inviteCode || joinMutation.isPending}
                  className="font-mono text-xs uppercase tracking-wider px-4 py-2 bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity font-semibold rounded shadow-sm flex-shrink-0 active:scale-95"
                >
                  Join Guild
                </button>
              </div>
              {joinMsg && (
                <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-2">{joinMsg}</p>
              )}
            </div>
          )}
        </FadeIn>
      </section>

      {/* ─── Cohorts Catalogue ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-6 relative z-10">
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/80 pb-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ACTIVE INSTITUTIONAL WORKING GROUPS ({cohorts.length})
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">SEMESTER: 2026.2</span>
          </div>
        </FadeIn>

        <FadeInStagger staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort: any) => {
            const code = cohort.inviteCode || 'GSDAP-COHORT';
            const mentor = cohort.mentorName || cohort.mentor?.firstName || 'Faculty Advisor';
            const count = cohort.membersCount || cohort._count?.members || 32;
            const max = cohort.maxMembers || 50;
            const pct = Math.round((count / max) * 100);

            return (
              <StaggerItem key={cohort.id}>
                <div className="border border-border/80 rounded-md bg-card/60 glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs text-muted-foreground">
                      <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {code}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {count}/{max} SEATS ({pct}%)
                      </span>
                    </div>

                    <h2 className="font-serif text-xl font-medium text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <Link to={`/cohorts/${cohort.id}`}>{cohort.name}</Link>
                    </h2>

                    <p className="text-xs text-muted-foreground font-sans line-clamp-3 leading-relaxed">
                      {cohort.description}
                    </p>

                    <div className="pt-2 font-mono text-xs space-y-1 text-muted-foreground border-t border-border/40">
                      <p className="text-foreground text-[11px] truncate font-medium">Mentor: {mentor}</p>
                      <p className="text-[10px] truncate">{cohort.institution || 'GSDAP Academic Council'}</p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Weekly Sessions</span>
                    <Link
                      to={`/cohorts/${cohort.id}`}
                      className="inline-flex items-center gap-1 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors"
                    >
                      <span>Inspect Cohort</span>
                      <ArrowUpRight size={13} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </FadeInStagger>
      </section>
    </div>
  );
}
