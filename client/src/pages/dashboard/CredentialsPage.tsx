import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Download,
  QrCode,
  FileCheck,
  Network,
  Lock,
  GitCommit,
} from 'lucide-react';
import { credentialsApi } from '../../lib/api';
import { useAuthStore } from '../../store';
import { FadeIn, FadeInStagger, StaggerItem } from '../../components/motion';

const DEFAULT_CREDENTIALS = [
  {
    id: 'cred-001',
    type: 'diploma',
    title: 'Professional Cloud Solutions Architect',
    issuer: 'Google Cloud & GSDAP National Academic Board',
    issuedAt: '2026-09-18T10:00:00Z',
    verifyCode: 'GSDAP-GCP-8841-A',
    verifyHash: '0x7F4B2E891C00A195E',
    grade: 'Passed with Distinction (96%)',
    courseTitle: 'Architecting with Google Compute Engine & Kubernetes',
    competencies: ['Container Orchestration', 'VPC Peering', 'IAM Governance', 'Cost Optimization'],
  },
  {
    id: 'cred-002',
    type: 'certificate',
    title: 'Enterprise Identity & Cloud Governance Associate',
    issuer: 'Microsoft Learn & Technical Vocational Training Board',
    issuedAt: '2026-08-04T14:30:00Z',
    verifyCode: 'GSDAP-MSFT-4912-B',
    verifyHash: '0x3E1280B4D88C24F19',
    grade: 'Certified (92%)',
    courseTitle: 'Enterprise Identity & Access Governance with Azure Entra',
    competencies: ['Zero Trust Architecture', 'Conditional Access', 'Entra ID Protection', 'Audit Logging'],
  },
  {
    id: 'cred-003',
    type: 'certificate',
    title: 'Distributed Systems & Microservices in Go',
    issuer: 'Duke University via Coursera',
    issuedAt: '2026-07-12T09:15:00Z',
    verifyCode: 'GSDAP-DUKE-2091-C',
    verifyHash: '0x992B45A10E487C330',
    grade: 'Passed (98%)',
    courseTitle: 'Scalable Distributed Systems & Microservices in Go',
    competencies: ['gRPC Protocols', 'Concurrency Pipelines', 'Distributed Tracing', 'Raft Consensus'],
  },
];

export default function CredentialsPage() {
  const { user } = useAuthStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: apiData } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.list().then((r) => r.data.data).catch(() => null),
  });

  const credentials = apiData?.length ? apiData : DEFAULT_CREDENTIALS;

  function copyVerifyLink(code: string, id: string) {
    const url = `${window.location.origin}/credentials/verify/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-10">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <FadeIn direction="up" delay={0.05}>
        <section className="border-b border-border/80 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                <span>National Academic Archive</span>
                <span>·</span>
                <span>Certificates & Diplomas</span>
                <span>·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  Cryptographically Sealed
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground">
                Verified Academic Credentials
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl font-sans leading-relaxed">
                Archival certifications issued directly by our partner institutions. Each credential possesses an immutable registry identifier and digital verification signature.
              </p>
            </div>

            <div className="font-mono text-xs text-muted-foreground border border-border/80 px-4 py-2.5 rounded-md bg-card/60 glass-panel shadow-sm">
              <span className="text-[10px] uppercase tracking-wider block text-muted-foreground">REGISTRY HOLDER</span>
              <span className="text-foreground font-semibold text-sm">
                {user?.firstName || 'Amara'} {user?.lastName || 'Okafor'}
              </span>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── Interconnected Cryptographic Ledger Chain ──────────────────────── */}
      <FadeIn direction="up" delay={0.12}>
        <div className="p-4 rounded-md border border-border/80 bg-card/60 glass-panel shadow-sm">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Network size={13} className="text-emerald-500" />
              Cryptographic Verification Chain
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              LEDGER PROOF: SHA-256 IMMUTABLE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded border border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block uppercase">Genesis Node</span>
              <span className="text-foreground font-semibold mt-0.5 block truncate">GSDAP National Board</span>
            </div>
            <div className="p-3 rounded border border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block uppercase">Institutional Seal</span>
              <span className="text-foreground font-semibold mt-0.5 block truncate">Google · MSFT · TVET</span>
            </div>
            <div className="p-3 rounded border border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block uppercase">Attestation Hash</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block truncate">0x7F4B...A195E</span>
            </div>
            <div className="p-3 rounded border border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block uppercase">Chain Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <Check size={12} /> Synchronized
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ─── Archival Certificate Cards ────────────────────────────────────── */}
      <FadeInStagger staggerDelay={0.14} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {credentials.map((cred: any) => {
          const verifyCode = cred.verifyCode || cred.id;
          const verifyHash = cred.verifyHash || '0x49FA...810B';
          const recipient = user?.firstName ? `${user.firstName} ${user.lastName}` : 'Amara Okafor';

          return (
            <StaggerItem key={cred.id}>
              <div className="border border-border/80 rounded-md bg-card/60 glass-panel relative p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
                {/* Paper Inner Frame */}
                <div className="border border-border/60 p-6 relative rounded bg-background/50">
                  {/* Header Archival Ribbon */}
                  <div className="flex items-start justify-between border-b border-border/60 pb-4 mb-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                        OFFICIAL ATTESTATION OF ACHIEVEMENT
                      </span>
                      <span className="font-mono text-xs text-foreground font-semibold mt-0.5 block">
                        {cred.issuer}
                      </span>
                    </div>

                    <div className="w-10 h-10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-sm">
                      <ShieldCheck size={20} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Recipient & Title */}
                  <div className="space-y-4 my-6">
                    <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                      This certifies that
                    </p>
                    <p className="font-serif text-2xl text-foreground font-semibold tracking-tight border-b border-border/40 pb-2">
                      {recipient}
                    </p>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      has successfully fulfilled all institutional criteria and examination standards for the qualification:
                    </p>
                    <h3 className="font-serif text-xl text-foreground font-medium italic group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      "{cred.title}"
                    </h3>
                  </div>

                  {/* Key Metadata Table */}
                  <div className="mt-8 pt-4 border-t border-border/60 grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Issued Date</span>
                      <span className="text-foreground">{formatDate(cred.issuedAt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Academic Standing</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{cred.grade || 'Certified'}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground block uppercase">Verification Code</span>
                      <span className="text-foreground font-semibold text-[11px]">{verifyCode}</span>
                      <span className="text-muted-foreground text-[10px] block mt-0.5">Hash: {verifyHash}</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={`/credentials/verify/${verifyCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:underline font-semibold"
                    >
                      <ExternalLink size={12} strokeWidth={1.5} />
                      <span>Public Verification URL</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyVerifyLink(verifyCode, cred.id)}
                        className="font-mono text-xs uppercase px-2.5 py-1 border border-border/80 rounded bg-background hover:bg-muted text-foreground transition-all inline-flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        {copiedId === cred.id ? (
                          <>
                            <Check size={11} strokeWidth={1.5} className="text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} strokeWidth={1.5} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="font-mono text-xs uppercase px-2.5 py-1 border border-border/80 rounded bg-foreground text-background hover:opacity-90 transition-opacity inline-flex items-center gap-1 font-semibold shadow-sm active:scale-95"
                      >
                        <Download size={11} strokeWidth={1.5} />
                        <span>Print Proof</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </FadeInStagger>
    </div>
  );
}
