import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Users,
  Network,
  GitBranch,
  Radio,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../lib/api';
import { FadeIn, FadeInStagger, StaggerItem, CountUp, AnimatePresence, motion } from '../components/motion';

const PROVIDER_STYLES: Record<string, string> = {
  coursera: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  google: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  microsoft: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  nvidia: 'border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400',
  tvet: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

const FEATURED_COURSES = [
  {
    id: 'coursera-ml-andrew-ng',
    provider: 'coursera',
    providerLabel: 'Coursera',
    title: 'Machine Learning Specialization',
    description: 'Master supervised learning, unsupervised learning, and recommender systems with Python, NumPy, scikit-learn, and TensorFlow. Taught by Andrew Ng — Stanford professor and AI pioneer.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'scikit-learn'],
    level: 'beginner',
    hours: 95,
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
  },
  {
    id: 'google-it-support',
    provider: 'google',
    providerLabel: 'Google',
    title: 'Google IT Support Professional Certificate',
    description: 'Launch a career in IT support. Learn troubleshooting, networking (TCP/IP, DNS), Linux, Windows administration, and cybersecurity basics with hands-on Qwiklabs.',
    skills: ['IT Support', 'Networking', 'Linux', 'Windows'],
    level: 'beginner',
    hours: 180,
    url: 'https://grow.google/certificates/it-support/',
  },
  {
    id: 'microsoft-az-900',
    provider: 'microsoft',
    providerLabel: 'Microsoft',
    title: 'Microsoft Azure Fundamentals (AZ-900)',
    description: 'Build foundational cloud knowledge — Azure compute, networking, storage, Azure Active Directory, security, SLAs, and pricing models. Prepares for AZ-900 certification.',
    skills: ['Azure', 'Cloud Computing', 'Azure Security', 'Azure AD'],
    level: 'beginner',
    hours: 11,
    url: 'https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/',
  },
  {
    id: 'nvidia-generative-ai',
    provider: 'nvidia',
    providerLabel: 'NVIDIA DLI',
    title: 'Generative AI Explained',
    description: 'Demystify generative AI — understand LLMs, diffusion models, prompt engineering, hallucinations, bias, and real-world applications across healthcare, finance, and engineering.',
    skills: ['Generative AI', 'LLM', 'Prompt Engineering', 'AI Ethics'],
    level: 'beginner',
    hours: 2,
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-07+V1',
  },
  {
    id: 'tvet-fullstack-diploma',
    provider: 'tvet',
    providerLabel: 'TVET Kenya',
    title: 'National Diploma in Full Stack Web Application Development',
    description: 'Comprehensive 6-month full-stack diploma: React, Node.js, PostgreSQL, Docker, GitHub Actions CI/CD, and Railway deployments. Includes team capstone and freelancing portfolio.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    level: 'intermediate',
    hours: 420,
    url: 'https://gsdap.org/tvet/fullstack-diploma',
  },
  {
    id: 'coursera-deep-learning',
    provider: 'coursera',
    providerLabel: 'Coursera',
    title: 'Deep Learning Specialization',
    description: 'Build CNNs, RNNs, LSTMs, and Transformers using TensorFlow. Projects in speech recognition, image segmentation, and music synthesis. Taught by Andrew Ng.',
    skills: ['Deep Learning', 'TensorFlow', 'CNN', 'Transformers'],
    level: 'intermediate',
    hours: 130,
    url: 'https://www.coursera.org/specializations/deep-learning',
  },
  {
    id: 'google-data-analytics',
    provider: 'google',
    providerLabel: 'Google',
    title: 'Google Data Analytics Professional Certificate',
    description: 'Master the full data analysis lifecycle — SQL, R, Tableau, and Google Analytics 4. Graduate job-ready in under 6 months with a real business capstone project.',
    skills: ['Data Analytics', 'SQL', 'R', 'Tableau'],
    level: 'beginner',
    hours: 200,
    url: 'https://grow.google/certificates/data-analytics/',
  },
  {
    id: 'microsoft-azure-openai',
    provider: 'microsoft',
    providerLabel: 'Microsoft',
    title: 'Develop Generative AI Solutions with Azure OpenAI',
    description: 'Build production AI apps using GPT-4, DALL-E, and Whisper. Covers prompt engineering, Retrieval Augmented Generation (RAG), vector search, and responsible AI deployment.',
    skills: ['Azure OpenAI', 'GPT-4', 'RAG', 'Prompt Engineering'],
    level: 'intermediate',
    hours: 22,
    url: 'https://learn.microsoft.com/en-us/training/paths/develop-ai-solutions-azure-openai/',
  },
  {
    id: 'nvidia-rag-llm',
    provider: 'nvidia',
    providerLabel: 'NVIDIA DLI',
    title: 'Building RAG Agents with LLMs',
    description: 'Build production-ready RAG systems — document parsing, NVIDIA Embed, FAISS vector databases, and LangChain pipelines for enterprise AI assistants. Rated 4.9 ★.',
    skills: ['RAG', 'LangChain', 'Vector Databases', 'Python'],
    level: 'intermediate',
    hours: 4,
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-15+V1',
  },
];

const HERO_SLIDES = [
  {
    image: '/images/hero-bg-3.jpg',
    tag: 'INDUSTRIAL SKILLS TRAINING',
    caption: 'Workplace Safety Induction & On-Site Technical Workforce Development',
  },
  {
    image: '/images/hero-bg-1.jpg',
    tag: 'VOCATIONAL ENGINEERING',
    caption: 'Hands-on Technical Apprenticeship & Applied Metal Fabrication Workshops',
  },
  {
    image: '/images/hero-bg-2.jpg',
    tag: 'APPLIED ELECTRONICS',
    caption: 'Electrical Systems Engineering & Hardware Circuitry Laboratories',
  },
];

const INSTITUTIONAL_PARTNERS = [
  { name: 'Google Cloud', role: 'Cloud Infrastructure & Kubernetes Curricula' },
  { name: 'Coursera & Universities', role: 'Distributed Systems & Microservices' },
  { name: 'Microsoft Learn', role: 'Enterprise Security & Azure Governance' },
  { name: 'NVIDIA DLI', role: 'Accelerated GPU Computing & CUDA Semantics' },
  { name: 'TVET National Institutes', role: 'Vocational Engineering Standards & Accreditation' },
];

const CURRICULUM_PILLARS = [
  {
    code: '01',
    title: 'Aggregated Global & Vocational Curricula',
    description:
      'Rather than isolating coursework across disjointed corporate portals, GSDAP (Ghana Student Digital Access Programme) unifies official syllabi from Google, Microsoft, NVIDIA, and TVET colleges into a unified academic progression.',
  },
  {
    code: '02',
    title: 'Verifiable National Credentials',
    description:
      'Every completed module is certified by its issuing institution and cryptographically sealed on the National Learner Registry with an immutable verification identifier.',
  },
  {
    code: '03',
    title: 'Engineered for Low Bandwidth & 2G/3G Caching',
    description:
      'Optimized for mobile-first and low-bandwidth learners across sub-Saharan Africa and emerging regions. Offline text caching and low-data modes enable continuous study without streaming video overhead.',
  },
  {
    code: '04',
    title: 'Mentor-Led Guilds & Capstone Defenses',
    description:
      'Learners collaborate in regional study cohorts guided by accredited senior engineers. Complete real-world capstone projects evaluated by academic and industry panels.',
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const { data: statsData } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: () => catalogApi.stats().then((r) => r.data.data).catch(() => null),
  });

  const enrolledCount = statsData?.milestoneProgress ?? 14820;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-500/20 font-sans relative overflow-x-hidden">
      {/* Background Interconnected Atmospheric Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 interconnect-grid opacity-30 dark:opacity-20" />
      <div className="fixed -top-40 right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* ─── 1. Asymmetric Editorial Hero with Dynamic Background Carousel ─── */}
      <section className="border-b border-border/80 py-16 md:py-24 px-6 md:px-12 relative z-10 overflow-hidden min-h-[640px] flex items-center">
        {/* Dynamic Background Image Carousel with Clean Fadein-Out Crossfade */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
            />
          </AnimatePresence>
          {/* Subtle editorial overlays for perfect contrast and typographic legibility */}
          <div className="absolute inset-0 bg-background/55 dark:bg-background/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/55 to-background/25 dark:from-background/85 dark:via-background/60 dark:to-background/30" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          {/* Left Editorial Headline (7 Cols) */}
          <FadeIn direction="up" delay={0.05} className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Public Service Initiative
              </span>
              <span>·</span>
              <span>National Educational Consortium</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2026–2030 Mandate</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.08]">
              Consolidated Technical Training for One Million Professional Learners.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-2xl leading-relaxed">
              One platform unifying accredited engineering curricula from{' '}
              <strong className="text-foreground font-medium">
                Coursera, Google Cloud, Microsoft, NVIDIA, and TVET vocational institutions
              </strong>
              . Structured roadmaps, verifiable credentials, and low-bandwidth access designed for national scale.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 font-mono text-xs">
              <Link
                to="/dashboard"
                className="px-6 py-3.5 bg-foreground text-background hover:opacity-90 transition-all font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg active:scale-95"
              >
                <span>Enter Learner Academic Registry</span>
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>

              <Link
                to="/catalog"
                className="px-6 py-3.5 border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all font-semibold uppercase tracking-wider inline-flex items-center gap-2 glass-panel shadow-sm active:scale-95"
              >
                <span>Review Course Catalogue</span>
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Clean Carousel Navigation Indicators */}
            <div className="pt-2 flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      currentSlide === idx
                        ? 'w-8 bg-emerald-500'
                        : 'w-2 bg-border hover:bg-muted-foreground'
                    }`}
                    title={slide.tag}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {HERO_SLIDES[currentSlide].tag} · {HERO_SLIDES[currentSlide].caption}
              </span>
            </div>
          </FadeIn>

          {/* Right Registry Ledger & Interconnected Metric (4 Cols) */}
          <FadeIn direction="up" delay={0.15} className="lg:col-span-4">
            <div className="border border-border/80 p-6 rounded-md bg-card/75 glass-panel space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    NATIONAL REGISTRY AUDIT STATUS
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    LIVE
                  </span>
                </div>
                <span className="font-serif text-2xl font-normal text-foreground block">
                  Official Operational Ledger
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">
                    Synchronized Enrolled Learners
                  </span>
                  <span className="font-serif text-3xl font-medium text-foreground">
                    <CountUp end={enrolledCount} duration={2.2} />
                  </span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    Benchmark: National Tier-1 Cohort Target (1,000,000)
                  </span>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <span className="text-muted-foreground text-[10px] uppercase block">
                    Accredited Curricular Providers
                  </span>
                  <span className="text-foreground font-semibold">
                    5 Global & Technical Institutions
                  </span>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <span className="text-muted-foreground text-[10px] uppercase block">
                    Network Footprint
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Radio size={12} className="text-emerald-600 dark:text-emerald-400" />
                    Low-Latency CDN & Offline PWA Active
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/70">
                <Link
                  to="/dashboard/roadmap"
                  className="text-xs font-mono uppercase text-foreground hover:underline inline-flex items-center gap-1.5 font-semibold group"
                >
                  <span>Inspect Curriculum Blueprint</span>
                  <ArrowRight size={13} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 2. Institutional Provider Attribution ─────────────────────────── */}
      <section className="border-b border-border/80 py-12 px-6 md:px-12 bg-background/50 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Network size={13} className="text-emerald-600 dark:text-emerald-400" />
              Accredited Institutional Partners
            </span>
            <span>Joint Certification Standard</span>
          </div>

          <FadeInStagger staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INSTITUTIONAL_PARTNERS.map((partner) => (
              <StaggerItem key={partner.name}>
                <div className="border border-border/80 p-4 rounded-md bg-card/60 glass-panel flex flex-col justify-between space-y-2 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 h-full group">
                  <div className="flex items-center gap-2">
                    <Building size={14} strokeWidth={1.5} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    <span className="font-serif text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {partner.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans leading-snug">
                    {partner.role}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ─── 3. Featured Course Catalogue ────────────────────────────────────── */}
      <section className="border-b border-border/80 py-20 px-6 md:px-12 bg-card/10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <FadeIn direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  <Zap size={13} className="text-emerald-600 dark:text-emerald-400" />
                  Featured Course Catalogue — All 5 Providers
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                  Accredited Programmes, Zero Tuition.
                </h2>
                <p className="text-sm text-muted-foreground font-sans mt-2 max-w-2xl leading-relaxed">
                  Every course listed below is officially accredited, freely accessible, and issues a verifiable certificate upon completion.
                  Curated from Coursera, Google, Microsoft, NVIDIA, and TVET Kenya.
                </p>
              </div>
              <Link
                to="/catalog"
                className="shrink-0 font-mono text-xs uppercase px-5 py-3 border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all font-semibold inline-flex items-center gap-2 glass-panel shadow-sm active:scale-95 whitespace-nowrap"
              >
                <span>View Full Catalogue</span>
                <ArrowUpRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </FadeIn>

          <FadeInStagger staggerDelay={0.07} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_COURSES.map((course) => (
              <StaggerItem key={course.id}>
                <div className="border border-border/80 rounded-md bg-card/60 glass-panel p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-500 transition-colors" />
                  <div className="space-y-3">
                    {/* Provider + Level badge row */}
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded-sm border font-semibold ${PROVIDER_STYLES[course.provider] ?? 'border-border/60 bg-muted/30 text-muted-foreground'}`}>
                        {course.providerLabel}
                      </span>
                      <span className="text-muted-foreground border border-border/60 bg-muted/20 px-2 py-0.5 rounded-sm capitalize">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-medium text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Skills chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={11} strokeWidth={1.5} />
                        {course.hours}h
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <ShieldCheck size={11} strokeWidth={1.5} />
                        Free Cert
                      </span>
                    </div>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors"
                    >
                      <span>Enroll</span>
                      <ArrowUpRight size={12} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ─── 4. Architectural Principles with Interconnected Visual Conduit ─── */}

      <section className="border-b border-border/80 py-20 px-6 md:px-12 bg-card/10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <FadeIn direction="up">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                <GitBranch size={13} className="text-emerald-600 dark:text-emerald-400" />
                System Architecture & Methodology
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                Built with Institutional Rigour, Designed for Constrained Bandwidth.
              </h2>
            </div>
          </FadeIn>

          <FadeInStagger staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CURRICULUM_PILLARS.map((pillar) => (
              <StaggerItem key={pillar.code}>
                <div className="border border-border/80 p-8 rounded-md bg-card/60 glass-panel flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 relative group">
                  {/* Subtle top indicator line */}
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-500 transition-colors" />

                  <div className="space-y-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-sm border border-border/80 bg-muted/40 text-foreground font-bold inline-block shadow-sm">
                      INDEX {pillar.code}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 font-mono text-xs text-muted-foreground flex items-center justify-between">
                    <span>STANDARD SPECIFICATION // GSDAP-REQ-{pillar.code}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">VERIFIED NODE</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ─── 4. Call to Technical Enrollment ───────────────────────────────── */}
      <section
        className="relative py-28 md:py-36 px-6 md:px-12 overflow-hidden z-10 border-t border-border bg-card dark:bg-slate-950 text-foreground dark:text-white"
        style={{ backgroundImage: 'url(/images/cta-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        {/* Responsive backdrop overlay ensuring crystal-clear text readability in both light (white) and dark modes */}
        <div className="absolute inset-0 bg-background/90 dark:bg-slate-950/85 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-950/40 mix-blend-multiply dark:mix-blend-color" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background dark:via-slate-950/40 dark:to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70 dark:from-slate-950/60 dark:via-transparent dark:to-slate-950/60" />

        <FadeIn direction="up" className="relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-7">

            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-emerald-600/30 dark:border-emerald-500/40 px-3.5 py-1.5 rounded bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 shadow-sm backdrop-blur-sm">
              <ShieldCheck size={14} strokeWidth={1.7} className="text-emerald-700 dark:text-emerald-400" />
              <span>Open Access to Verified Education</span>
            </div>

            <h2 className="font-serif text-4xl md:text-6xl font-normal tracking-tight text-foreground dark:text-white max-w-3xl mx-auto leading-tight drop-shadow-sm">
              Initiate Your Certified Engineering Journey.
            </h2>

            <p className="text-sm md:text-lg text-muted-foreground dark:text-white/80 font-sans max-w-xl mx-auto leading-relaxed">
              Create an academic dossier in 30 seconds. Access official curricula from Google, Microsoft, NVIDIA, and TVET colleges — zero tuition, verified credentials.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs">
              <Link
                to="/login"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 transition-all font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95"
              >
                <span>Access Learner Registry</span>
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link
                to="/catalog"
                className="px-6 py-4 border border-border bg-card/90 hover:bg-muted text-foreground dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all font-semibold uppercase tracking-wider backdrop-blur-sm shadow-md active:scale-95"
              >
                Examine Course Syllabus
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
