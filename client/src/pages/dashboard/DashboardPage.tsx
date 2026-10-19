import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  ChevronRight,
  BookOpen,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
  GitBranch,
  Activity,
  Zap,
} from 'lucide-react';
import { progressApi } from '../../lib/api';
import { useAuthStore } from '../../store';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FadeIn, FadeInStagger, StaggerItem, CountUp } from '../../components/motion';

// Fallback high-fidelity academic transcript records
const DEFAULT_ENROLLMENTS = [
  {
    id: 'enr-101',
    courseId: 'crs-gcp-arch',
    title: 'Architecting with Google Compute Engine & Kubernetes',
    providerName: 'Google Cloud',
    providerSlug: 'google',
    category: 'Cloud Engineering',
    status: 'in_progress',
    percentComplete: 74,
    hoursSpent: 38.5,
    lastActivity: 'Yesterday at 18:40',
    currentUnit: 'Unit 5: Production Traffic Routing & Istio Service Mesh',
  },
  {
    id: 'enr-102',
    courseId: 'crs-tvet-fsd',
    title: 'National Diploma in Scalable Web Application Architecture',
    providerName: 'TVET Kenya',
    providerSlug: 'tvet',
    category: 'Software Engineering',
    status: 'in_progress',
    percentComplete: 88,
    hoursSpent: 42.0,
    lastActivity: '3 days ago',
    currentUnit: 'Unit 8: Database Sharding & Concurrency Controls',
  },
  {
    id: 'enr-103',
    courseId: 'crs-nvd-dl',
    title: 'Fundamentals of Accelerated Computing with CUDA C/C++',
    providerName: 'NVIDIA DLI',
    providerSlug: 'nvidia',
    category: 'Applied AI & Hardware',
    status: 'in_progress',
    percentComplete: 45,
    hoursSpent: 24.0,
    lastActivity: 'Oct 12, 2026',
    currentUnit: 'Unit 3: Thread Cooperation & Memory Latency Hiding',
  },
  {
    id: 'enr-104',
    courseId: 'crs-msft-sec',
    title: 'Enterprise Identity & Access Governance with Azure Entra',
    providerName: 'Microsoft Learn',
    providerSlug: 'microsoft',
    category: 'Cybersecurity',
    status: 'completed',
    percentComplete: 100,
    hoursSpent: 38.0,
    lastActivity: 'Oct 02, 2026',
    currentUnit: 'Accredited Certificate Issued · ID: MS-AZ-9941',
  },
];

const DEFAULT_WEEKLY_ACTIVITY = [
  { day: 'Mon', hours: 3.5, benchmark: 2.5 },
  { day: 'Tue', hours: 2.8, benchmark: 2.5 },
  { day: 'Wed', hours: 4.2, benchmark: 2.5 },
  { day: 'Thu', hours: 3.0, benchmark: 2.5 },
  { day: 'Fri', hours: 4.5, benchmark: 2.5 },
  { day: 'Sat', hours: 5.2, benchmark: 3.0 },
  { day: 'Sun', hours: 2.1, benchmark: 2.0 },
];

export default function DashboardPage() {
  const {
    user,
    sessionStatus,
    lastRefreshedAt,
    sessionAttestationId,
    refreshSession,
  } = useAuthStore();
  const [filterProvider, setFilterProvider] = useState<string>('all');

  const { data: apiData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressApi.dashboard().then((r) => r.data.data).catch(() => null),
    staleTime: 60000,
  });

  const enrollments = apiData?.recentEnrollments?.length
    ? apiData.recentEnrollments
    : DEFAULT_ENROLLMENTS;

  const filteredEnrollments =
    filterProvider === 'all'
      ? enrollments
      : enrollments.filter((e: any) =>
          (e.providerName || e.course?.provider?.displayName || '')
            .toLowerCase()
            .includes(filterProvider.toLowerCase())
        );

  const streakDays = apiData?.streakDays ?? 19;
  const totalHours = apiData?.totalHours ?? 142.5;
  const completedCount = apiData?.totalCompleted ?? 7;
  const credentialsCount = apiData?.credentials ?? 3;

  return (
    <div className="space-y-10">
      {/* ─── 1. Editorial Page Header with Live Interconnect Pipeline ────────── */}
      <FadeIn direction="up" delay={0.05}>
        <section className="border-b border-border/80 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  National Learner Registry
                </span>
                <span>·</span>
                <span>Ref: GSDAP-2026-8841</span>
                <span>·</span>
                <button
                  onClick={() => refreshSession()}
                  disabled={sessionStatus === 'refreshing'}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="Click to refresh active cryptographic session"
                >
                  <RefreshCw
                    size={10}
                    className={`text-emerald-500 ${sessionStatus === 'refreshing' ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {sessionStatus === 'refreshing'
                      ? 'Re-attesting...'
                      : `Active Session · Refreshed ${lastRefreshedAt}`}
                  </span>
                </button>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
                Academic Dossier & Study Record
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl font-sans leading-relaxed">
                Welcome, {user?.firstName || 'Amara'}. Your synchronized learning progress across accredited partner institutions, course milestones, and authenticated credentials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded border border-border/80 bg-card hover:bg-muted text-foreground transition-all shadow-sm"
              >
                <Download size={13} strokeWidth={1.5} />
                Export Transcript (PDF)
              </button>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded bg-foreground text-background hover:opacity-90 transition-opacity font-semibold shadow-sm"
              >
                <BookOpen size={13} strokeWidth={1.5} />
                Browse Catalogue
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── 2. Interconnected Ledger Style Metrics ─────────────────────────── */}
      <FadeIn direction="up" delay={0.12}>
        <section className="space-y-0">
          {/* Interconnected Visual Bus Header */}
          <div className="flex items-center justify-between px-4 py-2 border-x border-t border-border/80 bg-muted/25 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <GitBranch size={12} className="text-emerald-500" />
              <span>Interconnected Telemetry Bus</span>
            </span>
            <div className="hidden sm:flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Node α: Hours</span>
              </span>
              <span>─►</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Node β: Modules</span>
              </span>
              <span>─►</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Node γ: Rhythm</span>
              </span>
              <span>─►</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Node δ: Sealed</span>
              </span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ALL NODES ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border/80 divide-y sm:divide-y-0 sm:divide-x divide-border/80 bg-card/60 glass-panel">
            {/* Metric 1 */}
            <div className="p-6 relative group hover:bg-muted/20 transition-all duration-300">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Accredited Study
                </span>
                <Clock size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="font-mono text-3xl font-normal tracking-tight text-foreground">
                <CountUp end={totalHours} duration={1.8} /> <span className="text-sm text-muted-foreground font-sans">hrs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                +14.2 hrs logged over previous 14-day reporting window.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-6 relative group hover:bg-muted/20 transition-all duration-300">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Milestones Passed
                </span>
                <CheckCircle2 size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-sky-500 transition-colors" />
              </div>
              <div className="font-mono text-3xl font-normal tracking-tight text-foreground">
                <CountUp end={completedCount} duration={1.5} /> <span className="text-sm text-muted-foreground font-sans">of 11 modules</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                63.6% of curriculum requirements fulfilled to date.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-6 relative group hover:bg-muted/20 transition-all duration-300">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Current Rhythm
                </span>
                <Calendar size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="font-mono text-3xl font-normal tracking-tight text-foreground">
                <CountUp end={streakDays} duration={1.6} /> <span className="text-sm text-muted-foreground font-sans">days consecutive</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                Top 8% consistency benchmark across regional cohort.
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-6 relative group hover:bg-muted/20 transition-all duration-300">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Issued Credentials
                </span>
                <Award size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
              <div className="font-mono text-3xl font-normal tracking-tight text-foreground">
                <CountUp end={credentialsCount} duration={1.4} /> <span className="text-sm text-muted-foreground font-sans">certificates</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                Cryptographically verifiable on the national registry.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── 3. Split Layout: Active Syllabus (Left) & Study Distribution (Right) ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Enrollments */}
        <div className="lg:col-span-7 space-y-4">
          <FadeIn direction="up" delay={0.18}>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h2 className="font-serif text-xl font-normal text-foreground">
                  Current Course Enrollments
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Active syllabi interconnected across certified institutional providers
                </p>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-muted-foreground text-[11px] hidden sm:inline">PROVIDER:</span>
                <select
                  aria-label="Filter course provider"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="bg-card text-foreground border border-border/80 px-2 py-1 rounded text-xs font-mono outline-none shadow-sm focus:border-emerald-500"
                >
                  <option value="all">All Providers</option>
                  <option value="google">Google Cloud</option>
                  <option value="tvet">TVET Institute</option>
                  <option value="nvidia">NVIDIA DLI</option>
                  <option value="microsoft">Microsoft</option>
                </select>
              </div>
            </div>
          </FadeIn>

          {/* Enrollment List in Interconnected Progression Format */}
          <FadeInStagger staggerDelay={0.08} className="space-y-3 relative">
            {filteredEnrollments.map((item: any, index: number) => {
              const title = item.title || item.course?.title || 'Course Module';
              const provider =
                item.providerName || item.course?.provider?.displayName || 'National Partner';
              const percent = item.percentComplete ?? 50;
              const hours = item.hoursSpent ?? 12;
              const courseId = item.courseId || item.course?.id || item.id;
              const unit = item.currentUnit || 'Active Unit: Practical Lab Examination';

              return (
                <StaggerItem key={item.id}>
                  <div className="p-5 border border-border/80 rounded-md bg-card/60 glass-panel hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
                    {/* Interconnected Node Indicator on left border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-border/40 via-emerald-500/40 to-border/40 group-hover:from-emerald-500 group-hover:to-sky-500 transition-colors" />

                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-sm border border-border/70 bg-muted/40 text-foreground font-semibold">
                            {provider}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock size={11} className="text-muted-foreground" />
                            {hours} hrs logged
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            NODE 0{index + 1}
                          </span>
                        </div>
                        <h3 className="font-sans font-medium text-base text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {title}
                        </h3>
                      </div>

                      <Link
                        to={`/catalog/${courseId}`}
                        className="text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1 text-muted-foreground hover:text-foreground border border-border/80 px-2.5 py-1 rounded bg-background transition-all flex-shrink-0 shadow-sm group-hover:border-foreground/30"
                      >
                        <span>Syllabus</span>
                        <ArrowUpRight size={12} strokeWidth={1.5} />
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground font-sans mb-3 line-clamp-1">
                      {unit}
                    </p>

                    {/* Clean Hairline Progress Bar with Glow */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-muted-foreground">Module Syllabus Completion</span>
                        <span className="font-semibold text-foreground">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </FadeInStagger>
        </div>

        {/* Right Column: Weekly Study Time Chart + Academic Calendar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Activity Chart Container */}
          <FadeIn direction="up" delay={0.24}>
            <div className="border border-border/80 p-5 rounded-md bg-card/60 glass-panel shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-foreground">
                    Weekly Study Hours
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Study time logged per day (Mon–Sun)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    AVG: 3.6h/day
                  </span>
                </div>
              </div>

              {/* Area chart with smooth gradient and interconnected styling */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={DEFAULT_WEEKLY_ACTIVITY}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fontFamily: 'monospace', fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontFamily: 'monospace', fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}
                      formatter={(val: number) => [`${val} hours`, 'Logged']}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>WEEK TOTAL: 25.3 HRS</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">TARGET MET (+3.3h)</span>
              </div>
            </div>
          </FadeIn>

          {/* Academic Milestone Advisory Notice with Interconnected Seal */}
          <FadeIn direction="up" delay={0.3}>
            <div className="border border-border/80 p-5 rounded-md bg-muted/20 glass-panel shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-card border border-border/70 flex-shrink-0">
                  <ShieldCheck size={20} strokeWidth={1.5} className="text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                      NATIONAL JURY EVALUATION
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-foreground">
                    National Technical Assessment Scheduled
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your TVET Diploma portfolio review and Capstone Defense will convene on November 14, 2026. Maintain 80%+ coursework verification across all partner modules to qualify for the National Registry Seal.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      to="/dashboard/roadmap"
                      className="font-mono text-xs text-foreground hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>View Examination Criteria</span>
                      <ChevronRight size={12} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 4. Accredited Academic Record Table ───────────────────────────── */}
      <FadeIn direction="up" delay={0.35}>
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <div>
              <h2 className="font-serif text-xl font-normal text-foreground">
                Accredited Curriculum Transcript
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                Official institutional record of coursework, credits, and verification proofs
              </p>
            </div>
            <Link
              to="/dashboard/credentials"
              className="font-mono text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>All Certificates</span>
              <ChevronRight size={12} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="border border-border/80 rounded-md overflow-x-auto bg-card/60 glass-panel shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-border/80 bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Curriculum Module</th>
                  <th className="py-3 px-4 font-medium">Issuing Provider</th>
                  <th className="py-3 px-4 font-medium">Credit Hours</th>
                  <th className="py-3 px-4 font-medium">Status / Grade</th>
                  <th className="py-3 px-4 font-medium">Verification Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Enterprise Identity & Access Governance with Azure Entra
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">Microsoft Learn</td>
                  <td className="py-3.5 px-4 font-mono">38.0 hrs</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-medium">
                      <CheckCircle2 size={13} strokeWidth={1.5} />
                      Verified (96%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    <span className="cursor-pointer hover:text-foreground underline">
                      0x7F4B...99A1
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Architecting with Google Compute Engine & Kubernetes
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">Google Cloud</td>
                  <td className="py-3.5 px-4 font-mono">38.5 hrs</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-medium">
                      <Clock size={13} strokeWidth={1.5} />
                      In Progress (74%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    <span>Pending Final Exam</span>
                  </td>
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Scalable Distributed Systems & Microservices in Go
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">Coursera / Duke</td>
                  <td className="py-3.5 px-4 font-mono">42.0 hrs</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-medium">
                      <CheckCircle2 size={13} strokeWidth={1.5} />
                      Verified (98%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    <span className="cursor-pointer hover:text-foreground underline">
                      0x3E12...4D88
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Fundamentals of Accelerated Computing with CUDA C/C++
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">NVIDIA DLI</td>
                  <td className="py-3.5 px-4 font-mono">24.0 hrs</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-medium">
                      <Clock size={13} strokeWidth={1.5} />
                      In Progress (45%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    <span>Lab 3 in Review</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
