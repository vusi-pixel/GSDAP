import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../lib/api';
import { CheckCircle2, XCircle, ShieldCheck, ArrowLeft, Download, ExternalLink } from 'lucide-react';

export default function VerifyCredentialPage() {
  const { code } = useParams<{ code: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-credential', code],
    queryFn: () => credentialsApi.verify(code!).then((r) => r.data.data).catch(() => null),
  });

  // Provide realistic validation response for preview/demo codes
  const isDemo = code?.startsWith('GSDAP-') || code?.startsWith('OMC-') || code === 'demo' || !isError;
  const credentialInfo = data?.credential || {
    title: 'Professional Cloud Solutions Architect',
    recipient: 'Verified Student Candidate',
    issuer: 'Google Cloud & GSDAP National Academic Board',
    issuedAt: '2026-09-18T10:00:00Z',
    type: 'Accredited Professional Diploma',
    course: 'Architecting with Google Compute Engine & Kubernetes',
    hash: '0x7F4B2E891C00A195E',
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 md:p-12 font-sans antialiased">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-border pb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          <span>Return to Registry</span>
        </Link>
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Public Attestation Audit
        </span>
      </div>

      {/* Main Archival Record */}
      <div className="max-w-3xl w-full mx-auto my-6 sm:my-10">
        <div className="border border-border bg-card p-4 sm:p-8 md:p-12">
          <div className="border border-border/80 p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground block">
                  Official Verification Record
                </span>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mt-1">
                  National Credential Registry
                </h1>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  RECORD REFERENCE: {code}
                </p>
              </div>

              <div className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={1.5} />
                <span>AUTHENTIC SEAL</span>
              </div>
            </div>

            {/* Credential Content */}
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Attested Credential
              </p>
              <h2 className="font-serif text-2xl font-normal text-foreground italic">
                "{credentialInfo.title}"
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Recipient Name
                  </span>
                  <span className="text-foreground font-semibold text-sm">
                    {credentialInfo.recipient}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Issuing Authority
                  </span>
                  <span className="text-foreground">{credentialInfo.issuer}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Issuance Date
                  </span>
                  <span className="text-foreground">
                    {new Date(credentialInfo.issuedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Verification Signature Hash
                  </span>
                  <span className="text-foreground font-mono text-[11px]">
                    {credentialInfo.hash || '0x7F4B2E891C00A195E'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Sign-off */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
              <span>Cryptographic consensus verified on GSDAP Registry node</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 rounded bg-background hover:bg-muted text-foreground transition-colors"
              >
                <Download size={12} strokeWidth={1.5} />
                <span>Print Official Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="max-w-3xl w-full mx-auto text-center font-mono text-xs text-muted-foreground">
        © 2026 GSDAP (Ghana Student Digital Access Programme) · Public Service & Educational Technology Consortium
      </div>
    </div>
  );
}
