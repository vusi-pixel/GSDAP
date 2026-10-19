import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  Layers,
  FileCheck,
  GitCommit,
  GitBranch,
  Network,
  Zap,
} from 'lucide-react';
import { pathsApi } from '../../lib/api';
import { FadeIn, FadeInStagger, StaggerItem } from '../../components/motion';

const DEFAULT_PATHWAY = {
  id: 'path-fsd-cloud',
  title: 'National Diploma in Cloud Engineering & Scalable Systems',
  code: 'CURR-OMC-2026-FSD',
  curriculumBoard: 'TVET National Directorate in Partnership with Google & NVIDIA',
  totalHours: 240,
  completedHours: 142.5,
  description:
    'A multi-institutional curriculum aggregating accredited micro-credentials from Google Cloud, TVET Kenya, Duke University, and NVIDIA into a unified national professional qualification.',
  stages: [
    {
      stageNumber: '01',
      title: 'Foundations of Modern Distributed Computing',
      status: 'completed',
      completionSummary: '3 of 3 modules verified · 78 credit hours',
      modules: [
        {
          id: 'mod-101',
          code: 'CS-101',
          title: 'Linux Systems Programming & Network Fundamentals',
          provider: 'TVET Kenya',
          hours: 24,
          status: 'verified',
          score: '94%',
          credentialHash: '0x1A8F...39D0',
        },
        {
          id: 'mod-102',
          code: 'CS-102',
          title: 'Architecting Distributed Applications in Go & gRPC',
          provider: 'Coursera / Duke',
          hours: 32,
          status: 'verified',
          score: '98%',
          credentialHash: '0x3E12...4D88',
        },
        {
          id: 'mod-103',
          code: 'CS-103',
          title: 'Relational Database Internals & ACID Concurrency',
          provider: 'Microsoft Learn',
          hours: 22,
          status: 'verified',
          score: '92%',
          credentialHash: '0x5C91...88B2',
        },
      ],
    },
    {
      stageNumber: '02',
      title: 'Cloud Infrastructure & High-Availability Operations',
      status: 'in_progress',
      completionSummary: '2 of 3 modules in progress · 96 credit hours',
      modules: [
        {
          id: 'mod-201',
          code: 'CS-201',
          title: 'Architecting with Google Compute Engine & Kubernetes',
          provider: 'Google Cloud',
          hours: 38,
          status: 'in_progress',
          progressPercent: 74,
          unitNotes: 'Unit 5: Production Traffic Routing & Istio Service Mesh',
        },
        {
          id: 'mod-202',
          code: 'CS-202',
          title: 'Enterprise Identity & Access Governance with Azure Entra',
          provider: 'Microsoft Learn',
          hours: 38,
          status: 'verified',
          score: '96%',
          credentialHash: '0x7F4B...99A1',
        },
        {
          id: 'mod-203',
          code: 'CS-203',
          title: 'CI/CD Pipelines, Infrastructure as Code & Terraform',
          provider: 'TVET Kenya',
          hours: 20,
          status: 'pending',
          unitNotes: 'Prerequisite CS-201 required',
        },
      ],
    },
    {
      stageNumber: '03',
      title: 'Accelerated Systems & National Capstone Defense',
      status: 'upcoming',
      completionSummary: '0 of 2 modules started · 66 credit hours',
      modules: [
        {
          id: 'mod-301',
          code: 'CS-301',
          title: 'Fundamentals of Accelerated Computing with CUDA C/C++',
          provider: 'NVIDIA DLI',
          hours: 24,
          status: 'in_progress',
          progressPercent: 45,
          unitNotes: 'Unit 3: Thread Cooperation & Memory Latency Hiding',
        },
        {
          id: 'mod-302',
          code: 'CS-302',
          title: 'Industry Capstone Project & Peer Defense Examination',
          provider: 'OMC National Academic Board',
          hours: 42,
          status: 'pending',
          unitNotes: 'Convenes November 14, 2026',
        },
      ],
    },
  ],
};

export default function RoadmapPage() {
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');

  const { data: apiPaths } = useQuery({
    queryKey: ['paths-recommend'],
    queryFn: () => pathsApi.recommend().then((r) => r.data.data).catch(() => null),
  });

  const pathway = DEFAULT_PATHWAY;
  const progressRatio = Math.round((pathway.completedHours / pathway.totalHours) * 100);

  return (
    <div className="space-y-10">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <FadeIn direction="up" delay={0.05}>
        <section className="border-b border-border/80 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <Network size={13} className="text-emerald-500" />
                  Curriculum Syllabus
                </span>
                <span>·</span>
                <span>{pathway.code}</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Accredited Track
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
                {pathway.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed font-sans">
                {pathway.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono p-3 rounded-md bg-card/60 border border-border/80 glass-panel shadow-sm">
                <span className="text-xs text-muted-foreground uppercase block text-[10px]">
                  Total Credit Hours
                </span>
                <span className="text-2xl text-foreground font-semibold">
                  {pathway.completedHours}
                  <span className="text-xs font-normal text-muted-foreground">/{pathway.totalHours} hrs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hairline Progress Meter with Glowing Trail */}
          <div className="mt-6 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                CURRICULUM COMPLETION AUDIT
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{progressRatio}% MET</span>
            </div>
            <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── Interconnected Stage Pipeline Visualizer ──────────────────────── */}
      <FadeIn direction="up" delay={0.12}>
        <div className="p-4 rounded-md border border-border/80 bg-card/60 glass-panel shadow-sm">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <GitBranch size={13} className="text-emerald-500" />
              Interconnected Stage Pipeline
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              3 PHASES · VERIFIED PREREQUISITE CHAIN
            </span>
          </div>

          {/* Interactive Flow Chart Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            {pathway.stages.map((stage, idx) => {
              const isComp = stage.status === 'completed';
              const isProg = stage.status === 'in_progress';

              return (
                <div
                  key={stage.stageNumber}
                  className={`p-3.5 rounded border transition-all duration-300 relative ${
                    isComp
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isProg
                      ? 'border-sky-500/40 bg-sky-500/5 ring-1 ring-sky-500/20'
                      : 'border-border/80 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      PHASE 0{idx + 1}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isComp
                          ? 'bg-emerald-600 dark:bg-emerald-400'
                          : isProg
                          ? 'bg-sky-500'
                          : 'bg-muted-foreground/40'
                      }`}
                    />
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-foreground truncate">
                    {stage.title}
                  </h4>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {stage.completionSummary.split('·')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ─── Syllabus Stages with Interconnected Conduit ───────────────────── */}
      <FadeInStagger staggerDelay={0.12} className="space-y-8">
        {pathway.stages.map((stage) => {
          return (
            <StaggerItem key={stage.stageNumber}>
              <div className="border border-border/80 rounded-md bg-card/60 glass-panel shadow-sm overflow-hidden group">
                {/* Stage Header */}
                <div className="p-6 border-b border-border/80 bg-muted/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border/80 bg-background text-foreground font-bold shadow-sm">
                      STAGE {stage.stageNumber}
                    </span>
                    <div>
                      <h2 className="font-serif text-xl font-normal text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {stage.title}
                      </h2>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {stage.completionSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-sm border font-semibold ${
                        stage.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : stage.status === 'in_progress'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {stage.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Module Listing with Visual Connector Points */}
                <div className="divide-y divide-border/60">
                  {stage.modules.map((mod: any, mIdx: number) => {
                    const isVerified = mod.status === 'verified';
                    const isInProgress = mod.status === 'in_progress';

                    return (
                      <div
                        key={mod.id}
                        className="p-5 hover:bg-muted/15 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 relative"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-foreground/80">
                              {mod.code}
                            </span>
                            <span className="text-border">·</span>
                            <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-sm border border-border/80 bg-muted/40 text-foreground font-medium">
                              {mod.provider}
                            </span>
                            <span className="text-border">·</span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {mod.hours} Credit Hours
                            </span>
                          </div>

                          <h3 className="font-sans font-medium text-base text-foreground">
                            {mod.title}
                          </h3>

                          {mod.unitNotes && (
                            <p className="text-xs text-muted-foreground font-sans">
                              {mod.unitNotes}
                            </p>
                          )}
                        </div>

                        {/* Right Verification Status */}
                        <div className="flex items-center gap-4 flex-shrink-0 md:text-right">
                          <div>
                            {isVerified && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                                  <CheckCircle2 size={13} strokeWidth={1.5} />
                                  Verified ({mod.score})
                                </span>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  Hash: {mod.credentialHash}
                                </p>
                              </div>
                            )}

                            {isInProgress && (
                              <div className="space-y-1 w-36">
                                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                                  <span>PROGRESS</span>
                                  <span className="text-foreground font-semibold">{mod.progressPercent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                                    style={{ width: `${mod.progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {mod.status === 'pending' && (
                              <span className="font-mono text-xs text-muted-foreground">
                                Awaiting Prerequisite
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/catalog`}
                            className="font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border/80 bg-background hover:bg-muted text-foreground transition-all shadow-sm active:scale-95"
                          >
                            <span>Review</span>
                            <ArrowUpRight size={12} strokeWidth={1.5} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </FadeInStagger>
    </div>
  );
}
