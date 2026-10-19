import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/20 text-foreground antialiased font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Institution Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-foreground flex items-center justify-center font-mono text-[10px] font-bold">
                OM
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
                One Million Coders
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-sans">
              A national and global education aggregator unifying technical training from Coursera, Google Cloud, Microsoft Learn, NVIDIA Deep Learning Institute, and TVET vocational colleges.
            </p>

            <div className="font-mono text-[11px] text-muted-foreground pt-2">
              <p>NATIONAL CURRICULUM ACCREDITATION BOARD</p>
              <p className="mt-0.5">REGISTRY PROTOCOL VERSION 2026.4</p>
            </div>
          </div>

          {/* Institutional Partners */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Accredited Partners
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/catalog?provider=google" className="hover:text-foreground transition-colors">
                  Google Cloud Skills Boost
                </Link>
              </li>
              <li>
                <Link to="/catalog?provider=coursera" className="hover:text-foreground transition-colors">
                  Coursera & University Programs
                </Link>
              </li>
              <li>
                <Link to="/catalog?provider=microsoft" className="hover:text-foreground transition-colors">
                  Microsoft Learn Technical
                </Link>
              </li>
              <li>
                <Link to="/catalog?provider=nvidia" className="hover:text-foreground transition-colors">
                  NVIDIA Deep Learning Institute
                </Link>
              </li>
              <li>
                <Link to="/catalog?provider=tvet" className="hover:text-foreground transition-colors">
                  TVET National Technology Colleges
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Portal Links */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Registry & Services
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <Link to="/catalog" className="hover:text-foreground transition-colors">
                Course Catalogue
              </Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">
                Academic Dossier
              </Link>
              <Link to="/dashboard/roadmap" className="hover:text-foreground transition-colors">
                Curriculum Roadmap
              </Link>
              <Link to="/dashboard/credentials" className="hover:text-foreground transition-colors">
                Verified Credentials
              </Link>
              <Link to="/cohorts" className="hover:text-foreground transition-colors">
                Study Cohorts
              </Link>
              <Link to="/settings" className="hover:text-foreground transition-colors">
                Low-Bandwidth Mode
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-muted-foreground">
          <p>© 2026 One Million Coders Consortium. Public Service Educational Framework.</p>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hover:text-foreground transition-colors">
              Data Sovereignty
            </Link>
            <span>·</span>
            <Link to="/catalog" className="hover:text-foreground transition-colors">
              Syllabus Guidelines
            </Link>
            <span>·</span>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Registry Node Status: OK
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
