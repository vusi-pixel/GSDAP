import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExternalLink,
  Award,
  Clock,
  Globe,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Building,
  Network,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { catalogApi, enrollmentApi } from '../lib/api';
import { useAuthStore } from '../store';
import { FadeIn, FadeInStagger, StaggerItem } from '../components/motion';

const DEFAULT_COURSE_DETAILS: Record<string, any> = {
  'crs-gcp-arch': {
    id: 'crs-gcp-arch',
    code: 'GCP-ARCH-301',
    title: 'Architecting with Google Compute Engine & Kubernetes',
    description:
      'A comprehensive systems engineering program on designing robust, high-availability, fault-tolerant infrastructure on Google Cloud Platform. Topics include VPC routing, Kubernetes pod auto-scaling, Istio service mesh deployments, IAM identity federation, and automated disaster recovery protocols.',
    provider: { name: 'google', displayName: 'Google Cloud' },
    level: 'intermediate',
    durationHours: 38,
    cost: 0,
    certificateAvailable: true,
    language: 'English',
    institution: {
      name: 'Google Cloud Education Consortium',
      country: 'Global',
    },
    skills: [
      'Kubernetes Architecture',
      'VPC Peering & Routing',
      'Istio Service Mesh',
      'Cloud IAM Federation',
      'Terraform for GCP',
      'Observability & Prometheus',
    ],
    syllabus: [
      { unit: 'Unit 1', title: 'Foundations of Compute Engine & Virtual Private Cloud (VPC)' },
      { unit: 'Unit 2', title: 'Managed Instance Groups & Regional Load Balancing' },
      { unit: 'Unit 3', title: 'Containerization & Google Kubernetes Engine (GKE) Internals' },
      { unit: 'Unit 4', title: 'Microservice Communication & Ingress Controller Management' },
      { unit: 'Unit 5', title: 'Production Traffic Routing & Istio Service Mesh' },
      { unit: 'Unit 6', title: 'Cloud Monitoring, Logging & Reliability Engineering' },
    ],
  },
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data: apiData } = useQuery({
    queryKey: ['course', id],
    queryFn: () => catalogApi.detail(id!).then((r) => r.data.data).catch(() => null),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentApi.enroll({ courseId: id! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  const course =
    apiData ||
    DEFAULT_COURSE_DETAILS[id || ''] || {
      id: id || 'crs-default',
      code: 'OMC-SYL-101',
      title: 'Architecting with Google Compute Engine & Kubernetes',
      description:
        'A comprehensive systems engineering program on designing robust, high-availability, fault-tolerant infrastructure on Google Cloud Platform. Topics include VPC routing, Kubernetes pod auto-scaling, Istio service mesh deployments, IAM identity federation, and automated disaster recovery protocols.',
      provider: { name: 'google', displayName: 'Google Cloud' },
      level: 'intermediate',
      durationHours: 38,
      cost: 0,
      certificateAvailable: true,
      language: 'English',
      institution: {
        name: 'Google Cloud Education Consortium',
        country: 'Global',
      },
      skills: ['Kubernetes Architecture', 'VPC Peering', 'Cloud IAM Federation', 'Terraform'],
      syllabus: [
        { unit: 'Unit 1', title: 'Foundations of Compute Engine & VPC Networks' },
        { unit: 'Unit 2', title: 'GKE Cluster Operations & Ingress Routing' },
        { unit: 'Unit 3', title: 'Production Security & National Identity Federation' },
      ],
    };

  const isEnrolled = !!course.enrollment || enrollMutation.isSuccess;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased pb-20 relative overflow-x-hidden">
      {/* Background Atmospheric Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 interconnect-grid opacity-30 dark:opacity-20" />

      {/* ─── Breadcrumb Navigation ────────────────────────────────────────── */}
      <div className="border-b border-border/80 bg-card/20 py-4 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            <span>Catalogue Index</span>
          </Link>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYLLABUS REF: {course.code || 'OMC-2026-SYL'}
          </span>
        </div>
      </div>

      {/* ─── Course Header Section ─────────────────────────────────────────── */}
      <section className="border-b border-border/80 py-12 px-6 md:px-12 bg-card/10 relative z-10">
        <FadeIn direction="up" delay={0.05} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Dossier (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border/80 bg-muted/40 text-foreground font-semibold uppercase tracking-wider shadow-sm">
                {course.provider?.displayName || 'National Provider'}
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border/80 bg-background text-muted-foreground uppercase tracking-wider shadow-sm">
                {course.level || 'Intermediate'} Level
              </span>
              {course.certificateAvailable && (
                <span className="font-mono text-xs px-2.5 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider inline-flex items-center gap-1 font-semibold shadow-sm">
                  <ShieldCheck size={12} strokeWidth={1.5} />
                  Verified Credential Included
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-foreground leading-[1.15]">
              {course.title}
            </h1>

            <p className="text-base text-muted-foreground font-sans leading-relaxed max-w-3xl">
              {course.description}
            </p>

            {/* Academic Specifications Ledger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/80 font-mono text-xs">
              <div className="p-3 rounded border border-border/60 bg-muted/20">
                <span className="text-muted-foreground text-[10px] uppercase block">
                  Credit Hours
                </span>
                <span className="text-foreground text-sm font-semibold mt-0.5 block">
                  {course.durationHours || 36} hrs
                </span>
              </div>
              <div className="p-3 rounded border border-border/60 bg-muted/20">
                <span className="text-muted-foreground text-[10px] uppercase block">
                  Language
                </span>
                <span className="text-foreground text-sm font-semibold mt-0.5 block">
                  {course.language || 'English'}
                </span>
              </div>
              <div className="p-3 rounded border border-border/60 bg-muted/20">
                <span className="text-muted-foreground text-[10px] uppercase block">
                  Tuition Cost
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mt-0.5 block">
                  {course.cost === 0 ? 'Public Free Access' : `$${course.cost}`}
                </span>
              </div>
              <div className="p-3 rounded border border-border/60 bg-muted/20">
                <span className="text-muted-foreground text-[10px] uppercase block">
                  Examination
                </span>
                <span className="text-foreground text-sm font-semibold mt-0.5 block">
                  Practical Lab Audit
                </span>
              </div>
            </div>
          </div>

          {/* Action Card (Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="border border-border/80 p-6 rounded-md bg-card/60 glass-panel space-y-6 shadow-xl relative overflow-hidden">
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                  <span>ATTESTATION STATUS</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">INTERCONNECTED</span>
                </div>
                <span className="font-serif text-xl font-normal text-foreground block">
                  {isEnrolled ? 'Enrolled in Curriculum' : 'Available for Open Enrollment'}
                </span>
              </div>

              <div className="space-y-3">
                {isEnrolled ? (
                  <div className="p-3.5 border border-emerald-500/30 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs flex items-center gap-2 shadow-sm">
                    <CheckCircle2 size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="font-semibold">Synchronized with your Academic Dossier</span>
                  </div>
                ) : (
                  <button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="w-full font-mono text-xs uppercase tracking-wider py-3.5 rounded bg-foreground text-background hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <BookOpen size={14} strokeWidth={1.5} />
                    <span>Enroll & Add to Roadmap</span>
                  </button>
                )}

                <a
                  href={course.url || 'https://cloud.google.com/training'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full font-mono text-xs uppercase tracking-wider py-3 rounded border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  <span>Launch on {course.provider?.displayName || 'Provider Portal'}</span>
                </a>
              </div>

              {course.institution && (
                <div className="pt-4 border-t border-border/70 font-mono text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Building size={13} strokeWidth={1.5} />
                    <span>{course.institution.name}</span>
                  </div>
                  <p className="text-[11px]">Jurisdiction: {course.institution.country}</p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── Detailed Syllabus Units ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 relative z-10">
        <FadeIn direction="up" delay={0.1}>
          <div>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Syllabus Curriculum Units
            </h2>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Official curriculum modules and technical milestones required for credential award
            </p>
          </div>
        </FadeIn>

        <FadeInStagger staggerDelay={0.08} className="border border-border/80 rounded-md divide-y divide-border/60 bg-card/60 glass-panel shadow-sm overflow-hidden">
          {(course.syllabus || [
            { unit: 'Unit 1', title: 'Foundations of Virtual Private Cloud Networks' },
            { unit: 'Unit 2', title: 'High Availability Compute Clusters & Autoscaling' },
            { unit: 'Unit 3', title: 'Kubernetes Pod Scheduling & Service Meshes' },
          ]).map((item: any) => (
            <StaggerItem key={item.unit}>
              <div className="p-5 flex items-start gap-4 hover:bg-muted/15 transition-colors">
                <span className="font-mono text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5 font-semibold">
                  {item.unit}
                </span>
                <div className="flex-1">
                  <h3 className="font-sans font-medium text-sm text-foreground">
                    {item.title}
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-semibold">
                  Audit Required
                </span>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>

        {/* Competencies Acquired */}
        {course.skills?.length > 0 && (
          <FadeIn direction="up" delay={0.15} className="space-y-4 pt-6">
            <h3 className="font-serif text-xl font-normal text-foreground">
              Verified Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="font-mono text-xs px-3 py-1.5 rounded-sm border border-border/80 bg-card/60 glass-panel text-foreground font-medium shadow-sm hover:border-emerald-500/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </FadeIn>
        )}
      </section>
    </div>
  );
}
